import { GitmonError } from "./errors";
import type { GitHubContributor, GitHubRepo, GitHubUser } from "./types";

const API = "https://api.github.com";

/**
 * Token de app no servidor (RFC 5). O visitante nunca faz login — é isso que
 * mantém a fricção zero que faz a fórmula funcionar.
 */
function authHeaders(): HeadersInit {
  const token = process.env.GITHUB_TOKEN?.trim();
  if (!token) {
    throw new GitmonError(
      "no_token",
      "GITHUB_TOKEN não configurado. Sem token o limite é 60 req/h por IP.",
    );
  }
  return {
    Authorization: `Bearer ${token}`,
    Accept: "application/vnd.github+json",
    "X-GitHub-Api-Version": "2022-11-28",
    "User-Agent": "gitmon-cards",
  };
}

async function request<T>(path: string): Promise<T> {
  let response: Response;
  try {
    response = await fetch(`${API}${path}`, {
      headers: authHeaders(),
      // O cache é nosso, no Redis. Não queremos duas camadas discordando.
      cache: "no-store",
    });
  } catch (cause) {
    throw new GitmonError("upstream", "Falha de rede ao consultar a API do GitHub.", String(cause));
  }

  if (response.ok) {
    return (await response.json()) as T;
  }

  if (response.status === 404) {
    throw new GitmonError("not_found", `Recurso não encontrado: ${path}`);
  }

  // 403 com o contador zerado é rate limit; 403 com contador sobrando é outra
  // coisa (abuso, token sem escopo) e não deve ser reportado como rate limit.
  const remaining = response.headers.get("x-ratelimit-remaining");
  if ((response.status === 403 || response.status === 429) && remaining === "0") {
    const reset = response.headers.get("x-ratelimit-reset");
    throw new GitmonError(
      "rate_limit",
      "Limite de requisições da API do GitHub atingido.",
      reset ?? undefined,
    );
  }

  throw new GitmonError(
    "upstream",
    `API do GitHub respondeu ${response.status}.`,
    await response.text().catch(() => undefined),
  );
}

export async function fetchUser(login: string): Promise<GitHubUser> {
  return request<GitHubUser>(`/users/${encodeURIComponent(login)}`);
}

/**
 * Até 100 repositórios, ordenados por atualização (RFC 6.1). Um único page —
 * quem tem mais de 100 repos já tem sinal de sobra para o scoring, e cada página
 * extra é uma requisição a mais contra o rate limit.
 */
export async function fetchUserRepos(login: string): Promise<GitHubRepo[]> {
  return request<GitHubRepo[]>(
    `/users/${encodeURIComponent(login)}/repos?per_page=100&sort=updated&type=owner`,
  );
}

export async function fetchRepo(owner: string, repo: string): Promise<GitHubRepo> {
  return request<GitHubRepo>(
    `/repos/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}`,
  );
}

/**
 * Top contribuidores, usados como ataques da carta de repositório.
 *
 * Falha silenciosamente para lista vazia: repositórios muito grandes fazem o
 * GitHub responder 202 enquanto calcula, e um repo sem ataques ainda é uma carta
 * válida. Não vale derrubar a carta inteira por isso.
 */
export async function fetchRepoContributors(
  owner: string,
  repo: string,
): Promise<GitHubContributor[]> {
  try {
    const contributors = await request<GitHubContributor[]>(
      `/repos/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}/contributors?per_page=10`,
    );
    return Array.isArray(contributors) ? contributors : [];
  } catch {
    return [];
  }
}
