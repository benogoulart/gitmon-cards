import Link from "next/link";
import { isGitmonError } from "@/lib/github/errors";
import { errorKey, translator, type Locale } from "@/lib/i18n/dictionaries";

/**
 * Estado de erro da interface. Mesmo tom técnico-neutro da carta: diz o que
 * aconteceu e para. Sem piada, sem humanização (RFC 9.2).
 */
export function ErrorState({
  error,
  subject,
  locale,
}: {
  error: unknown;
  subject: string;
  locale: Locale;
}) {
  const t = translator(locale);
  const code = isGitmonError(error) ? error.code : "upstream";

  return (
    <div className="error-state">
      <p className="error-subject">{subject}</p>
      <h1>{t(errorKey(code))}</h1>
      <Link className="button" href="/">
        Gitmon
      </Link>
    </div>
  );
}
