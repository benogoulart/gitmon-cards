import { getProfileCard } from "@/lib/cards";
import { respondWithCard } from "@/lib/og/respond";

// sharp e as fontes vêm do disco: precisa do runtime Node, não do edge.
export const runtime = "nodejs";

/** Carta de perfil. Servida em `/<username>.png` pelo rewrite em next.config.ts. */
export async function GET(
  request: Request,
  { params }: { params: Promise<{ owner: string }> },
) {
  const { owner } = await params;
  return respondWithCard(request, () => getProfileCard(owner), owner);
}
