# Gitmon Cards

Gerador de cartas de trading card game a partir de dados reais do GitHub.
Uma URL de imagem estática, sem login, embutível em qualquer README, que se atualiza sozinha.

```
<host>/<username>.png            → carta de perfil
<host>/<owner>/<repo>.png        → carta de repositório
<host>/battle/<battle-id>.png    → resultado estático de uma batalha
```

> **Status:** v1 funcional em desenvolvimento local. Cartas de perfil e de repositório, batalha
> com resultado compartilhável, site bilíngue. Não publicado — ver `docs/decisions.md` (Q12).
> A especificação completa está em [`docs/rfc-001-gitmon-cards.md`](docs/rfc-001-gitmon-cards.md).

## Rodando

```bash
npm install
cp .env.example .env.local   # preencha GITHUB_TOKEN
npm run dev
```

`GITHUB_TOKEN` é um token de leitura pública qualquer (5.000 req/h). Sem ele, as rotas de imagem
devolvem uma carta de erro dizendo isso. `REDIS_URL` é opcional em desenvolvimento — sem ele o
cache é por processo; em produção é obrigatório (RFC 11).

| Comando | O que faz |
|---|---|
| `npm run dev` | Servidor de desenvolvimento |
| `npm test` | Testes unitários (fórmulas, batalha, renderização) |
| `PREVIEW=<dir> npm test` | Grava os PNGs renderizados em disco para inspeção visual |
| `npm run assets` | Regenera molduras, ícones e foil a partir de `scripts/lib/art.mjs` |
| `npm run fonts` | Baixa e subseta a fonte da carta |
| `npm run test:e2e` | Playwright (precisa de `npx playwright install chromium`) |

A arte e as fontes são versionadas — `assets` e `fonts` só precisam rodar quando o desenho ou o
repertório de caracteres mudar.

---

## Stack (travada no RFC, seção 5)

| Camada | Escolha |
|---|---|
| Framework | Next.js 16 (App Router) + React 19 |
| Geração da imagem | `next/og` (`ImageResponse` / Satori) + `sharp` para composição |
| Cache de dados | Redis via `ioredis` |
| Cache da imagem | HTTP `Cache-Control` na CDN — **sem** Blob/object storage |
| Auth GitHub | Token de app no servidor (5.000 req/h), sem login do visitante |
| Hospedagem | Vercel |

**Princípio central (RFC 4.3):** a complexidade visual é resolvida *antes*, como arte estática
pré-renderizada, não em runtime. O servidor só compõe — posiciona texto e cola uma imagem
recortada sobre uma moldura PNG. Nada de browser headless.

## Estrutura de pastas

```
app/
  [owner]/                     rota raiz dinâmica — serve perfil e repositório
    page.tsx                   carta de perfil (web, interativa)
    [repo]/                    carta de repositório (web, interativa)
    vs/[opponent]/             batalha 1v1 (RFC 7)
  battle/[battleId]/           resultado imutável e compartilhável de uma batalha
  api/
    card-image/[owner]/        rota de imagem do perfil    → reescrita de /<user>.png
    card-image/[owner]/[repo]/ rota de imagem do repo      → reescrita de /<owner>/<repo>.png
    battle/                    execução da simulação + emissão do battle-id
    github/                    proxy/consulta usada pela UI web

components/
  card/                        carta interativa (tilt 3D, animação de revelação)
  battle/                      animação de turnos e placar
  ui/                          primitivas compartilhadas, toggle PT/EN

lib/
  github/                      cliente da API do GitHub + erros tipados
  cards/                       scoring: HP, tipo, ataques, fraqueza, recuo, raridade
    layout.json                geometria da carta em pixels — fonte única
    palette.json               cor dos 7 elementos — fonte única
  battle/                      motor de simulação turno-a-turno (RFC 7.3)
  og/                          renderCard, renderBattle — Satori + composição sharp
  cache/                       Redis, com fallback em memória para dev
  i18n/                        dicionários PT/EN (obrigatório desde a v1, RFC 9.1)
  config.ts                    URLs e políticas de cache — sem domínio hardcoded

scripts/
  build-assets.mjs             gera moldura, energia, recuo e foil (SVG → PNG)
  build-fonts.mjs              baixa e subseta a fonte da carta

public/assets/
  frames/                      7 molduras, uma por elemento — arte ORIGINAL
  energy/                      ícones de custo de energia — arte ORIGINAL
  icons/                       ícones de tipo, raridade
  fonts/

public/samples/                cartas fixas exibidas na home (RFC 9.4)

docs/                          RFC + specs derivadas
reference/                     material de consulta (não é código de produção)
scripts/                       automações de build/asset
tests/                         unit + e2e (Playwright)
```

### Notas de rota

- `/<user>.png` e `/<owner>/<repo>.png` são **rewrites** em `next.config` apontando para as
  rotas em `app/api/card-image/`. A extensão `.png` na URL pública é cosmética — é o que torna
  o link colável em Markdown.
- `app/[owner]/` é um único segmento dinâmico servindo perfil **e** dono de repositório: o App
  Router não permite dois segmentos dinâmicos irmãos no mesmo nível, então `[username]` e
  `[owner]` do RFC colapsam num só.
- A rota de batalha `/<a>/vs/<b>` **não pode ter cache duro** (a simulação é aleatória).
  Só `/battle/<battle-id>.png` é cacheável, porque representa um resultado já sorteado (RFC 7.3).

## Documentação

| Arquivo | Conteúdo |
|---|---|
| [`docs/rfc-001-gitmon-cards.md`](docs/rfc-001-gitmon-cards.md) | RFC completo, aprovado — fonte da verdade |
| [`docs/layout-spec.md`](docs/layout-spec.md) | Posições em pixel da composição da carta e tabela dos 7 elementos |
| [`docs/data-mapping.md`](docs/data-mapping.md) | Fórmulas GitHub → campos da carta |
| [`docs/assets-brief.md`](docs/assets-brief.md) | Briefing da arte original (molduras, energia, raridade) |
| [`docs/decisions.md`](docs/decisions.md) | Decisões travadas e questões ainda abertas |

## Direitos autorais

Nenhum asset da Pokémon Company, nenhum ícone de fã dos repositórios de referência.
Toda arte de moldura, tipo e energia deste projeto é original. Ver `docs/assets-brief.md`.

## Licença

MIT © Matheus Scalabrin
