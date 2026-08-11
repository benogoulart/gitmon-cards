import type { Card } from "../cards/types";

export type Side = "a" | "b";

export interface BattleTurn {
  /** 1-based, contando os dois lados. */
  index: number;
  attacker: Side;
  /** `null` quando o lado não tem nenhum ataque — perfil sem repositórios. */
  attack: string | null;
  baseDamage: number;
  /** 2 super efetivo, 0.5 resistido, 1 normal. */
  multiplier: number;
  /** Dano final, já com efetividade e variância. */
  damage: number;
  /** HP do defensor depois do golpe. */
  defenderHp: number;
}

export interface BattleResult {
  id: string;
  /** Semente do sorteio. Guardada para o resultado ser reproduzível e auditável. */
  seed: number;
  createdAt: string;
  a: Card;
  b: Card;
  starter: Side;
  turns: BattleTurn[];
  /** `null` só no caso patológico de os dois lados não terem ataque nenhum. */
  winner: Side | null;
  finalHp: Record<Side, number>;
  /** `knockout` = HP zerou; `hp` = teto de turnos, decidido por % de HP restante. */
  decidedBy: "knockout" | "hp";
}
