# Mapeamento GitHub → campos da carta

Fonte: RFC seção 6. Copy do tom: **técnico-neutro** — o dado fala por si, sem flavor text
inventado (RFC 9.2).

## Carta de perfil

Origem: `GET /users/{username}` + `GET /users/{username}/repos?per_page=100`

| Campo | Fórmula |
|---|---|
| HP | `clamp(30 + estrelasTotais×3 + seguidores×1 + reposPúblicos×2, 30, 250)`, arredondado pra dezena |
| Tipo | Linguagem mais frequente entre os repos próprios, ponderada por estrelas → mapa linguagem→elemento |
| Ataques | 2 repositórios mais estrelados. `damage = clamp(estrelas×4, 10, 300)`; `text` = descrição truncada |
| Fraqueza | Segunda linguagem mais frequente, `×2` |
| Recuo | `clamp(round(idadeContaEmAnos / 2), 1, 4)` pips |
| Raridade | `score = estrelasTotais×2 + seguidores×3 + reposPúblicos + idadeContaEmAnos×5` → faixas |
| Arte | `avatar_url` |
| Rodapé | bio truncada + ano de criação da conta |

Tiers de raridade: `common / uncommon / rare / holo / secret`.
**Faixas exatas e o mapa linguagem→elemento completo estão no protótipo** (`reference/github-card-prototype.html`)
e devem ser transcritos de lá — não reinventados.

## Carta de repositório

**Não fechada no planejamento** (RFC 6.2) — precisa de uma rodada de decisão antes de implementar.
Proposta inicial:

| Campo | Fórmula proposta |
|---|---|
| HP | Baseado em `stargazers_count` |
| Tipo | Linguagem principal do repositório |
| Ataques | Top contribuidores (nome = ataque, contribuições = dano) **ou** releases marcantes |
| Fraqueza | `open_issues_count` alto → fraqueza a "manutenção" |
| Raridade | Estrelas + forks + frequência de commits recentes |
| Arte | `owner.avatar_url` ou social preview do repo, se exposto pela API |

Pontos a resolver: contribuidores custam uma chamada a mais por carta (impacto no rate limit e no
cache); "fraqueza a manutenção" não é um dos 7 elementos, então ou vira um elemento existente ou
quebra o modelo de tipos.

## Casos de borda

| Caso | Comportamento |
|---|---|
| Usuário inexistente | Erro claro, tom técnico-neutro (RFC 9.2) |
| `type: Organization` | **Fora da v1** — detectar e devolver erro explícito, não gerar carta degradada (RFC 9.5) |
| Perfil sem repositórios | Carta válida com tipo `neutral` e sem ataques — definir fallback |
| Perfil sem linguagem detectável | `neutral` |
| Rate limit atingido | Erro explícito; cache Redis é obrigatório, não opcional (RFC 11) |

## Motor de batalha

Ver RFC 7.3. Resumo: HP inicial = HP da carta; ataque escolhido aleatoriamente entre os 2 a cada
turno; dano `×` efetividade de tipo (`×2` / `×0.5`, tabela em [`layout-spec.md`](layout-spec.md))
`×` variância de ±15%; alterna turnos, desafiante começa; termina em HP ≤ 0 ou teto de 20 turnos
(vence maior % de HP restante).

O resultado gera um `battle-id` imutável — é ele, e não o par de usuários, que é cacheável.
