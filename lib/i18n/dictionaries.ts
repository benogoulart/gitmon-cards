/**
 * Interface bilíngue com toggle manual, não auto-detect por navegador (RFC 9.1).
 * Dicionário desde a v1 porque string solta no meio de componente vira retrabalho
 * caro depois (RFC 11).
 *
 * Tom técnico-neutro em tudo, inclusive nos erros: o dado fala por si (RFC 9.2).
 */

export const LOCALES = ["pt", "en"] as const;
export type Locale = (typeof LOCALES)[number];
export const DEFAULT_LOCALE: Locale = "pt";

/**
 * Cookie do idioma. Mora aqui e não em `./server` porque o toggle é um componente
 * de cliente — importar do módulo de servidor arrastaria `next/headers` para o
 * bundle do navegador.
 */
export const LOCALE_COOKIE = "gitmon_locale";

/**
 * A **imagem** da carta, ao contrário do site, tem outro padrão: inglês.
 * Ela viaja para dentro do README de qualquer pessoa e não tem como seguir o
 * toggle de quem está vendo — `?lang=pt` na URL cobre quem quiser o contrário.
 */
export const DEFAULT_CARD_LOCALE: Locale = "en";

export function parseLocale(value: string | null | undefined, fallback: Locale): Locale {
  const normalized = value?.trim().toLowerCase().slice(0, 2);
  return LOCALES.includes(normalized as Locale) ? (normalized as Locale) : fallback;
}

const pt = {
  "element.neutral": "Neutro",
  "element.fire": "Fogo",
  "element.water": "Água",
  "element.grass": "Planta",
  "element.electric": "Elétrico",
  "element.psychic": "Psíquico",
  "element.fighting": "Lutador",

  "rarity.common": "Comum",
  "rarity.uncommon": "Incomum",
  "rarity.rare": "Rara",
  "rarity.holo": "Holográfica",
  "rarity.secret": "Secreta",

  "card.hp": "PS",
  "card.weakness": "Fraqueza",
  "card.resistance": "Resistência",
  "card.retreat": "Recuo",
  "card.none": "—",
  "card.profile": "Perfil",
  "card.repo": "Repositório",
  "card.footer": "Carta {rarity} · tipo {element}",

  "stat.stars": "Estrelas",
  "stat.followers": "Seguidores",
  "stat.repos": "Repositórios",
  "stat.forks": "Forks",
  "stat.issues": "Issues abertas",
  "stat.since": "Desde",

  "error.not_found": "Usuário ou repositório não encontrado.",
  "error.organization": "Organizações não geram carta nesta versão.",
  "error.rate_limit": "Limite da API do GitHub atingido. Tente novamente em alguns minutos.",
  "error.no_token": "Servidor sem token do GitHub configurado.",
  "error.upstream": "A API do GitHub não respondeu.",
  "error.battle_expired": "Este resultado de batalha expirou. Gere uma nova batalha.",

  "home.tagline": "Cartas geradas a partir de dados reais do GitHub.",
  "home.description":
    "Uma URL de imagem, sem login, que se atualiza sozinha. Cole no seu README.",
  "home.search": "Buscar usuário ou owner/repositório",
  "home.searchAction": "Gerar carta",
  "home.samples": "Exemplos",
  "home.embed": "Embutir no README",
  "home.copy": "Copiar",
  "home.copied": "Copiado",
  "home.repos": "Repositórios deste perfil",
  "home.battle": "Batalhar",
  "home.battleAction": "Simular batalha",
  "home.opponent": "Adversário",
  "home.sponsor": "Apoiar o projeto",
  "home.madeBy": "feito por",
  "home.viewOnGitHub": "Ver no GitHub",

  "battle.winner": "Vencedor",
  "battle.draw": "Empate por HP restante",
  "battle.turn": "Turno {n}",
  "battle.uses": "{attacker} usa {attack}",
  "battle.damage": "{damage} de dano",
  "battle.superEffective": "super efetivo",
  "battle.resisted": "resistido",
  "battle.remaining": "{hp} PS restantes",
  "battle.share": "Compartilhar resultado",
  "battle.rematch": "Batalhar de novo",
  "battle.skip": "Pular animação",
} as const;

export type MessageKey = keyof typeof pt;

const en: Record<MessageKey, string> = {
  "element.neutral": "Neutral",
  "element.fire": "Fire",
  "element.water": "Water",
  "element.grass": "Grass",
  "element.electric": "Electric",
  "element.psychic": "Psychic",
  "element.fighting": "Fighting",

  "rarity.common": "Common",
  "rarity.uncommon": "Uncommon",
  "rarity.rare": "Rare",
  "rarity.holo": "Holo",
  "rarity.secret": "Secret",

  "card.hp": "HP",
  "card.weakness": "Weakness",
  "card.resistance": "Resistance",
  "card.retreat": "Retreat",
  "card.none": "—",
  "card.profile": "Profile",
  "card.repo": "Repository",
  "card.footer": "{rarity} {element}-type Card",

  "stat.stars": "Stars",
  "stat.followers": "Followers",
  "stat.repos": "Repositories",
  "stat.forks": "Forks",
  "stat.issues": "Open issues",
  "stat.since": "Since",

  "error.not_found": "User or repository not found.",
  "error.organization": "Organizations do not generate a card in this version.",
  "error.rate_limit": "GitHub API rate limit reached. Try again in a few minutes.",
  "error.no_token": "Server has no GitHub token configured.",
  "error.upstream": "The GitHub API did not respond.",
  "error.battle_expired": "This battle result has expired. Run a new battle.",

  "home.tagline": "Cards generated from real GitHub data.",
  "home.description": "One image URL, no login, updating on its own. Paste it in your README.",
  "home.search": "Search a user or owner/repository",
  "home.searchAction": "Generate card",
  "home.samples": "Samples",
  "home.embed": "Embed in your README",
  "home.copy": "Copy",
  "home.copied": "Copied",
  "home.repos": "Repositories of this profile",
  "home.battle": "Battle",
  "home.battleAction": "Simulate battle",
  "home.opponent": "Opponent",
  "home.sponsor": "Sponsor the project",
  "home.madeBy": "made by",
  "home.viewOnGitHub": "View on GitHub",

  "battle.winner": "Winner",
  "battle.draw": "Decided by remaining HP",
  "battle.turn": "Turn {n}",
  "battle.uses": "{attacker} uses {attack}",
  "battle.damage": "{damage} damage",
  "battle.superEffective": "super effective",
  "battle.resisted": "resisted",
  "battle.remaining": "{hp} HP left",
  "battle.share": "Share result",
  "battle.rematch": "Battle again",
  "battle.skip": "Skip animation",
};

const DICTIONARIES: Record<Locale, Record<MessageKey, string>> = { pt, en };

/** `t("pt", "battle.turn", { n: 3 })` → "Turno 3". */
export function t(
  locale: Locale,
  key: MessageKey,
  values?: Record<string, string | number>,
): string {
  const template = DICTIONARIES[locale][key];
  if (!values) return template;
  return template.replace(/\{(\w+)\}/g, (match, name) =>
    name in values ? String(values[name]) : match,
  );
}

/**
 * Chaves montadas a partir do domínio. Existem para o TypeScript conseguir provar
 * que `element.fire` é uma chave válida — template literal com variável de união
 * não é inferido como chave sozinho.
 */
export function elementKey(element: string): MessageKey {
  return `element.${element}` as MessageKey;
}

export function rarityKey(rarity: string): MessageKey {
  return `rarity.${rarity}` as MessageKey;
}

export function errorKey(code: string): MessageKey {
  return `error.${code}` as MessageKey;
}

/** Fecha um `t` já ligado a um idioma, para não repetir o locale em cada chamada. */
export function translator(locale: Locale) {
  return (key: MessageKey, values?: Record<string, string | number>) =>
    t(locale, key, values);
}
