import type { Metadata } from "next";
import Link from "next/link";
import { CardPanel } from "@/components/card/CardPanel";
import { BattleForm } from "@/components/battle/BattleForm";
import { ErrorState } from "@/components/ui/ErrorState";
import { Shell } from "@/components/ui/Shell";
import { getProfileCard, getProfileRepos } from "@/lib/cards";
import { cardMetadata } from "@/lib/metadata";
import { translator } from "@/lib/i18n/dictionaries";
import { getLocale } from "@/lib/i18n/server";

type Params = { params: Promise<{ owner: string }> };

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { owner } = await params;
  return cardMetadata({
    subject: owner,
    path: `/${owner}`,
    ogPath: `/api/card-og/${owner}`,
    locale: await getLocale(),
  });
}

export default async function ProfilePage({ params }: Params) {
  const { owner } = await params;
  const locale = await getLocale();
  const t = translator(locale);

  let card;
  try {
    card = await getProfileCard(owner);
  } catch (error) {
    return (
      <Shell locale={locale}>
        <ErrorState error={error} subject={owner} locale={locale} />
      </Shell>
    );
  }

  // Depois de buscar um perfil, a interface lista os repositórios dele como
  // opção de clique — o segundo dos dois caminhos exigidos pela RFC 9.4.
  const repos = await getProfileRepos(owner);

  return (
    <Shell locale={locale}>
      <CardPanel card={card} locale={locale}>
        <BattleForm
          challenger={owner}
          label={t("home.battle")}
          placeholder={t("home.opponent")}
          action={t("home.battleAction")}
        />
      </CardPanel>

      {repos.length > 0 ? (
        <section className="repo-list">
          <h2>{t("home.repos")}</h2>
          <ul>
            {repos.map((repo) => (
              <li key={repo.name}>
                <Link href={`/${owner}/${repo.name}`}>
                  <span className="repo-name">{repo.name}</span>
                  <span className="repo-meta">
                    {repo.language ? <em>{repo.language}</em> : null}
                    <b>★ {repo.stars.toLocaleString(locale)}</b>
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      ) : null}
    </Shell>
  );
}
