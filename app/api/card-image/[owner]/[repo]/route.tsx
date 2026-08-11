import { getRepoCard } from "@/lib/cards";
import { respondWithCard } from "@/lib/og/respond";

export const runtime = "nodejs";

/** Carta de repositório. Servida em `/<owner>/<repo>.png` pelo rewrite. */
export async function GET(
  request: Request,
  { params }: { params: Promise<{ owner: string; repo: string }> },
) {
  const { owner, repo } = await params;
  return respondWithCard(request, () => getRepoCard(owner, repo), `${owner}/${repo}`);
}
