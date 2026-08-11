# reference/

Material de consulta. **Nada aqui é código de produção** e nada aqui é redistribuído.

## Conteúdo esperado

- `github-card-prototype.html` — protótipo de mapeamento GitHub → campos de carta, feito na sessão
  de planejamento (HTML/CSS/JS puro, sem motor de imagem). Contém as **faixas exatas de raridade** e
  o **mapa linguagem→elemento completo**, que devem ser transcritos de lá em vez de reinventados
  (RFC 6.1). **Ainda não presente — precisa ser colocado aqui.**

## Repositórios de referência (não versionados — ver `.gitignore`)

Clonar localmente aqui se precisar consultar o código:

| Repo | Para quê |
|---|---|
| [Younesfdj/gitfut](https://github.com/Younesfdj/gitfut) | Arquitetura de dados, cache, geração de imagem e embed. Ler `app/api/card-image/`, `lib/og/renderCard.tsx`, `components/PlayerCard.tsx`, `TiltCard.tsx`. **`lib/duel.ts` não serve** — comparação estática de stats, mecânica diferente da nossa (RFC 7.3). |
| [bartduisters/trading-card-generator](https://github.com/bartduisters/trading-card-generator) | Estrutura de dados de uma carta e proporção física (8.8cm × 6.3cm). Ícones creditados a ILKCMP — **não usar**. |
| [pixegami/pokemon-card-generator](https://github.com/pixegami/pokemon-card-generator) | Só `render_cards.py` — spec de posição pixel-a-pixel, já extraída em [`../docs/layout-spec.md`](../docs/layout-spec.md). Templates creditados a TheDuckTamerBlanks — **não usar**. |
