import { redirect } from "next/navigation";
import { ErrorState } from "@/components/ui/ErrorState";
import { Shell } from "@/components/ui/Shell";
import { runBattle } from "@/lib/battle/run";
import { getLocale } from "@/lib/i18n/server";

/**
 * Corpo compartilhado das rotas de confronto — perfil e repositório podem ser
 * qualquer um dos dois lados, então existem quatro combinações de URL e uma só
 * lógica.
 *
 * Sorteia e redireciona: o confronto não é uma página, é uma ação. O que tem
 * página é o resultado, em `/battle/<id>` (RFC 7.3).
 */
export async function VersusPage({
  challenger,
  opponent,
}: {
  challenger: string;
  opponent: string;
}) {
  const locale = await getLocale();

  let id: string;
  try {
    id = await runBattle(challenger, opponent);
  } catch (error) {
    return (
      <Shell locale={locale}>
        <ErrorState error={error} subject={`${challenger} vs ${opponent}`} locale={locale} />
      </Shell>
    );
  }

  redirect(`/battle/${id}`);
}
