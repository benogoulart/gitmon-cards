import { VersusPage } from "@/components/battle/VersusPage";

/** `/<owner>/<repo>/vs/<adversário>` — carta de repositório como desafiante. */
export const dynamic = "force-dynamic";

export default async function Page({
  params,
}: {
  params: Promise<{ owner: string; repo: string; opponent: string[] }>;
}) {
  const { owner, repo, opponent } = await params;
  return <VersusPage challenger={`${owner}/${repo}`} opponent={opponent.join("/")} />;
}
