# Handoff — branch `feat/tipos-18-raridade-e-status`

Estado do trabalho em andamento e o contexto que **não** está no código. Para o
inventário completo de pendências com justificativa, ver
[`gaps-revalidacao.md`](./gaps-revalidacao.md), que abre com um placar de 16
itens.

## Onde está

Branch `feat/tipos-18-raridade-e-status`, três commits, ainda sem PR — o autor
abre quando as pendências fecharem.

| Commit | Escopo |
|---|---|
| `a2996dc` | 18 tipos, escada de raridade do TCG, serial, tratamentos de arte, painel de explicação, abertura de pacote, faixa de apoio |
| `7e2516d` | Radar de assinatura do perfil |
| `9d79276` | Arranjo simétrico da página da carta |

Verificado no último commit: **97 testes unitários, 13 e2e, typecheck e build
limpos**.

`.claude/` está **deliberadamente fora dos commits** — contém só o skill file do
Superdesign, que é ferramenta e não produto. Decidir se versiona é do autor.

## Decisões travadas nesta sessão

Estas foram tomadas em conversa e o código as segue; mudá-las é decisão nova, não
correção.

1. **8 tiers de raridade** no padrão do TCG Pokémon, calibrados contra perfis
   reais medidos pela API. A primeira escada punha seis de sete perfis notáveis
   no tier mais raro. O limiar de `double_rare` em 1500 é restrição, não
   preferência: é o que faz o bônus de atividade de `repo.ts` decidir entre
   tiers.
2. **18 tipos**, revertendo a decisão da RFC 4.4 por 7 elementos. Paleta extraída
   do disco colorido dos próprios ícones, não escolhida à mão.
3. **Serial sequencial** por ordem de geração, com script Lua atômico e store
   separado do cache. Sem `REDIS_URL` a carta sai sem número — nunca com número
   errado.
4. **Radar é assinatura, não medição.** Cinco eixos com escalas independentes e
   tetos escolhidos por nós; por isso não tem régua numérica, os números reais
   ficam na lista ao lado, e há uma `<table>` escondida para leitor de tela.
5. **Abertura de pacote toca em toda visita** (RFC 7.2 proíbe estado por
   visitante), com botão de pular visível desde o primeiro quadro.
6. **Explicações e radar vivem só no site.** A imagem exportada segue limpa
   (RFC 9.6), e é por isso que `derivations` e `ratings` são opcionais no
   domínio — o renderizador nunca os lê.

## Superdesign

Projeto: `ed05a819-e5d0-41e7-ad22-2a5f91db6205`
Canvas: https://superdesign.dev/teams/6e374a5f-1368-4c8b-a218-6eda4313182a/projects/ed05a819-e5d0-41e7-ad22-2a5f91db6205

| Draft | O que é |
|---|---|
| `3b7eee1d` | **Layout aprovado** — simétrico, carta ao centro. Já implementado. |
| `d04a2713` / `ccb479f3` | Pacote lacrado e rasgo — bons, viraram a implementação |
| `4e37a5d7` | Carta emergindo — corrigido, ainda fraco |
| `c5b1a3be` | Página da carta |

**Limite conhecido da ferramenta:** ela desenha página plausível, e "plausível"
para carta de RPG inclui inventar atributos. Inventou tier LEGENDARY, stats
ATTACK/DEFENSE/SPEED, "720 HP" (o teto é 250) e texto de sabor humanizado
mesmo com proibição explícita no prompt. Serve para decidir **layout**; os
números vêm do domínio. Também julga mal qualquer coisa que dependa da arte real
— o placeholder cinza não mostra foil.

Créditos gastos: ~60,5.

## Bloqueado no autor

1. **Olhar o foil ao vivo** em `/torvalds`. Terceira tentativa no efeito, duas
   reprovadas. Está no DOM no tier certo e ausente no errado, mas ninguém julgou
   o resultado visual.
2. **Subir o Docker Desktop.** Com ele de pé, levantar um Redis e exercitar a
   atomicidade do script Lua — é o único caminho de código que iria para
   produção sem nunca ter rodado. A lógica em volta tem 15 testes com o cliente
   mockado; a atomicidade em si, nenhum.
3. **Classe de carta (ex, Mega ex).** O autor quer que ela seja o "overall" no
   lugar da nota do gitfut. A questão em aberto: se derivar da raridade, não
   acrescenta informação — no TCG real "ser ex" e "estar nos tiers altos" são o
   mesmo fato. Para valer como sinal, precisa medir outra dimensão, tipo
   concentração do perfil (250k estrelas num repo vs. espalhadas em quarenta).

## Próximo trabalho, já decidido

- **Derivações para cartas de repositório.** Hoje só perfil tem, então numa carta
  de repo as duas colunas laterais ficam vazias e sobra só a carta ao centro.
- **Ícones de tipo na interface.** Os 18 SVGs já são copiados para
  `public/assets/types/` pelo build, mas a web ainda não os usa.
- **RFCs que ainda falam em 7 elementos.** A raridade já ganhou adendo de
  supersessão; os tipos ainda não.

## Padrão que se repetiu, e vale herdar

**O que quebra em layout só quebra olhando.** Nesta sessão, typecheck e testes
passaram verdes enquanto: o dano do ataque sumia da carta, o título aparecia
duplicado, a coluna direita vazava da viewport, a frase de motivo subia acima do
valor, e o alvo de clique nunca assentava. Nenhum foi pego por teste — todos por
screenshot.

Corolário prático: **renderize e olhe antes de dizer que está pronto.** Vale
para carta (`PREVIEW=<dir> npx vitest run tests/unit/render-card.test.ts` grava
os PNGs) e para página (dev server + screenshot).

Segundo padrão: **cache mascara mudança de domínio.** O cache de cartas é em
memória em desenvolvimento e sobrevive ao hot reload. Toda vez que uma mudança
no domínio não apareceu, a causa foi essa — reinicie o servidor. E quando o
formato da carta muda, suba `CARD_VERSION`: já foi obrigatório duas vezes, por
`rarity: "holo"` e `element: "neutral"` que deixaram de existir e quebrariam ao
renderizar, não ao compilar.

## Ambiente

- `.env.local` existe com `GITHUB_TOKEN`. `REDIS_URL` está vazio — daí as cartas
  saírem sem serial.
- `npm run lint` está quebrado desde antes desta sessão (`next lint` foi removido
  no Next 16). O projeto não tem lint rodando.
- Os testes e2e sobem servidor pelo Playwright e já deixaram processo órfão na
  porta 3000.
