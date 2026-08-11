import type { Card, Element } from "./types";

/**
 * Cadeia de fraqueza/resistência (RFC 4.4). Deliberadamente triangular e simples —
 * não o quadro de 18 tipos do Pokémon oficial. Mapear ~20 linguagens comuns para 7
 * elementos é tratável; para 18 tipos não é.
 */
export const ELEMENT_CHAIN: Record<
  Element,
  { weakTo: Element | null; resists: Element | null }
> = {
  fire: { weakTo: "water", resists: "grass" },
  water: { weakTo: "electric", resists: "fire" },
  grass: { weakTo: "fire", resists: "electric" },
  electric: { weakTo: "fighting", resists: null },
  psychic: { weakTo: null, resists: "fighting" },
  fighting: { weakTo: "psychic", resists: null },
  neutral: { weakTo: "fighting", resists: null },
};

/**
 * Cor de identidade de cada elemento. É daqui que a moldura SVG é recolorida
 * (caminho C da RFC 8) — a paleta segue os elementos, não a marca pessoal do
 * autor (RFC 9.3).
 */
export const ELEMENT_COLORS: Record<
  Element,
  { base: string; dark: string; light: string; ink: string }
> = {
  neutral: { base: "#B8AE9C", dark: "#6E6659", light: "#EDE7DA", ink: "#2B2721" },
  fire: { base: "#E2622F", dark: "#8C3312", light: "#FBD9C4", ink: "#3A1508" },
  water: { base: "#2F86C4", dark: "#12456E", light: "#C8E4F7", ink: "#08202F" },
  grass: { base: "#3F9E52", dark: "#1B5227", light: "#CDECD2", ink: "#0B2412" },
  electric: { base: "#D9A81C", dark: "#8A6403", light: "#FAEEBF", ink: "#33260A" },
  psychic: { base: "#9B54B5", dark: "#54216A", light: "#E9D2F2", ink: "#2A0F35" },
  fighting: { base: "#B4522F", dark: "#6B2611", light: "#F0D2C5", ink: "#301207" },
};

/**
 * Linguagem do GitHub → elemento.
 *
 * O agrupamento é temático, não técnico: sistemas/performance viram `fire`,
 * dados/científico viram `water`, concorrência/crescimento viram `grass`, web
 * vira `electric`, funcional/abstrato vira `psychic`, plataformas corporativas
 * viram `fighting`, e o resto (marcação, config, shell) cai em `neutral`.
 *
 * TODO(Q8): reconciliar com o mapa do protótipo (`reference/github-card-prototype.html`)
 * quando ele estiver disponível — a RFC 6.1 trata aquele mapa como fonte.
 */
export const LANGUAGE_ELEMENTS: Record<string, Element> = {
  // fire — sistemas, performance, baixo nível
  c: "fire",
  "c++": "fire",
  rust: "fire",
  zig: "fire",
  nim: "fire",
  assembly: "fire",
  cuda: "fire",
  fortran: "fire",
  ada: "fire",

  // water — dados, científico, consulta
  python: "water",
  r: "water",
  julia: "water",
  matlab: "water",
  sql: "water",
  plpgsql: "water",
  tex: "water",
  "jupyter notebook": "water",

  // grass — concorrência, produtividade, ecossistemas que crescem
  go: "grass",
  ruby: "grass",
  elixir: "grass",
  erlang: "grass",
  crystal: "grass",
  lua: "grass",
  perl: "grass",

  // electric — web, front-end, tempo real
  javascript: "electric",
  typescript: "electric",
  vue: "electric",
  svelte: "electric",
  astro: "electric",
  dart: "electric",
  solidity: "electric",
  coffeescript: "electric",

  // psychic — funcional, simbólico, abstrato
  haskell: "psychic",
  scala: "psychic",
  clojure: "psychic",
  ocaml: "psychic",
  "f#": "psychic",
  elm: "psychic",
  "emacs lisp": "psychic",
  "common lisp": "psychic",
  scheme: "psychic",
  racket: "psychic",
  prolog: "psychic",

  // fighting — plataformas corporativas, mobile nativo, runtimes pesados
  java: "fighting",
  "c#": "fighting",
  kotlin: "fighting",
  swift: "fighting",
  "objective-c": "fighting",
  groovy: "fighting",
  php: "fighting",
  visualbasic: "fighting",
  "visual basic .net": "fighting",

  // neutral — marcação, estilo, configuração, automação
  html: "neutral",
  css: "neutral",
  scss: "neutral",
  less: "neutral",
  shell: "neutral",
  powershell: "neutral",
  batchfile: "neutral",
  dockerfile: "neutral",
  makefile: "neutral",
  cmake: "neutral",
  "vim script": "neutral",
  "vim snippet": "neutral",
  hcl: "neutral",
  nix: "neutral",
  yaml: "neutral",
  mdx: "neutral",
  markdown: "neutral",
  roff: "neutral",
};

/** Elemento de uma linguagem do GitHub. Linguagem desconhecida ou ausente → `neutral`. */
export function elementForLanguage(language: string | null | undefined): Element {
  if (!language) return "neutral";
  return LANGUAGE_ELEMENTS[language.toLowerCase()] ?? "neutral";
}

/**
 * Multiplicador de efetividade de um ataque (RFC 7.3, item 3).
 *
 * Lê a fraqueza/resistência **impressa na carta defensora**, não a cadeia genérica:
 * a fraqueza de uma carta de perfil vem da segunda linguagem do dev (RFC 6.1), que
 * pode divergir da cadeia. A carta é a fonte da verdade, como no TCG de verdade.
 */
export function effectiveness(attacker: Element, defender: Card): number {
  if (defender.weakness === attacker) return 2;
  if (defender.resistance === attacker) return 0.5;
  return 1;
}
