import { ImageResponse } from "next/og";
import layout from "../cards/layout.json";
import type { GitmonErrorCode } from "../github/errors";
import { errorKey, translator, type Locale } from "../i18n/dictionaries";
import { CARD_FONT, loadFonts } from "./assets";

/**
 * Carta de erro.
 *
 * Um embed quebrado num README vira um ícone de imagem partida, que não diz nada
 * a ninguém. Devolver uma imagem com o motivo custa o mesmo e explica o problema
 * para quem colou o link. Mesmo tom técnico-neutro do resto (RFC 9.2).
 */
export async function renderErrorCard(
  code: GitmonErrorCode,
  subject: string,
  locale: Locale,
): Promise<ImageResponse> {
  const t = translator(locale);
  const fonts = await loadFonts();

  return new ImageResponse(
    (
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          width: layout.width,
          height: layout.height,
          padding: 48,
          gap: 18,
          background: "#161A22",
          border: "14px solid #262C38",
          borderRadius: layout.radius,
          fontFamily: CARD_FONT,
          textAlign: "center",
        }}
      >
        <div style={{ fontSize: 64, fontWeight: 900, color: "#39414F" }}>?</div>
        <div style={{ fontSize: 26, fontWeight: 900, color: "#E8EAEE", lineHeight: 1.3 }}>
          {t(errorKey(code))}
        </div>
        {subject ? (
          <div style={{ fontSize: 18, color: "#949CAB", fontWeight: 700 }}>{subject}</div>
        ) : null}
        <div style={{ fontSize: 15, color: "#5F6775", marginTop: 8 }}>Gitmon Cards</div>
      </div>
    ),
    { width: layout.width, height: layout.height, fonts },
  );
}
