/**
 * Geradores de SVG para a arte das cartas — caminho C da RFC 8: uma moldura
 * vetorial única recolorida por elemento, com o foil como camada separada só nos
 * tiers altos.
 *
 * Tudo aqui é geometria original. Nada é derivado de asset da Pokémon Company
 * nem dos ícones de fã dos repositórios de referência (RFC 11) — o que foi
 * reaproveitado deles é a especificação de posição em `docs/layout-spec.md`,
 * que são números, não desenho.
 *
 * Sem texto: `sharp` rasteriza SVG via librsvg, e texto em SVG depende de fontes
 * do sistema — o que não é confiável em serverless. Todo texto é desenhado pelo
 * Satori em runtime, com as fontes embarcadas em public/assets/fonts.
 */

/** Mistura dois hex. `amount` = 0 devolve `a`, 1 devolve `b`. */
function mix(a, b, amount) {
  const parse = (hex) => [1, 3, 5].map((i) => Number.parseInt(hex.slice(i, i + 2), 16));
  const [ar, ag, ab] = parse(a);
  const [br, bg, bb] = parse(b);
  const channel = (x, y) => Math.round(x + (y - x) * amount).toString(16).padStart(2, "0");
  return `#${channel(ar, br)}${channel(ag, bg)}${channel(ab, bb)}`;
}

/** Moldura de um elemento. A janela da arte fica transparente (RFC 4.4, item 3). */
export function frameSvg(layout, colors) {
  const { width: W, height: H, radius: R, border: B, window: win } = layout;
  const inner = { x: B, y: B, w: W - B * 2, h: H - B * 2, r: R - 6 };
  const bezel = 4;

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
  <defs>
    <linearGradient id="borda" x1="0" y1="0" x2="0.35" y2="1">
      <stop offset="0" stop-color="${colors.base}"/>
      <stop offset="0.45" stop-color="${colors.dark}"/>
      <stop offset="1" stop-color="${colors.base}"/>
    </linearGradient>
    <linearGradient id="face" x1="0" y1="0" x2="0.2" y2="1">
      <stop offset="0" stop-color="${mix(colors.light, "#FFFFFF", 0.35)}"/>
      <stop offset="0.5" stop-color="${colors.light}"/>
      <stop offset="1" stop-color="${mix(colors.light, colors.base, 0.34)}"/>
    </linearGradient>
    <linearGradient id="faixa" x1="0" y1="0" x2="1" y2="0.6">
      <stop offset="0" stop-color="${colors.base}" stop-opacity="0.72"/>
      <stop offset="0.7" stop-color="${colors.base}" stop-opacity="0.34"/>
      <stop offset="1" stop-color="${colors.base}" stop-opacity="0.5"/>
    </linearGradient>
    <radialGradient id="brilho" cx="0.26" cy="0.1" r="0.7">
      <stop offset="0" stop-color="#FFFFFF" stop-opacity="0.34"/>
      <stop offset="1" stop-color="#FFFFFF" stop-opacity="0"/>
    </radialGradient>

    <!-- Branco mantém, preto fura. É isto que abre a janela da arte. -->
    <mask id="janela">
      <rect x="0" y="0" width="${W}" height="${H}" fill="#FFFFFF"/>
      <rect x="${win.x}" y="${win.y}" width="${win.width}" height="${win.height}" rx="${win.radius}" fill="#000000"/>
    </mask>
  </defs>

  <g mask="url(#janela)">
    <rect x="0" y="0" width="${W}" height="${H}" rx="${R}" fill="url(#borda)"/>
    <rect x="3" y="3" width="${W - 6}" height="${H - 6}" rx="${R - 3}" fill="none"
          stroke="#FFFFFF" stroke-opacity="0.28" stroke-width="1.5"/>

    <rect x="${inner.x}" y="${inner.y}" width="${inner.w}" height="${inner.h}" rx="${inner.r}" fill="url(#face)"/>
    <rect x="${inner.x}" y="${inner.y}" width="${inner.w}" height="${inner.h}" rx="${inner.r}" fill="url(#brilho)"/>
    <rect x="${inner.x + 0.75}" y="${inner.y + 0.75}" width="${inner.w - 1.5}" height="${inner.h - 1.5}"
          rx="${inner.r}" fill="none" stroke="${colors.dark}" stroke-opacity="0.4" stroke-width="1.5"/>

    <!-- Faixa do nome. O texto entra por cima, em runtime. -->
    <path d="M${inner.x} ${inner.y + inner.r} a${inner.r} ${inner.r} 0 0 1 ${inner.r} -${inner.r}
             h${inner.w - inner.r * 2} a${inner.r} ${inner.r} 0 0 1 ${inner.r} ${inner.r}
             v${86 - inner.r} h-${inner.w} z" fill="url(#faixa)"/>
    <line x1="${inner.x}" y1="${inner.y + 86}" x2="${inner.x + inner.w}" y2="${inner.y + 86}"
          stroke="${colors.dark}" stroke-opacity="0.35" stroke-width="1.5"/>

    <!-- Bisel da janela: o retângulo é maior que o furo, então sobra um anel. -->
    <rect x="${win.x - bezel}" y="${win.y - bezel}" width="${win.width + bezel * 2}"
          height="${win.height + bezel * 2}" rx="${win.radius + 2}" fill="${colors.ink}" fill-opacity="0.92"/>

    <!-- Faixa de tipo, logo abaixo da janela. -->
    <rect x="${layout.typeStrip.x}" y="${layout.typeStrip.y}" width="${layout.typeStrip.width}"
          height="${layout.typeStrip.height}" rx="6" fill="${colors.base}" fill-opacity="0.2"
          stroke="${colors.dark}" stroke-opacity="0.3" stroke-width="1"/>

    <!-- Painel dos ataques. A divisória entre dois ataques é desenhada em runtime,
         porque depende de quantos ataques a carta tem. -->
    <rect x="${layout.attacks.left}" y="${layout.attacks.top - 8}"
          width="${layout.attacks.right - layout.attacks.left}"
          height="${layout.attacks.boxHeight * 2 + layout.attacks.gap + 8}" rx="10"
          fill="#FFFFFF" fill-opacity="0.42"/>

    <!-- Fileira de fraqueza / resistência / recuo. -->
    <rect x="${layout.attacks.left}" y="${layout.status.y}"
          width="${layout.attacks.right - layout.attacks.left}" height="${layout.status.height}" rx="8"
          fill="${colors.base}" fill-opacity="0.16" stroke="${colors.dark}" stroke-opacity="0.28" stroke-width="1"/>
    ${[1, 2]
      .map((i) => {
        const x = layout.attacks.left + ((layout.attacks.right - layout.attacks.left) / 3) * i;
        return `<line x1="${x}" y1="${layout.status.y + 7}" x2="${x}" y2="${layout.status.y + layout.status.height - 7}" stroke="${colors.dark}" stroke-opacity="0.28" stroke-width="1"/>`;
      })
      .join("\n    ")}

    <line x1="${layout.footer.left}" y1="${layout.footer.top - 6}" x2="${layout.footer.right}"
          y2="${layout.footer.top - 6}" stroke="${colors.dark}" stroke-opacity="0.25" stroke-width="1"/>
  </g>

  <!-- Desenhado depois da máscara: fica por cima da arte, como o fio dourado de
       uma carta de verdade. -->
  <rect x="${win.x}" y="${win.y}" width="${win.width}" height="${win.height}" rx="${win.radius}"
        fill="none" stroke="${colors.base}" stroke-opacity="0.85" stroke-width="2"/>
</svg>`;
}

/** Glifos dos ícones de energia. Geometria primitiva, desenhada aqui do zero. */
const GLYPHS = {
  neutral: '<circle cx="12" cy="12" r="6.2" fill="none" stroke-width="3.4"/>',
  // Chama com recorte no topo e base assimétrica: a gota da água é o outro glifo
  // arredondado do conjunto, e os dois precisam ser distinguíveis a 19px.
  fire: '<path d="M12.6 1.8c.4 3.4-1.2 4.6-.5 6.3.5 1.2 1.8.9 2-.5 2.8 2.2 3.6 6.1 1.4 9-2.3 3-7.4 3.3-10 .5-2.4-2.6-2-6.5.3-8.9-.2 1.6.6 2.4 1.5 2.2 1.4-.3 1.2-2.6 5.3-8.6z"/>',
  water: '<path d="M12 3.2c3.4 5 5.4 7.6 5.4 10.4a5.4 5.4 0 1 1-10.8 0c0-2.8 2-5.4 5.4-10.4z"/>',
  grass: '<path d="M20.4 3.2C6.6 6.4 4.2 13.4 8.6 18.2c2.8 3 9.6 1 11.8-15zM9 18.6c1.2-4.2 3.6-7.4 7-9.6"  stroke-width="1.6"/>',
  electric: '<path d="M13.4 2.2 5.6 13.4h4.6l-1.8 8.4 8.4-11.6h-4.6z"/>',
  psychic:
    '<path d="M12 18.6a6.6 6.6 0 1 1 6.6-6.6c0 2.4-1.9 4-3.9 4s-3.3-1.4-3.3-3.1c0-1.4 1-2.4 2.2-2.4" fill="none" stroke-width="2.6" stroke-linecap="round"/>',
  fighting:
    '<path d="M12 1.8 14.6 9 22 11.6 14.6 14.2 12 21.6 9.4 14.2 2 11.6 9.4 9z"/>',
};

/** Ícone de energia: disco recolorido + glifo do elemento. */
export function energySvg(colors, glyphKey, size = 48) {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 24 24">
  <defs>
    <radialGradient id="disco" cx="0.34" cy="0.28" r="0.85">
      <stop offset="0" stop-color="${colors.base}"/>
      <stop offset="1" stop-color="${colors.dark}"/>
    </radialGradient>
  </defs>
  <circle cx="12" cy="12" r="11.2" fill="url(#disco)" stroke="#FFFFFF" stroke-opacity="0.85" stroke-width="1.4"/>
  <g fill="#FFFFFF" fill-opacity="0.95" stroke="#FFFFFF" stroke-opacity="0.95" stroke-width="0" stroke-linejoin="round">
    ${GLYPHS[glyphKey]}
  </g>
</svg>`;
}

/** Pip de custo de recuo. Cinza, fora da lógica de elementos de propósito. */
export function retreatSvg(size = 48) {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 24 24">
  <circle cx="12" cy="12" r="11.2" fill="#8A8F98" stroke="#FFFFFF" stroke-opacity="0.8" stroke-width="1.4"/>
  <path d="M9.4 6.6 15.2 12l-5.8 5.4" fill="none" stroke="#FFFFFF" stroke-width="2.8"
        stroke-linecap="round" stroke-linejoin="round"/>
</svg>`;
}

/**
 * Camada de foil, aplicada por cima da moldura só em `holo` e `secret`
 * (RFC 8, caminho C).
 *
 * Tudo aqui é alpha — nenhum pixel opaco, nenhum preto. O Satori compõe imagem
 * com alpha simples e não tem `mix-blend-mode`: qualquer área escura viraria véu
 * cinza por cima da carta em vez de brilho. O efeito precisa nascer transparente.
 */
export function foilSvg(layout, tier) {
  const { width: W, height: H, radius: R } = layout;
  const secret = tier === "secret";
  const gain = secret ? 1.5 : 1;

  const bands = secret
    ? ["#FFD76A", "#FF8FD0", "#7FE7FF", "#FFF3B0"]
    : ["#8FD9FF", "#D9A8FF", "#A8FFD1", "#FFE9A8"];

  const stops = bands
    .map((color, i) => {
      const offset = (i / (bands.length - 1)).toFixed(3);
      return `<stop offset="${offset}" stop-color="${color}" stop-opacity="${(0.13 * gain).toFixed(3)}"/>`;
    })
    .join("\n      ");

  /** Uma faixa de luz: transparente → clara → transparente. */
  const streak = (center, width, peak) =>
    [
      `<stop offset="${Math.max(0, center - width).toFixed(3)}" stop-color="#FFFFFF" stop-opacity="0"/>`,
      `<stop offset="${center.toFixed(3)}" stop-color="#FFFFFF" stop-opacity="${(peak * gain).toFixed(3)}"/>`,
      `<stop offset="${Math.min(1, center + width).toFixed(3)}" stop-color="#FFFFFF" stop-opacity="0"/>`,
    ].join("\n      ");

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
  <defs>
    <linearGradient id="arco" x1="0" y1="1" x2="1" y2="0">
      ${stops}
    </linearGradient>
    <linearGradient id="varredura" x1="0" y1="1" x2="1" y2="0">
      <stop offset="0" stop-color="#FFFFFF" stop-opacity="0"/>
      ${streak(0.34, 0.09, 0.26)}
      ${streak(0.6, 0.06, 0.16)}
      <stop offset="1" stop-color="#FFFFFF" stop-opacity="0"/>
    </linearGradient>
  </defs>
  <rect x="0" y="0" width="${W}" height="${H}" rx="${R}" fill="url(#arco)"/>
  <rect x="0" y="0" width="${W}" height="${H}" rx="${R}" fill="url(#varredura)"/>
</svg>`;
}

export const GLYPH_KEYS = Object.keys(GLYPHS);
