"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { LOCALES, LOCALE_COOKIE, type Locale } from "@/lib/i18n/dictionaries";

/** Toggle manual PT/EN (RFC 9.1). A escolha vive num cookie de um ano. */
export function LocaleToggle({ locale }: { locale: Locale }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  function choose(next: Locale) {
    if (next === locale) return;
    document.cookie = `${LOCALE_COOKIE}=${next}; path=/; max-age=31536000; samesite=lax`;
    // O idioma é resolvido no servidor, então a árvore precisa ser refeita lá.
    startTransition(() => router.refresh());
  }

  return (
    <div className="locale-toggle" data-pending={pending || undefined}>
      {LOCALES.map((option) => (
        <button
          key={option}
          type="button"
          onClick={() => choose(option)}
          aria-pressed={option === locale}
          aria-label={option === "pt" ? "Português" : "English"}
        >
          {option.toUpperCase()}
        </button>
      ))}
    </div>
  );
}
