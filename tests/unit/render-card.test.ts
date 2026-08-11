import { mkdir, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { describe, expect, it } from "vitest";
import { renderCard } from "@/lib/og/renderCard";
import type { Card } from "@/lib/cards/types";

/**
 * Smoke test do renderizador. Não compara pixels — compara que a composição
 * inteira (fontes, moldura, ícones, Satori) roda de ponta a ponta e sai um PNG.
 *
 * `PREVIEW=<dir>` grava os PNGs em disco para inspeção visual, que é como a arte
 * é conferida na prática.
 */

const PREVIEW = process.env.PREVIEW;

const BASE: Card = {
  kind: "profile",
  id: "torvalds",
  name: "Linus Torvalds",
  element: "fire",
  hp: 250,
  attacks: [
    { name: "linux", cost: 4, damage: 300, text: "Linux kernel source tree" },
    { name: "subsurface", cost: 2, damage: 120, text: "Subsurface divelog program" },
  ],
  weakness: "water",
  resistance: "grass",
  retreat: 3,
  rarity: "secret",
  artUrl: "https://avatars.githubusercontent.com/u/1024025",
  footer: "Creator of Linux and Git · 2011",
  stats: [
    { labelKey: "stat.stars", value: 214_000 },
    { labelKey: "stat.followers", value: 238_000 },
  ],
  sourceUrl: "https://github.com/torvalds",
};

async function toPng(card: Card, locale: "pt" | "en", filename: string): Promise<Buffer> {
  const image = await renderCard(card, locale);
  const buffer = Buffer.from(await image.arrayBuffer());

  if (PREVIEW) {
    const target = join(PREVIEW, filename);
    await mkdir(dirname(target), { recursive: true });
    await writeFile(target, buffer);
  }

  return buffer;
}

/** Assinatura de arquivo PNG. */
function isPng(buffer: Buffer): boolean {
  return buffer.subarray(0, 8).equals(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]));
}

describe("renderCard", () => {
  it("compõe uma carta completa em PNG", async () => {
    const png = await toPng(BASE, "en", "secret-fire.png");
    expect(isPng(png)).toBe(true);
    expect(png.byteLength).toBeGreaterThan(20_000);
  }, 60_000);

  it("renderiza os 7 elementos sem quebrar", async () => {
    const elements = [
      "neutral",
      "fire",
      "water",
      "grass",
      "electric",
      "psychic",
      "fighting",
    ] as const;

    for (const element of elements) {
      const png = await toPng(
        { ...BASE, element, rarity: "rare", name: element },
        "en",
        `element-${element}.png`,
      );
      expect(isPng(png)).toBe(true);
    }
  }, 120_000);

  it("aguenta uma carta mínima: sem ataques, sem resistência, sem avatar", async () => {
    const png = await toPng(
      {
        ...BASE,
        name: "conta-nova",
        element: "neutral",
        hp: 30,
        attacks: [],
        weakness: "fighting",
        resistance: null,
        retreat: 1,
        rarity: "common",
        artUrl: "https://exemplo.invalido/nao-existe.png",
        footer: "2026",
        stats: [{ labelKey: "stat.stars", value: 0 }],
      },
      "pt",
      "minima.png",
    );
    expect(isPng(png)).toBe(true);
  }, 60_000);

  it("renderiza a carta de repositório em português", async () => {
    const png = await toPng(
      {
        ...BASE,
        kind: "repo",
        id: "facebook/react",
        name: "react",
        element: "electric",
        hp: 230,
        attacks: [
          { name: "gaearon", cost: 3, damage: 200, text: "1.640 commits" },
          { name: "sebmarkbage", cost: 2, damage: 118, text: "959 commits" },
        ],
        weakness: "fighting",
        resistance: null,
        retreat: 4,
        rarity: "holo",
        footer: "The library for web and native user interfaces · facebook · 2013",
      },
      "pt",
      "repo-holo.png",
    );
    expect(isPng(png)).toBe(true);
  }, 60_000);
});
