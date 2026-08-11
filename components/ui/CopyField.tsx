"use client";

import { useState } from "react";

/** Campo de código com botão de copiar. Usado pelos snippets de embed. */
export function CopyField({
  value,
  copyLabel,
  copiedLabel,
}: {
  value: string;
  copyLabel: string;
  copiedLabel: string;
}) {
  const [copied, setCopied] = useState(false);

  async function copy() {
    try {
      await navigator.clipboard.writeText(value);
    } catch {
      // Sem permissão de clipboard (http, navegador antigo): o texto está
      // visível e selecionável de qualquer forma. Não vale interromper com erro.
      return;
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 1600);
  }

  return (
    <div className="copy-field">
      <code>{value}</code>
      <button type="button" onClick={copy}>
        {copied ? copiedLabel : copyLabel}
      </button>
    </div>
  );
}
