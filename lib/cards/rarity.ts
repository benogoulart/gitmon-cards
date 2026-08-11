import type { Rarity } from "./types";

/**
 * Faixas de raridade.
 *
 * TODO(Q8): a RFC 6.1 trata as faixas do protótipo como fonte. Ele ainda não está
 * em `reference/`, então estas foram calibradas aqui contra perfis de referência:
 *
 *   conta nova (0★, 1 seguidor, 5 repos, 1 ano)      →    13  common
 *   dev comum (10★, 5 seguidores, 30 repos, 8 anos)  →   105  uncommon
 *   dev sólido (200★, 100 seguidores, 60 repos, 10)  →   810  rare
 *   dev notável (2k★, 1k seguidores, 100 repos, 12)  →  7160  holo
 *   figura pública (dezenas de milhares de ★)        → 8000+  secret
 *
 * `secret` precisa continuar raro para significar alguma coisa — se cair muito, a
 * carta mais bonita vira a carta padrão.
 */
const RARITY_THRESHOLDS: Array<{ min: number; rarity: Rarity }> = [
  { min: 8000, rarity: "secret" },
  { min: 1500, rarity: "holo" },
  { min: 350, rarity: "rare" },
  { min: 75, rarity: "uncommon" },
  { min: 0, rarity: "common" },
];

export function rarityForScore(score: number): Rarity {
  for (const { min, rarity } of RARITY_THRESHOLDS) {
    if (score >= min) return rarity;
  }
  return "common";
}

/**
 * Símbolo do rodapé direito (RFC 4.4). O layout define 3 símbolos e o scoring 5
 * tiers: `holo` e `secret` reusam a estrela e se diferenciam pela moldura e pelo
 * overlay de foil, não pelo glifo.
 */
export function raritySymbol(rarity: Rarity): string {
  switch (rarity) {
    case "common":
      return "●";
    case "uncommon":
      return "◆";
    default:
      return "★";
  }
}

/** Tamanho de fonte do símbolo, crescente por tier (RFC 4.4, item 8). */
export function raritySymbolSize(rarity: Rarity): number {
  switch (rarity) {
    case "common":
      return 14;
    case "uncommon":
      return 16;
    case "rare":
      return 18;
    case "holo":
      return 20;
    case "secret":
      return 22;
  }
}

/** Raridades que ganham camada de foil por cima da moldura. */
export function hasFoil(rarity: Rarity): boolean {
  return rarity === "holo" || rarity === "secret";
}
