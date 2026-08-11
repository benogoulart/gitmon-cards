/**
 * Gera a arte estática das cartas: `npm run assets`.
 *
 * Roda em build, não em runtime. É a decisão central da RFC 4.3 — a complexidade
 * visual é resolvida antes, e o servidor só compõe. Rasterizar SVG a cada
 * requisição funcionaria, mas pagaria o custo em todo cold start sem ganhar nada.
 */
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";
import { energySvg, foilSvg, frameSvg, retreatSvg } from "./lib/art.mjs";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const readJson = async (path) => JSON.parse(await readFile(join(root, path), "utf8"));

const layout = await readJson("lib/cards/layout.json");
const palette = await readJson("lib/cards/palette.json");
const elements = Object.keys(palette).filter((key) => !key.startsWith("_"));

const png = (svg) => sharp(Buffer.from(svg)).png({ compressionLevel: 9 });

async function emit(relativePath, svg) {
  const target = join(root, "public/assets", relativePath);
  await mkdir(dirname(target), { recursive: true });
  const { size } = await png(svg).toFile(target);
  console.log(`  ${relativePath.padEnd(28)} ${(size / 1024).toFixed(1)} KB`);
}

console.log(`\nmolduras (${layout.width}x${layout.height})`);
for (const element of elements) {
  await emit(`frames/${element}.png`, frameSvg(layout, palette[element]));
}

console.log("\nfoil");
for (const tier of ["holo", "secret"]) {
  await emit(`frames/foil-${tier}.png`, foilSvg(layout, tier));
}

console.log("\nenergia");
for (const element of elements) {
  await emit(`energy/${element}.png`, energySvg(palette[element], element));
}

console.log("\nícones");
await emit("icons/retreat.png", retreatSvg());

console.log(`\n${elements.length} elementos · arte original, nenhum asset de terceiro\n`);
