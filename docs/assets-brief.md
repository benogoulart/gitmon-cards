# Briefing de arte

## Regra inegociável

Nenhum asset da Pokémon Company. Nenhum ícone dos repositórios de referência — o
`trading-card-generator` credita ILKCMP e o `pokemon-card-generator` credita TheDuckTamerBlanks,
ambos ilustradores de fã. **O que foi extraído deles é especificação numérica de posição e tamanho,
não arquivo.** Toda moldura, ícone de tipo e ícone de energia deste projeto é arte original.

## O que precisa existir

| Asset | Quantidade | Destino |
|---|---|---|
| Moldura de carta | 7 (uma por elemento) | `public/assets/frames/` |
| Ícone de energia/custo | 7 | `public/assets/energy/` |
| Ícone de tipo (pequeno — fraqueza/resistência/recuo) | 7 + 1 de recuo | `public/assets/icons/` |
| Overlay de holo/foil | 1-2 (só raridades altas) | `public/assets/frames/` |
| Fontes | 1-2 famílias, licença livre para embed | `public/assets/fonts/` |

Elementos: `neutral, fire, water, grass, electric, psychic, fighting`.

## Caminho escolhido — a decidir

O RFC seção 8 deixou três caminhos abertos e **recomenda começar pelo C**:

**C — moldura vetorial única (SVG), recolorida por variável por tipo, com holo/foil como camada
PNG separada só nos tiers altos.** Não multiplica tipo × raridade, fidelidade alta o suficiente,
fácil de expandir. Migrar para o caminho A (arte original desenhada à mão, por tipo) depois que o
projeto validar tração — é o de menor custo de troca.

Os outros: **A** = arte original comissionada/desenhada (melhor marca, mais trabalho manual);
**B** = geração via IA, uma base por raridade (rápido de iterar, inconsistente entre gerações).

**Ainda não decidido.** Definir antes de qualquer trabalho de arte.

## Restrições técnicas

- A moldura é colada **por cima** da arte central e precisa ter a "janela" recortada com bordas
  transparentes (ver [`layout-spec.md`](layout-spec.md)) — PNG com alpha, não JPEG.
- Satori não suporta `mask-image` do CSS. Qualquer recorte suave tem que ser assado em `sharp`
  no servidor antes de entrar na composição.
- Peso importa: os assets viajam em toda geração serverless. Otimizar (webp onde couber, PNG-8
  quando a paleta permitir).
- A paleta segue a lógica dos 7 elementos, **não** a paleta pessoal do autor — o produto tem
  identidade visual própria (RFC 9.3).
