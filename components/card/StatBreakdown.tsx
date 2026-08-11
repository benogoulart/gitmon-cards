import type { Derivation } from "@/lib/cards/types";
import { translator, type Locale, type MessageKey } from "@/lib/i18n/dictionaries";

/**
 * De onde saiu cada número da carta.
 *
 * Inspirado no gitfut: lá, nenhum atributo aparece sozinho — "Skill moves"
 * vem com "technical range: 2 languages", "Work rate" vem com "attack from
 * shipping output, defense from reviews". O número sem a origem é só um número;
 * com a origem, vira leitura do perfil de quem está olhando.
 *
 * Vive **só no site**. O PNG exportado continua limpo (RFC 9.6), e é por isso
 * que `derivations` é opcional no domínio: o renderizador de imagem nunca o lê.
 */
function localize(
  params: Derivation["reasonParams"],
  locale: Locale,
): Record<string, string | number> | undefined {
  if (!params) return undefined;
  return Object.fromEntries(
    Object.entries(params).map(([key, value]) => [
      key,
      typeof value === "number" ? value.toLocaleString(locale) : value,
    ]),
  );
}

export function StatBreakdown({
  derivations,
  locale,
}: {
  derivations: Derivation[];
  locale: Locale;
}) {
  const t = translator(locale);

  return (
    <section className="why">
      <h2>{t("why.title")}</h2>
      <ul>
        {derivations.map((item) => (
          <li key={item.labelKey}>
            <span className="why-label">{t(item.labelKey as MessageKey)}</span>
            {/*
              `value` guarda uma chave i18n quando o valor é um termo do domínio
              (tipo, raridade) e o texto cru quando é número. Traduzir o que não
              é chave devolveria a própria string, então a checagem evita um
              "250" virar chave inexistente.
            */}
            <strong className="why-value">
              {item.value.includes(".") ? t(item.value as MessageKey) : item.value}
            </strong>
            {/*
              Números viram texto com separador de milhar aqui, e não no
              construtor da carta: separador depende do idioma, e o domínio é
              puro — não conhece locale.
            */}
            <span className="why-reason">
              {t(item.reasonKey as MessageKey, localize(item.reasonParams, locale))}
            </span>
          </li>
        ))}
      </ul>
    </section>
  );
}
