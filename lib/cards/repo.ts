import type { GitHubContributor, GitHubRepo } from "../github/types";
import { ELEMENT_CHAIN, elementForLanguage } from "./elements";
import {
  clamp,
  costForDamage,
  daysSince,
  roundDamage,
  roundToTen,
  truncate,
  year,
} from "./format";
import { rarityForScore } from "./rarity";
import type { Attack, Card } from "./types";

/**
 * Carta de repositório. A RFC 6.2 deixou as fórmulas em aberto (questão Q2); o
 * que está aqui fecha a questão. Duas escolhas merecem justificativa:
 *
 * 1. **Escala logarítmica**, ao contrário da carta de perfil (RFC 6.1, linear).
 *    A distribuição de estrelas por repositório tem cauda longa demais: no
 *    linear, qualquer repo com ~70 estrelas já satura o HP em 250 e todo repo
 *    popular vira a mesma carta. O log espalha de 40 a ~240 ao longo de cinco
 *    ordens de grandeza, que é o intervalo real do GitHub.
 *
 * 2. **`open_issues_count` vira custo de recuo, não fraqueza** (questão Q5). A
 *    RFC 6.2 propôs "fraqueza a manutenção", mas "manutenção" não é um dos 7
 *    elementos e criar um oitavo quebraria a cadeia inteira e o motor de
 *    batalha. Recuo caro carrega a mesma leitura — um repo com fila grande de
 *    issues é mais difícil de largar — sem furar o sistema de tipos.
 */
export function buildRepoCard(
  repo: GitHubRepo,
  contributors: GitHubContributor[],
  now: Date = new Date(),
): Card {
  const element = elementForLanguage(repo.language);

  const hp = roundToTen(
    clamp(
      40 + 30 * Math.log10(1 + repo.stargazers_count) + 10 * Math.log10(1 + repo.forks_count),
      40,
      250,
    ),
  );

  const score =
    repo.stargazers_count * 2 + repo.forks_count * 3 + freshnessBonus(repo, now);

  return {
    kind: "repo",
    id: repo.full_name,
    name: truncate(repo.name, 24),
    element,
    hp,
    attacks: attacksFrom(repo, contributors),
    weakness: ELEMENT_CHAIN[element].weakTo,
    resistance: ELEMENT_CHAIN[element].resists,
    // 1 pip por 50 issues abertas, teto de 4. Ver justificativa (2) acima.
    retreat: clamp(1 + Math.floor(repo.open_issues_count / 50), 1, 4),
    rarity: rarityForScore(score),
    // Atribuído fora daqui — ver `withSerial` em `./serial.ts`.
    serial: null,
    artUrl: repo.owner.avatar_url,
    footer: repoFooter(repo),
    stats: [
      { labelKey: "stat.stars", value: repo.stargazers_count },
      { labelKey: "stat.forks", value: repo.forks_count },
      { labelKey: "stat.issues", value: repo.open_issues_count },
      // String, não número: ano formatado como número vira "2.013".
      { labelKey: "stat.since", value: String(year(repo.created_at)) },
    ],
    sourceUrl: repo.html_url,
  };
}

/**
 * Repositório mantido vale mais que repositório abandonado com as mesmas
 * estrelas — é o único sinal de raridade que não é acumulativo, e o único que
 * pode cair com o tempo.
 */
function freshnessBonus(repo: GitHubRepo, now: Date): number {
  if (repo.archived) return 0;
  const days = daysSince(repo.pushed_at, now);
  if (days <= 7) return 300;
  if (days <= 30) return 150;
  if (days <= 90) return 50;
  return 0;
}

/**
 * Top 2 contribuidores viram ataques (RFC 6.2). Sem contribuidores — repo novo,
 * ou o GitHub ainda calculando a lista — o próprio repositório vira o ataque, em
 * vez de devolver uma carta sem nada no meio.
 */
function attacksFrom(repo: GitHubRepo, contributors: GitHubContributor[]): Attack[] {
  const humans = contributors
    .filter((person) => person.type !== "Bot" && !person.login.endsWith("[bot]"))
    .sort((a, b) => b.contributions - a.contributions || a.login.localeCompare(b.login))
    .slice(0, 2);

  if (humans.length === 0) {
    const damage = roundDamage(clamp(repo.stargazers_count * 2, 10, 300));
    return [
      {
        name: truncate(repo.name, 22),
        cost: costForDamage(damage),
        damage,
        // 38 pelo mesmo motivo de `profile.ts`: é o que cabe na coluna de texto
        // do ataque sem o renderizador cortar a seco por cima.
        text: repo.description ? truncate(repo.description, 38) : "",
      },
    ];
  }

  return humans.map((person) => {
    // Log, e não `contribuições × 2`: com escala linear qualquer repositório
    // sério satura os 300 nos dois ataques, e as duas linhas ficam idênticas.
    // No log, 10 commits dão 50, 1.000 dão 140 e 10.000 dão 180.
    const damage = roundDamage(
      clamp(45 * Math.log10(1 + person.contributions), 10, 300),
    );
    return {
      name: truncate(person.login, 22),
      cost: costForDamage(damage),
      damage,
      // Template direto a partir do número, sem frase criativa (RFC 9.2).
      text: `${person.contributions.toLocaleString("en-US")} commits`,
    };
  });
}

/**
 * Descrição curta: o rodapé divide a linha com a contagem de estrelas, e 64
 * caracteres empurravam o ano para fora do quadro.
 */
function repoFooter(repo: GitHubRepo): string {
  const parts: string[] = [];
  if (repo.description) parts.push(truncate(repo.description, 38));
  parts.push(`${repo.owner.login} · ${year(repo.created_at)}`);
  return parts.join(" · ");
}
