import { randomBytes } from "node:crypto";
import { get, put } from "../cache/redis";
import { BATTLE_TTL_SECONDS } from "../config";
import type { BattleResult } from "./types";

/**
 * Um resultado de batalha é imutável depois de sorteado, então recebe identidade
 * própria e pode ser cacheado normalmente — ao contrário da rota `/<a>/vs/<b>`,
 * que precisa poder sortear de novo (RFC 7.3).
 *
 * O que é guardado é o resultado inteiro, com as duas cartas embutidas: se
 * guardássemos só os logins, reabrir o link daqui a um mês mostraria a batalha
 * recalculada com outras estrelas, e o link deixaria de significar o que
 * significava quando foi compartilhado.
 */

const KEY = (id: string) => `battle:v1:${id}`;

/** 16 caracteres hex: colável, curto e sem colisão prática. */
export function newBattleId(): string {
  return randomBytes(8).toString("hex");
}

const ID = /^[0-9a-f]{16}$/;

export function isValidBattleId(id: string): boolean {
  return ID.test(id);
}

export async function saveBattle(result: BattleResult): Promise<void> {
  await put(KEY(result.id), result, BATTLE_TTL_SECONDS);
}

export async function loadBattle(id: string): Promise<BattleResult | null> {
  if (!isValidBattleId(id)) return null;
  return get<BattleResult>(KEY(id));
}
