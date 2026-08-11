import { cookies } from "next/headers";
import {
  DEFAULT_LOCALE,
  LOCALE_COOKIE,
  parseLocale,
  translator,
  type Locale,
} from "./dictionaries";

/**
 * Idioma da interface, lido do cookie.
 *
 * Cookie e não header `Accept-Language`: a decisão é toggle manual, não
 * auto-detect por navegador (RFC 9.1). Um dev brasileiro que prefere a interface
 * em inglês precisa poder escolher isso, e a escolha precisa durar.
 */
export async function getLocale(): Promise<Locale> {
  const store = await cookies();
  return parseLocale(store.get(LOCALE_COOKIE)?.value, DEFAULT_LOCALE);
}

export async function getTranslator() {
  return translator(await getLocale());
}
