# Spec de layout da carta

Derivada do `render_cards.py` do [pixegami/pokemon-card-generator](https://github.com/pixegami/pokemon-card-generator)
(RFC seção 4.4). O que foi extraído é **a especificação de posição e tamanho**, não os arquivos —
a arte é original deste projeto (ver [`assets-brief.md`](assets-brief.md)).

## Ordem de composição

A composição é uma pilha simples em `sharp`. Nada de CSS elaborado, nada de browser headless.

```
1. canvas vazio
2. arte central (avatar do GitHub, redimensionado)
3. moldura do elemento (PNG com a "janela" recortada e bordas transparentes) — POR CIMA da arte
4. textos e ícones
```

O passo 3 vir depois do 2 é o truque que dispensa máscara de recorte na arte: a moldura já tem
o furo. (O gitfut resolve o recorte do avatar de outro jeito — máscaras SVG compostas em `sharp`
com `blend: "dest-in"`, RFC 4.2 — as duas técnicas podem coexistir se a moldura precisar de fade
nas bordas em vez de corte duro.)

## Posições

| Elemento | Posição | Observação |
|---|---|---|
| Arte central | largura `390px`, centrada em `x = largura/2`, `y = 210` | `IDEAL_CARD_WIDTH = 390` |
| Nome | `(48, 64)` | canto superior esquerdo |
| HP | `(largura - 86, 64)`, vermelho | alinhado à direita |
| Caixas de ataque | empilhadas a partir de `y = 450`, centradas horizontalmente | máximo 2 |
| Divisória entre ataques | entre as duas caixas | só se houver 2 ataques |
| Fraqueza / Resistência / Recuo | `y = 568` — esquerda / centro / direita | ícone pequeno de elemento em cada |
| Texto de raridade | rodapé esquerdo | `"{raridade} {elemento}-type Card"` |
| Símbolo de raridade | rodapé direito | tamanho de fonte cresce por tier |

**Dimensão total do canvas: a confirmar na implementação.** O RFC fixa a proporção física do card
(8.8cm × 6.3cm → razão ~0.716 largura/altura) e todas as posições acima em pixel absoluto; basta
escolher a largura de render e verificar que a linha de `y = 568` e o rodapé caem onde devem.
Escolhida a largura, mantê-la como constante única — o gitfut converte tudo por uma função `cqw(n)`
(% → px) justamente pra que carta estática e carta interativa nunca dessincronizem (RFC 4.2, item 3).

### Custo de energia — padrão geométrico

Ícones de custo posicionados por quantidade, dentro da caixa de ataque:

| Custo | Arranjo |
|---|---|
| 1 | centralizado |
| 2 | lado a lado |
| 3 | triângulo |
| 4 | quadrado |

### Símbolos de raridade

| Tier | Símbolo |
|---|---|
| comum | `⬤` |
| incomum | `◆` |
| raro | `★` |

**Conciliado.** O scoring usa 8 tiers (padrão do TCG Pokémon), não os 5 da RFC 6.1,
e não cabem em 3 símbolos. A leitura passou a ser **contagem + cor**:

| Tier | Símbolo | Cor |
|---|---|---|
| common | `●` | ink |
| uncommon | `◆` | ink |
| rare | `★` | ink |
| double_rare | `★★` | ink |
| illustration_rare | `★` | ouro |
| ultra_rare | `★★` | prata |
| special_illustration_rare | `★★` | ouro |
| hyper_rare | `★★★` | ouro |

Como contagem e cor ainda deixavam três tiers quase idênticos (a arte é sempre o
mesmo avatar na mesma moldura), a distinção real é **tratamento**: full-art e
camada metálica. Ver `docs/design-system.md`.

O rodapé ganhou também o **número de série**, à esquerda do símbolo.

## Os 7 elementos

`neutral, fire, water, grass, electric, psychic, fighting`

| Elemento | Fraco contra | Resiste a |
|---|---|---|
| fire | water | grass |
| water | electric | fire |
| grass | fire | electric |
| electric | fighting | — |
| psychic | — | fighting |
| fighting | psychic | — |
| neutral | fighting | — |

Cadeia triangular deliberadamente simples — não o quadro de 18 tipos do Pokémon oficial. Mapear
~15-20 linguagens comuns do GitHub para 7 elementos é tratável; para 18 tipos não é.

Essa mesma tabela alimenta o multiplicador de efetividade do motor de batalha: `×2` se o atacante
é forte contra o defensor, `×0.5` se é resistido (RFC 7.3, item 3).
