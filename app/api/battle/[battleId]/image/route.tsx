import { loadBattle } from "@/lib/battle/store";
import { BATTLE_IMAGE_CACHE_CONTROL } from "@/lib/config";
import { DEFAULT_CARD_LOCALE, parseLocale } from "@/lib/i18n/dictionaries";
import { renderBattle } from "@/lib/og/renderBattle";
import { renderErrorCard } from "@/lib/og/renderError";

export const runtime = "nodejs";

/**
 * Pôster do resultado, servido em `/battle/<id>.png` pelo rewrite.
 *
 * Esta é a única rota do projeto com cache imutável: um resultado já sorteado não
 * muda nunca (RFC 7.3). O confronto genérico entre dois usuários, esse não pode
 * ser cacheado — vive em `/<a>/vs/<b>` e sorteia de novo a cada visita.
 */
export async function GET(
  request: Request,
  { params }: { params: Promise<{ battleId: string }> },
) {
  const { battleId } = await params;
  const locale = parseLocale(
    new URL(request.url).searchParams.get("lang"),
    DEFAULT_CARD_LOCALE,
  );

  const battle = await loadBattle(battleId);

  if (!battle) {
    const image = await renderErrorCard("battle_expired", battleId, locale);
    return withHeaders(image, "public, max-age=60, s-maxage=60", 404);
  }

  const image = await renderBattle(battle, locale);
  return withHeaders(image, BATTLE_IMAGE_CACHE_CONTROL);
}

function withHeaders(image: Response, cacheControl: string, status = 200): Response {
  const headers = new Headers(image.headers);
  headers.set("Cache-Control", cacheControl);
  headers.set("Content-Type", "image/png");
  return new Response(image.body, { status, headers });
}
