/**
 * Domínio da carta. Estas são as únicas formas que o renderizador de imagem, a
 * carta interativa e o motor de batalha conhecem — nenhum deles enxerga a API do
 * GitHub diretamente.
 */

export const ELEMENTS = [
  "neutral",
  "fire",
  "water",
  "grass",
  "electric",
  "psychic",
  "fighting",
] as const;

export type Element = (typeof ELEMENTS)[number];

/**
 * 5 tiers no scoring (RFC 6.1) contra 3 símbolos no layout (RFC 4.4). Conciliado
 * assim: `holo` e `secret` reusam a estrela e se diferenciam pela moldura/foil.
 * Ver `raritySymbol` em `./rarity.ts`.
 */
export const RARITIES = ["common", "uncommon", "rare", "holo", "secret"] as const;

export type Rarity = (typeof RARITIES)[number];

export interface Attack {
  /** Nome curto — vem do dado (nome do repo, login do contribuidor), não é inventado. */
  name: string;
  /** Ícones de custo de energia, 1 a 4. Define o arranjo geométrico no layout. */
  cost: number;
  damage: number;
  /** Linha de texto sob o ataque. Tom técnico-neutro (RFC 9.2). */
  text: string;
}

export type CardKind = "profile" | "repo";

export interface Card {
  kind: CardKind;
  /** `torvalds` ou `facebook/react`. Identidade estável, usada em chave de cache. */
  id: string;
  /** Nome exibido no topo da carta. */
  name: string;
  element: Element;
  hp: number;
  /** 0 a 2 ataques. Perfil sem repositórios legitimamente não tem nenhum. */
  attacks: Attack[];
  weakness: Element | null;
  resistance: Element | null;
  /** Pips de custo de recuo, 1 a 4. */
  retreat: number;
  rarity: Rarity;
  /** URL da arte central (avatar do GitHub). */
  artUrl: string;
  /** Linha de rodapé. Factual, gerada por template a partir dos números. */
  footer: string;
  /** Números crus, para a UI web mostrar de onde cada stat saiu. */
  stats: CardStat[];
  /** Link para a origem no GitHub. */
  sourceUrl: string;
}

export interface CardStat {
  /** Chave do dicionário i18n, não o rótulo já traduzido. */
  labelKey: string;
  value: number | string;
}
