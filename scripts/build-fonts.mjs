/**
 * Baixa e subseta as fontes da carta: `npm run fonts`.
 *
 * Roda sob demanda, não em todo build — o resultado é versionado em
 * `public/assets/fonts/`, junto com a licença.
 *
 * Por que subsetar: M PLUS Rounded 1c é uma fonte japonesa completa, 3,4 MB por
 * peso. Três pesos seriam 10 MB dentro da função serverless, pagos em parsing a
 * cada cold start, para desenhar nomes de repositório em latim. O subset derruba
 * isso para dezenas de KB sem perder nada que a carta use — incluindo os símbolos
 * de raridade (⬤ ◆ ★), que fontes só-latinas normalmente não têm.
 */
import { mkdir, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import subsetFont from "subset-font";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const dest = join(root, "public/assets/fonts");

const SOURCE = "https://raw.githubusercontent.com/google/fonts/main/ofl/mplusrounded1c";

const WEIGHTS = [
  { file: "MPLUSRounded1c-Regular.ttf", out: "Rounded-Regular.ttf" },
  { file: "MPLUSRounded1c-Bold.ttf", out: "Rounded-Bold.ttf" },
  { file: "MPLUSRounded1c-Black.ttf", out: "Rounded-Black.ttf" },
];

/**
 * Repertório do subset. Latim básico + Latin-1 (acentos de PT e de nomes
 * próprios) + a pontuação e os símbolos que a carta desenha.
 */
const CHARS = [
  // ASCII imprimível
  ...Array.from({ length: 95 }, (_, i) => String.fromCharCode(32 + i)),
  // Latin-1 suplementar: acentuação de português, espanhol, francês, alemão
  ...Array.from({ length: 96 }, (_, i) => String.fromCharCode(0xa0 + i)),
  // Usados pelo layout: multiplicação, menos, reticências, meia-risca, aspas,
  // marcador, e os três símbolos de raridade da RFC 4.4
  "×−–—…‘’“”·•●◆★☆■□▲△",
].join("");

async function download(name) {
  const response = await fetch(`${SOURCE}/${name}`);
  if (!response.ok) {
    throw new Error(`falhou ao baixar ${name}: HTTP ${response.status}`);
  }
  return Buffer.from(await response.arrayBuffer());
}

await mkdir(dest, { recursive: true });

console.log(`\nsubset (${CHARS.length} caracteres)`);
for (const { file, out } of WEIGHTS) {
  const original = await download(file);
  const subset = await subsetFont(original, CHARS, { targetFormat: "truetype" });
  await writeFile(join(dest, out), subset);

  const ratio = ((1 - subset.length / original.length) * 100).toFixed(1);
  console.log(
    `  ${out.padEnd(22)} ${(original.length / 1024 / 1024).toFixed(2)} MB → ` +
      `${(subset.length / 1024).toFixed(1)} KB  (−${ratio}%)`,
  );
}

// google/fonts não guarda a licença junto do binário desta família; ela vem do
// repositório do projeto M+. Redistribuir a fonte sem o texto da OFL violaria a
// própria licença, então isto não é opcional.
const license = await fetch(
  "https://raw.githubusercontent.com/coz-m/MPLUS_FONTS/master/OFL.txt",
);
if (!license.ok) throw new Error(`falhou ao baixar a licença: HTTP ${license.status}`);
await writeFile(join(dest, "OFL.txt"), Buffer.from(await license.arrayBuffer()));
console.log("\n  OFL.txt — M PLUS Rounded 1c, SIL Open Font License 1.1\n");
