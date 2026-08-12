# Design system — gitmon-cards

Registro do sistema **como está hoje**. Fonte: `app/globals.css`, `lib/cards/palette.json`, `lib/cards/rarity.ts`.

## Princípios travados (RFC)

1. **Identidade autônoma (RFC 9.3).** A marca do produto não herda a paleta pessoal do autor. A paleta das cartas é outra coisa ainda: segue os 18 tipos, não a marca.
2. **Tom técnico-neutro (RFC 9.2).** Erros e textos dizem o que aconteceu e param. Sem piada, sem humanização.
3. **A imagem exportada é limpa (RFC 9.6).** Patrocínio e marca pessoal vivem só no site; o PNG que viaja para o README de outra pessoa não carrega nada disso.
4. **Animação é enfeite (RFC 7.2).** Toca a cada visita, sem estado por visitante, e desaparece inteira sob `prefers-reduced-motion`.
5. **A carta girada é o PNG do servidor (RFC 7.1).** Não há reimplementação da carta em DOM. Efeitos ao vivo são camadas *por cima* da imagem.
6. **Mostrar antes de explicar (RFC 9.4).** A home abre com cartas, não com texto.

## Cores

Dark-only. Sem modo claro.

```
--bg          #0d0f14     fundo da página
--bg-raised   #161a22     superfícies elevadas
--bg-sunken   #090b0f     inputs, campos de código
--border      #262c38     bordas padrão
--border-strong #39414f   bordas de input, hover
--text        #e8eaee     texto primário
--text-muted  #949cab     texto secundário
--text-faint  #5f6775     labels, metadados
--accent      #f2c94c     amarelo da marca
--accent-ink  #2a2109     texto sobre accent
--danger      #e2622f     dano / efetividade
```

### Tipos (só nas cartas)

São 18, não os 7 elementos da RFC 4.4 — ver o adendo naquela seção.

`normal #828282` · `fire #E4613E` · `water #3099E1` · `grass #439837` · `electric #DFBC28` · `ice #47C8C8` · `fighting #E49021` · `poison #9354CB` · `ground #A4733C` · `flying #74AAD0` · `psychic #E96C8C` · `bug #9F9F28` · `rock #A9A481` · `ghost #6F4570` · `dragon #576FBC` · `dark #4F4747` · `steel #74B0CB` · `fairy #E18CE1`

Nenhuma dessas cores foi escolhida à mão: cada `base` foi **extraída do disco
colorido do ícone** do tipo em `scripts/assets/types/`. É o que garante que o
ícone e a moldura recolorida nunca divirjam — são a mesma cor por construção, não
por disciplina.

Cada um tem `base` / `dark` / `light` / `ink` em `lib/cards/palette.json`, os três
últimos derivados do `base` por mistura fixa (45% preto, 78% branco, 80% preto). O
tipo ativo entra como `--element` no `.card-panel`.

Os mesmos SVGs são copiados para `public/assets/types/` pelo build e usados
diretamente na interface (`components/card/TypeIcon.tsx`) — no nome do tipo sob a
carta e nas linhas de tipo, fraqueza e resistência do painel de explicação.
Sempre decorativos: o nome do tipo está escrito ao lado.

## Tipografia

Stack de sistema (`ui-sans-serif, system-ui, …`) e mono de sistema. **Nenhuma webfont.** Base `16px`, `line-height 1.55`.

| Papel | Tamanho | Peso | Tracking |
|---|---|---|---|
| Hero h1 | `clamp(30px, 5vw, 44px)` | — | `-1px` |
| Card h1 | `34px` | — | `-0.8px` |
| Stat value | `22px` | 800 | — |
| Section h2 | `13px` uppercase | — | `1.2px` |
| Corpo | `14–17px` | — | — |
| Meta | `12–12.5px` | — | — |

## Espaçamento, raio, layout

Raio `10px` / `18px`; cartas `16px`. Shell `1080px` com padding lateral `20px`. Gaps na escala `6 8 10 12 14 16 20 24 26 28 44 48`. Grids sempre `repeat(auto-fit, minmax(N, 1fr))`.

## Movimento

Easing padrão `cubic-bezier(0.22, 1, 0.36, 1)`. Durações: `80ms` tilt ativo · `240ms` glare/opacidade · `260ms` log de batalha · `340ms` retorno do tilt · `400ms` barra de HP · `720ms` reveal da carta.

`prefers-reduced-motion: reduce` zera tudo globalmente (`0.01ms`).

## Raridade

Oito tiers, na escada do TCG Pokémon. A leitura é **contagem + cor** de estrelas, não tamanho.

| Tier | Score mín. | Símbolo | Cor | Tamanho | Foil |
|---|---|---|---|---|---|
| common | 0 | `●` | `#2B2721` | 14px | não |
| uncommon | 75 | `◆` | `#2B2721` | 16px | não |
| rare | 350 | `★` | `#2B2721` | 18px | **sim** |
| double_rare | 1500 | `★★` | `#2B2721` | 15px | **sim** |
| illustration_rare | 8.000 | `★` | `#C9A227` ouro | 18px | **sim** |
| ultra_rare | 40.000 | `★★` | `#C8CDD4` prata | 15px | **sim** |
| special_illustration_rare | 200.000 | `★★` | `#C9A227` ouro | 15px | **sim** |
| hyper_rare | 800.000 | `★★★` | `#C9A227` ouro | 13px | **sim** |

### Tratamento visual

Símbolo sozinho não separava os tiers altos — a arte é sempre o mesmo avatar. A escada real é a combinação de layout e metal:

| Tier | Layout | Metal |
|---|---|---|
| rare · double_rare | padrão | — |
| illustration_rare | **full-art** | — |
| ultra_rare | **full-art** | prata |
| special_illustration_rare | **full-art** | ouro |
| hyper_rare | padrão | ouro |

Full-art: a janela sobe até a borda e desce até `448`, onde os ataques começam. A arte passa por trás do nome e da faixa de tipo; o nome vira branco sobre um scrim escuro de `118px` e o HP clareia para `#FF7A66`. Abaixo de `448` a face continua opaca — ataques e status precisam de fundo sólido.

`hyper_rare` volta ao layout padrão de propósito: no TCG a secret dourada é gravada sobre a carta normal, e é isso que a distingue da `special_illustration_rare` sem depender de contar estrelas.

Ouro e prata são os únicos valores fora de `palette.json` — aquela paleta é dos 18 tipos e não tem metais. Vivem em `lib/cards/rarity.ts`, onde só a raridade os usa.

O corte de `double_rare` em 1500 é uma **restrição, não uma preferência**: é o limiar que faz o bônus de atividade de `repo.ts` decidir entre tiers. Baixá-lo faz repositório mantido e abandonado caírem no mesmo lugar (coberto por `tests/unit/repo-card.test.ts`).

Os tiers acima de `double_rare` foram calibrados contra perfis reais medidos pela API. O score cresce muito mais rápido que a intuição, porque estrelas contam ×2 e seguidores ×3: `torvalds` dá 1.456.179 e `sindresorhus`, 1.945.490. Uma escada que parasse em 25.000 colocaria todo dev conhecido no tier mais raro.

### Foil

Uma escada só, em `lib/cards/foil.json`, lida pelas duas pontas: `foilIntensity()` a multiplica nas opacidades do CSS ao vivo, e `foilSvg()` a multiplica nas quatro camadas do PNG assado. Antes eram dois conjuntos de números descrevendo a mesma coisa.

`0.42` rare · `0.55` double_rare · `0.78` illustration_rare · `0.88` ultra_rare · `0.95` special_illustration_rare · `1` hyper_rare. Não é linear: o salto grande fica onde o tratamento também vira full-art.

Quatro camadas, na mesma ordem nos dois foils:

| Camada | O que é | Como é feita no PNG |
|---|---|---|
| relevo | grão metálico escovado | `feTurbulence` anisotrópico (`0.003 0.22`) + `feDisplacementMap` + `feSpecularLighting` |
| espectro | a cor que varre a diagonal | gradiente das 4 bandas do tier, repetido 2,5×, mascarado pelo **mesmo** ruído |
| lâmina | o reflexo duro da luz | gradiente diagonal, um pico estreito e um largo |
| granulado | poeira fina, contra o aspecto de gradiente | `feTurbulence` a `0.5` recolorido de branco |

A luz do PNG é `feDistantLight` (azimute `250`, elevação `52`), não pontual: luz pontual ilumina o grão só em volta do ponto e as linhas somem em dois terços da carta. O ponto quente que ela não dá é o trabalho da lâmina.

**Relevo e granulado recuam a 26% dentro da janela da arte**, com a borda desfocada em 7px; espectro e lâmina atravessam a janela inteiros. Luz branca sobre um retrato apaga o rosto, cor sobre um retrato não. Daí haver duas variantes por tier — `foil-<tier>.png` e `fullart-foil-<tier>.png` — como já havia para as molduras.

Tudo é alpha, nenhum pixel opaco e nenhum preto: o Satori não tem `mix-blend-mode` e qualquer área escura viraria véu cinza. O foil é o único asset gravado como PNG indexado (256 cores): ruído de baixo contraste cabe em 230 KB em vez de 780 KB sem diferença visível, e nas molduras a mesma quantização faria faixas nos gradientes largos.

## Cabeçalho da carta

**O HP ganha do nome.** `46px` peso 900 contra `28px` — antes eram `34` contra `30`, e nessa distância os dois competiam sem que nenhum vencesse: a carta não tinha ponto de entrada num thumbnail de feed. Na régua Wrapped/Skyline o que faz a peça ler em um segundo é um número grande.

O rótulo `HP`/`PS` é acompanhante: `14px`, opacidade `0.8`, alinhado pela **base** do número e não pelo centro da caixa, que é onde ele flutuava. O nome recuou `maxWidth` para `280px` — a `46px`, `250` mais o rótulo começam em `x=355`, e `300` de nome chegariam a `348`. A escada de `nameSize` acompanha o corpo base, então nomes longos encolhem na mesma proporção de antes.

## Rodapé e número de série

Duas colunas: texto à esquerda em `284px`, selo à direita em `108px`. O selo é sempre o mesmo bloco — mesma largura, mesma altura, mesmo centro — e o que muda é quem manda dentro dele.

| Estado | Selo |
|---|---|
| **com serial** | símbolo a `14px` em cima, `#0042` a `32px` peso 900 embaixo |
| **sem serial** | símbolo sozinho, no corpo de `raritySymbolSize` (`23`–`34px` conforme a contagem de estrelas) |

**A composição é desenhada para a carta sem serial.** Sem `REDIS_URL` a carta sai sem número, e isso não é exceção rara — é o estado padrão em desenvolvimento e o de qualquer deploy sem store durável. Desenhar primeiro o estado cheio deixaria um vazio no lugar do elemento herói toda vez que o Redis faltasse. Nada fora do selo se desloca entre os dois estados.

O número fica em tinta cheia, não na cor do metal: ele é o elemento verdadeiramente escasso da carta — a única coisa que não pode ser recalculada — e precisa ler antes de decorar. Quem carrega o metal é o símbolo logo acima. `#0042` é zero-padded em quatro dígitos, sequencial por ordem de geração, atribuído na primeira vez e imutável depois; nunca inventado localmente. A partir do quinto dígito o corpo recua para não invadir o texto ao lado.

A linha factual da esquerda tem orçamento de **36 caracteres** (`FOOTER_CHARS`), derivado da largura da coluna. O Satori não aplica `text-overflow: ellipsis`, então o que passa é cortado a seco no meio da palavra — truncar na camada de dados é o que faz o "…" ser o fim visível. Dono e ano nunca são reticenciados; a descrição fica com o que sobra e some inteira quando sobra pouco demais para informar.

## Regra para o Superdesign

Usar **apenas** fontes, cores, espaçamentos e estilos de componente deste documento. Não introduzir fontes, cores ou estilos visuais ausentes dele.
