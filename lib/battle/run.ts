import { getCard } from "../cards";
import { simulate } from "./engine";
import { newBattleId, saveBattle } from "./store";

/**
 * Sorteia uma batalha entre dois identificadores (`login` ou `owner/repo`) e
 * devolve o id do resultado.
 *
 * O fluxo é: `/<a>/vs/<b>` roda isto e redireciona para `/battle/<id>`. A URL do
 * confronto continua sorteando a cada visita, e o resultado ganha um link estável
 * que sempre mostra aquela batalha específica — que é exatamente a separação que
 * a RFC 7.3 pede entre "o confronto" e "um resultado".
 */
export async function runBattle(
  challengerId: string,
  opponentId: string,
): Promise<string> {
  const [a, b] = await Promise.all([getCard(challengerId), getCard(opponentId)]);

  const id = newBattleId();
  const result = simulate(a, b, id);
  await saveBattle(result);

  return id;
}
