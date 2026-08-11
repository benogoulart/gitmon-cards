import type { Metadata } from "next";
import Link from "next/link";
import { BattleForm } from "@/components/battle/BattleForm";
import { CardPanel } from "@/components/card/CardPanel";
import { ErrorState } from "@/components/ui/ErrorState";
import { Shell } from "@/components/ui/Shell";
import { getRepoCard } from "@/lib/cards";
import { absoluteUrl } from "@/lib/config";
import { translator } from "@/lib/i18n/dictionaries";
import { getLocale } from "@/lib/i18n/server";

type Params = { params: Promise<{ owner: string; repo: string }> };

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { owner, repo } = await params;
  const image = absoluteUrl(`/${owner}/${repo}.png`);
  return {
    title: `${owner}/${repo}`,
    openGraph: { images: [image] },
    twitter: { card: "summary_large_image", images: [image] },
  };
}

export default async function RepoPage({ params }: Params) {
  const { owner, repo } = await params;
  const locale = await getLocale();
  const t = translator(locale);

  let card;
  try {
    card = await getRepoCard(owner, repo);
  } catch (error) {
    return (
      <Shell locale={locale}>
        <ErrorState error={error} subject={`${owner}/${repo}`} locale={locale} />
      </Shell>
    );
  }

  return (
    <Shell locale={locale}>
      <CardPanel card={card} locale={locale}>
        <BattleForm
          challenger={`${owner}/${repo}`}
          label={t("home.battle")}
          placeholder={t("home.opponent")}
          action={t("home.battleAction")}
        />
        <p className="owner-link">
          <Link href={`/${owner}`}>{owner}</Link>
        </p>
      </CardPanel>
    </Shell>
  );
}
