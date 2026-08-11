import { VersusPage } from "@/components/battle/VersusPage";

/**
 * `/<perfil>/vs/<adversário>`. O adversário é catch-all porque pode ser um
 * repositório (`/torvalds/vs/facebook/react`).
 *
 * Sem cache: a batalha sorteia, e a mesma URL tem que poder dar outro resultado
 * (RFC 7.3/11). É a única rota do projeto com essa regra.
 */
export const dynamic = "force-dynamic";

export default async function Page({
  params,
}: {
  params: Promise<{ owner: string; opponent: string[] }>;
}) {
  const { owner, opponent } = await params;
  return <VersusPage challenger={owner} opponent={opponent.join("/")} />;
}
