import { GitmonError } from "../github/errors";
import type { GitHubRepo, GitHubUser } from "../github/types";
import { ELEMENT_CHAIN, elementForLanguage } from "./elements";
import {
  clamp,
  costForDamage,
  roundDamage,
  roundToTen,
  truncate,
  year,
  yearsSince,
} from "./format";
import { rarityForScore } from "./rarity";
import type { Attack, Card, Element } from "./types";

/**
 * Carta de perfil. Fórmulas travadas na RFC 6.1 — os pesos não são invenção
 * daqui e não devem ser ajustados sem atualizar a RFC junto.
 */
export function buildProfileCard(
  user: GitHubUser,
  repos: GitHubRepo[],
  now: Date = new Date(),
): Card {
  // Organizações estão fora da v1 (RFC 9.5). Detectar e falhar explicitamente é
  // melhor do que gerar uma carta com dados que não significam a mesma coisa.
  if (user.type === "Organization") {
    throw new GitmonError(
      "organization",
      `${user.login} é uma organização. A v1 gera carta apenas para usuários.`,
      user.login,
    );
  }

  // "Repos próprios" (RFC 6.1): fork não é obra do dev e inflaria o scoring.
  const owned = repos.filter((repo) => !repo.fork);
  const totalStars = owned.reduce((sum, repo) => sum + repo.stargazers_count, 0);
  const accountAge = yearsSince(user.created_at, now);

  const hp = roundToTen(
    clamp(30 + totalStars * 3 + user.followers * 1 + user.public_repos * 2, 30, 250),
  );

  const languages = rankLanguages(owned);
  const element = elementForLanguage(languages[0]?.language ?? null);

  // Fraqueza vem da segunda linguagem mais frequente (RFC 6.1). Quem só escreve
  // numa linguagem não tem segunda — cai na cadeia genérica (RFC 4.4).
  const secondary = languages[1]?.language;
  const weakness: Element | null = secondary
    ? elementForLanguage(secondary)
    : ELEMENT_CHAIN[element].weakTo;

  const score =
    totalStars * 2 + user.followers * 3 + user.public_repos + accountAge * 5;

  return {
    kind: "profile",
    id: user.login,
    name: user.name?.trim() || user.login,
    element,
    hp,
    attacks: attacksFromRepos(owned),
    // Uma carta não pode ser fraca e resistente ao mesmo elemento: quando a
    // segunda linguagem colide com a resistência da cadeia, a fraqueza vence.
    weakness,
    resistance:
      ELEMENT_CHAIN[element].resists === weakness
        ? null
        : ELEMENT_CHAIN[element].resists,
    retreat: clamp(Math.round(accountAge / 2), 1, 4),
    rarity: rarityForScore(score),
    artUrl: user.avatar_url,
    footer: profileFooter(user),
    stats: [
      { labelKey: "stat.stars", value: totalStars },
      { labelKey: "stat.followers", value: user.followers },
      { labelKey: "stat.repos", value: user.public_repos },
      // String, não número: ano formatado como número vira "2.011".
      { labelKey: "stat.since", value: String(year(user.created_at)) },
    ],
    sourceUrl: user.html_url,
  };
}

/** Linguagens ordenadas por frequência ponderada por estrelas (RFC 6.1). */
function rankLanguages(
  repos: GitHubRepo[],
): Array<{ language: string; weight: number }> {
  const weights = new Map<string, number>();

  for (const repo of repos) {
    if (!repo.language) continue;
    // +1 por repositório e +1 por estrela: um repo com tração pesa mais que um
    // repo vazio, mas dez repos pequenos ainda contam.
    const weight = 1 + repo.stargazers_count;
    weights.set(repo.language, (weights.get(repo.language) ?? 0) + weight);
  }

  return [...weights.entries()]
    .map(([language, weight]) => ({ language, weight }))
    // Desempate alfabético para a carta não mudar entre duas gerações iguais.
    .sort((a, b) => b.weight - a.weight || a.language.localeCompare(b.language));
}

/** Os 2 repositórios mais estrelados viram ataques (RFC 6.1). */
function attacksFromRepos(repos: GitHubRepo[]): Attack[] {
  return [...repos]
    .sort(
      (a, b) =>
        b.stargazers_count - a.stargazers_count || a.name.localeCompare(b.name),
    )
    .slice(0, 2)
    .map((repo) => {
      const damage = roundDamage(clamp(repo.stargazers_count * 4, 10, 300));
      return {
        name: truncate(repo.name, 22),
        cost: costForDamage(damage),
        damage,
        text: repo.description ? truncate(repo.description, 64) : "",
      };
    });
}

/** Bio truncada + ano de criação da conta (RFC 6.1). Factual, sem flavor text. */
function profileFooter(user: GitHubUser): string {
  const since = year(user.created_at);
  const bio = user.bio ? truncate(user.bio, 72) : "";
  return bio ? `${bio} · ${since}` : `${since}`;
}
