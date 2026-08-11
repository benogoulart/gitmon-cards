"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

/**
 * Manda para `/<desafiante>/vs/<adversário>`, que sorteia uma batalha nova e
 * redireciona para o resultado. Cada envio dá um resultado diferente — é o ponto
 * da mecânica (RFC 7.3).
 */
export function BattleForm({
  challenger,
  label,
  placeholder,
  action,
}: {
  challenger: string;
  label: string;
  placeholder: string;
  action: string;
}) {
  const router = useRouter();
  const [opponent, setOpponent] = useState("");
  const [pending, startTransition] = useTransition();

  function submit(event: React.FormEvent) {
    event.preventDefault();
    const target = opponent.trim().replace(/^@/, "").replace(/^\/+|\/+$/g, "");
    if (!target) return;
    startTransition(() => router.push(`/${challenger}/vs/${target}`));
  }

  return (
    <form className="battle-form" onSubmit={submit}>
      <h2>{label}</h2>
      <div className="battle-form-row">
        <input
          type="text"
          value={opponent}
          onChange={(event) => setOpponent(event.target.value)}
          placeholder={placeholder}
          aria-label={placeholder}
          autoComplete="off"
          spellCheck={false}
        />
        <button type="submit" disabled={pending}>
          {action}
        </button>
      </div>
    </form>
  );
}
