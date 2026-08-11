"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

/**
 * Busca por usuário ou `owner/repo`. Aceita URL do GitHub colada inteira, porque
 * é o que a pessoa tem na mão quando chega aqui.
 */
export function SearchForm({
  placeholder,
  action,
}: {
  placeholder: string;
  action: string;
}) {
  const router = useRouter();
  const [value, setValue] = useState("");

  function submit(event: React.FormEvent) {
    event.preventDefault();
    const target = normalize(value);
    if (target) router.push(`/${target}`);
  }

  return (
    <form className="search-form" onSubmit={submit}>
      <input
        type="text"
        value={value}
        onChange={(event) => setValue(event.target.value)}
        placeholder={placeholder}
        aria-label={placeholder}
        autoComplete="off"
        spellCheck={false}
      />
      <button type="submit">{action}</button>
    </form>
  );
}

/** `https://github.com/facebook/react` e `@torvalds` chegam ao mesmo lugar. */
function normalize(raw: string): string | null {
  const trimmed = raw
    .trim()
    .replace(/^https?:\/\/(www\.)?github\.com\//i, "")
    .replace(/^@/, "")
    .replace(/^\/+|\/+$/g, "");

  if (!trimmed) return null;

  const parts = trimmed.split("/").filter(Boolean).slice(0, 2);
  return parts.join("/");
}
