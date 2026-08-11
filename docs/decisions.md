# Decisões e questões abertas

Registro vivo. O RFC é a fonte da verdade do que foi planejado; este arquivo registra o que mudou
depois dele e o que ainda falta decidir.

## Decisões tomadas fora do RFC

| # | Decisão | Data | Motivo |
|---|---|---|---|
| D1 | **Repositório novo, não fork do gitfut.** O RFC seção 5 trava "fork do gitfut"; foi revertido. | 2026-08-10 | Um fork no GitHub carrega o selo "forked from", o histórico e o código de tema futebol de terceiro, e não acumula estrelas bem — e estrelas são o critério de sucesso nº 2 (RFC 9.8). Os padrões arquiteturais do gitfut continuam sendo a referência (RFC 4), lidos do código-fonte dele, sem herdar a base. |
| D2 | Nome do repositório: `gitmon-cards` | 2026-08-10 | RFC 5 deixou em aberto entre `gitmon` e `gitmon-cards`. |
| D3 | `app/[owner]/` como segmento dinâmico único, servindo perfil e dono de repo | 2026-08-10 | O App Router não permite dois segmentos dinâmicos irmãos no mesmo nível — `[username]` e `[owner]` do RFC colapsam num só. |

## Questões abertas

| # | Questão | Onde | Bloqueia |
|---|---|---|---|
| Q1 | Qual caminho de arte — A, B ou C? (recomendação: C) | RFC 8, `assets-brief.md` | Qualquer render fiel |
| Q2 | Fórmulas finais da carta de repositório | RFC 6.2, `data-mapping.md` | Rota `/<owner>/<repo>.png` |
| Q3 | 5 tiers de raridade no scoring × 3 símbolos no layout | `layout-spec.md` | Rodapé da carta |
| Q4 | Dimensão do canvas de render (largura base) | `layout-spec.md` | Toda a composição |
| Q5 | "Fraqueza a manutenção" não é um dos 7 elementos | `data-mapping.md` | Carta de repositório |
| Q6 | Onde persiste o `battle-id`? (Redis com TTL? determinístico por seed?) | RFC 7.3 | Batalha compartilhável |
| Q7 | Quem começa a batalha — desafiante sempre, ou sorteio? | RFC 7.3, item 5 | Motor de batalha |
| Q8 | O protótipo `github-card-prototype.html` ainda não está em `reference/` | RFC 12 | Faixas de raridade e mapa linguagem→elemento |

## Invariantes — não quebrar

- **Sem hardcode de domínio** em lugar nenhum (rewrites, metadata, OG tags). Variável de ambiente,
  porque o destino é um subdomínio de `scalabrin.dev` (RFC 11).
- **i18n desde a primeira tela**, não como retrofit. Toggle manual PT/EN, sem auto-detect (RFC 9.1).
- **A imagem exportada é limpa**: sem marca d'água, sem link de sponsor, sem animação. Monetização
  e branding vivem só no site (RFC 9.6, 7.2).
- **Cache da batalha é a exceção do projeto**: `/<a>/vs/<b>` não pode ter cache duro; só
  `/battle/<id>.png` pode (RFC 7.3).
- **Redis para dados do GitHub é obrigatório**, não otimização (RFC 11).
- **Nenhum asset de terceiro em produção** (RFC 11, `assets-brief.md`).
- **Repositório público desde já, divulgado só no lançamento** (RFC 9.7).
