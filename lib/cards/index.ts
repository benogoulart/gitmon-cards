import { cached } from "../cache/redis";
import { CARD_DATA_TTL_SECONDS } from "../config";
import {
  fetchRepo,
  fetchRepoContributors,
  fetchUser,
  fetchUserRepos,
} from "../github/client";
import { GitmonError } from "../github/errors";
import { buildProfileCard } from "./profile";
import { buildRepoCard } from "./repo";
import type { Card } from "./types";

export * from "./types";
export { buildProfileCard } from "./profile";
export { buildRepoCard } from "./repo";

/**
 * Versão do formato da carta. Entra na chave de cache: mudou fórmula ou campo,
 * incrementa aqui e o cache antigo simplesmente deixa de ser lido — mais seguro
 * do que invalidar chave por chave.
 */
const CARD_VERSION = "v1";

const LOGIN = /^[a-zA-Z0-9](?:[a-zA-Z0-9]|-(?=[a-zA-Z0-9])){0,38}$/;
const REPO_NAME = /^[a-zA-Z0-9._-]{1,100}$/;

export function isValidLogin(login: string): boolean {
  return LOGIN.test(login);
}

export function isValidRepoName(name: string): boolean {
  return REPO_NAME.test(name) && name !== "." && name !== "..";
}

export async function getProfileCard(login: string): Promise<Card> {
  if (!isValidLogin(login)) {
    throw new GitmonError("not_found", `Login inválido: ${login}`, login);
  }

  return cached(
    `card:${CARD_VERSION}:profile:${login.toLowerCase()}`,
    CARD_DATA_TTL_SECONDS,
    async () => {
      const user = await fetchUser(login);
      // Organização não tem repositório próprio no sentido do scoring — falha
      // antes de gastar a segunda requisição (RFC 9.5).
      if (user.type === "Organization") {
        return buildProfileCard(user, []);
      }
      const repos = await fetchUserRepos(login);
      return buildProfileCard(user, repos);
    },
  );
}

export async function getRepoCard(owner: string, name: string): Promise<Card> {
  if (!isValidLogin(owner) || !isValidRepoName(name)) {
    throw new GitmonError("not_found", `Repositório inválido: ${owner}/${name}`);
  }

  return cached(
    `card:${CARD_VERSION}:repo:${owner.toLowerCase()}/${name.toLowerCase()}`,
    CARD_DATA_TTL_SECONDS,
    async () => {
      const repo = await fetchRepo(owner, name);
      const contributors = await fetchRepoContributors(owner, name);
      return buildRepoCard(repo, contributors);
    },
  );
}

/** Resolve `torvalds` ou `facebook/react` para a carta correspondente. */
export async function getCard(id: string): Promise<Card> {
  const [owner, name, ...rest] = id.split("/");
  if (rest.length > 0) {
    throw new GitmonError("not_found", `Identificador inválido: ${id}`);
  }
  return name ? getRepoCard(owner, name) : getProfileCard(owner);
}
