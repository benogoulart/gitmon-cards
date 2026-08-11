import { describe, expect, it } from "vitest";
import { buildRepoCard } from "@/lib/cards/repo";
import type { GitHubContributor, GitHubRepo } from "@/lib/github/types";

const NOW = new Date("2026-08-10T00:00:00Z");

function repo(overrides: Partial<GitHubRepo> = {}): GitHubRepo {
  return {
    name: "projeto",
    full_name: "dev/projeto",
    description: null,
    language: "TypeScript",
    stargazers_count: 0,
    forks_count: 0,
    open_issues_count: 0,
    watchers_count: 0,
    fork: false,
    archived: false,
    created_at: "2020-01-01T00:00:00Z",
    pushed_at: "2026-08-09T00:00:00Z",
    html_url: "https://github.com/dev/projeto",
    owner: { login: "dev", avatar_url: "https://avatars.githubusercontent.com/u/1", type: "User" },
    ...overrides,
  };
}

function contributor(overrides: Partial<GitHubContributor> = {}): GitHubContributor {
  return {
    login: "pessoa",
    contributions: 10,
    avatar_url: "https://avatars.githubusercontent.com/u/2",
    type: "User",
    ...overrides,
  };
}

describe("HP em escala logarítmica", () => {
  it("espalha o HP em vez de saturar — é o ponto da escala log (Q2)", () => {
    const hp = (stars: number) => buildRepoCard(repo({ stargazers_count: stars }), [], NOW).hp;
    expect(hp(0)).toBe(40);
    expect(hp(100)).toBe(100);
    expect(hp(10_000)).toBe(160);
    // Cada ordem de grandeza continua movendo o HP, que era a falha da escala linear.
    expect(hp(1000)).toBeGreaterThan(hp(100));
    expect(hp(100_000)).toBeGreaterThan(hp(10_000));
  });

  it("mantém o teto de 250 mesmo no maior repositório do GitHub", () => {
    const card = buildRepoCard(
      repo({ stargazers_count: 400_000, forks_count: 100_000 }),
      [],
      NOW,
    );
    expect(card.hp).toBeLessThanOrEqual(250);
  });
});

describe("ataques", () => {
  it("usa os 2 maiores contribuidores humanos", () => {
    const card = buildRepoCard(
      repo(),
      [
        contributor({ login: "menor", contributions: 5 }),
        contributor({ login: "maior", contributions: 120 }),
        contributor({ login: "medio", contributions: 40 }),
      ],
      NOW,
    );
    expect(card.attacks.map((a) => a.name)).toEqual(["maior", "medio"]);
    expect(card.attacks[0].damage).toBe(240);
    expect(card.attacks[0].text).toBe("120 commits");
  });

  it("descarta bots — eles inflariam o dano sem significar nada", () => {
    const card = buildRepoCard(
      repo(),
      [
        contributor({ login: "dependabot[bot]", contributions: 9000 }),
        contributor({ login: "renovate", contributions: 8000, type: "Bot" }),
        contributor({ login: "humano", contributions: 30 }),
      ],
      NOW,
    );
    expect(card.attacks.map((a) => a.name)).toEqual(["humano"]);
  });

  it("cai para o próprio repositório quando não há contribuidores", () => {
    const card = buildRepoCard(repo({ stargazers_count: 40 }), [], NOW);
    expect(card.attacks).toHaveLength(1);
    expect(card.attacks[0].name).toBe("projeto");
    expect(card.attacks[0].damage).toBe(80);
  });
});

describe("recuo a partir de issues abertas (Q5)", () => {
  it("cobra 1 pip por 50 issues, com teto de 4", () => {
    const retreat = (issues: number) =>
      buildRepoCard(repo({ open_issues_count: issues }), [], NOW).retreat;
    expect(retreat(0)).toBe(1);
    expect(retreat(49)).toBe(1);
    expect(retreat(50)).toBe(2);
    expect(retreat(5000)).toBe(4);
  });

  it("mantém fraqueza dentro dos 7 elementos, sem inventar um oitavo tipo", () => {
    const card = buildRepoCard(repo({ language: "Rust", open_issues_count: 900 }), [], NOW);
    expect(card.weakness).toBe("water");
    expect(card.resistance).toBe("grass");
  });
});

describe("raridade", () => {
  it("premia repositório mantido sobre repositório parado com as mesmas estrelas", () => {
    // 700★ = 1400 pontos, logo abaixo da faixa holo (1500). O bônus de atividade
    // é exatamente o que decide entre um tier e outro aqui.
    const ativo = buildRepoCard(
      repo({ stargazers_count: 700, pushed_at: "2026-08-09T00:00:00Z" }),
      [],
      NOW,
    );
    const parado = buildRepoCard(
      repo({ stargazers_count: 700, pushed_at: "2020-01-01T00:00:00Z" }),
      [],
      NOW,
    );
    expect(ativo.rarity).toBe("holo");
    expect(parado.rarity).toBe("rare");
  });

  it("não dá bônus de atividade a repositório arquivado", () => {
    const arquivado = buildRepoCard(
      repo({ stargazers_count: 700, archived: true, pushed_at: "2026-08-09T00:00:00Z" }),
      [],
      NOW,
    );
    expect(arquivado.rarity).toBe("rare");
  });
});
