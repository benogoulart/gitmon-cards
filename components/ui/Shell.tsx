import Link from "next/link";
import { translator, type Locale } from "@/lib/i18n/dictionaries";
import { LocaleToggle } from "./LocaleToggle";

/**
 * Cabeçalho e rodapé do site.
 *
 * O patrocínio aparece **só aqui**, nunca na imagem exportada (RFC 9.6): o que
 * viaja para dentro do README de outra pessoa fica limpo. A marca pessoal é
 * discreta, um crédito no rodapé — o produto tem identidade própria (RFC 9.3).
 */
export function Shell({
  locale,
  children,
}: {
  locale: Locale;
  children: React.ReactNode;
}) {
  const t = translator(locale);

  return (
    <div className="shell">
      <header className="shell-header">
        <Link href="/" className="brand">
          <span className="brand-mark" aria-hidden="true" />
          <span className="brand-name">Gitmon</span>
        </Link>
        <div className="shell-actions">
          <a
            className="ghost-link"
            href="https://github.com/mcsscalabrin/gitmon-cards"
            target="_blank"
            rel="noreferrer noopener"
          >
            {t("home.viewOnGitHub")}
          </a>
          <LocaleToggle locale={locale} />
        </div>
      </header>

      <main className="shell-main">{children}</main>

      <footer className="shell-footer">
        <span>
          {t("home.madeBy")}{" "}
          <a href="https://scalabrin.dev" target="_blank" rel="noreferrer noopener">
            @scalabrin.dev
          </a>
        </span>
        <a
          className="sponsor"
          href="https://github.com/sponsors/mcsscalabrin"
          target="_blank"
          rel="noreferrer noopener"
        >
          {t("home.sponsor")}
        </a>
      </footer>
    </div>
  );
}
