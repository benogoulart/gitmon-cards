import { ELEMENT_COLORS } from "@/lib/cards/elements";
import type { Card } from "@/lib/cards/types";
import { absoluteUrl } from "@/lib/config";
import { elementKey, rarityKey, translator, type Locale } from "@/lib/i18n/dictionaries";
import { CopyField } from "@/components/ui/CopyField";
import { TiltCard } from "./TiltCard";

/**
 * A carta em si, com o que uma pessoa precisa depois de gerá-la: o snippet para
 * colar no README e a leitura dos números de onde cada stat saiu.
 */
export function CardPanel({
  card,
  locale,
  children,
}: {
  card: Card;
  locale: Locale;
  children?: React.ReactNode;
}) {
  const t = translator(locale);
  const imagePath = `/${card.id}.png`;
  const embedUrl = absoluteUrl(imagePath);
  const markdown = `[![${card.name}](${embedUrl})](${card.sourceUrl})`;
  const colors = ELEMENT_COLORS[card.element];

  return (
    <div className="card-panel" style={{ ["--element" as string]: colors.base }}>
      <TiltCard src={imagePath} alt={`${card.name} — ${t(elementKey(card.element))}`} priority />

      <div className="card-side">
        <div className="card-headline">
          <h1>{card.name}</h1>
          <p>
            {t(rarityKey(card.rarity))} · {t(elementKey(card.element))} ·{" "}
            {t(card.kind === "profile" ? "card.profile" : "card.repo")}
          </p>
        </div>

        <dl className="stat-grid">
          {card.stats.map((stat) => (
            <div key={stat.labelKey}>
              <dt>{t(stat.labelKey as Parameters<typeof t>[0])}</dt>
              <dd>{typeof stat.value === "number" ? stat.value.toLocaleString(locale) : stat.value}</dd>
            </div>
          ))}
        </dl>

        <section className="embed">
          <h2>{t("home.embed")}</h2>
          <CopyField value={markdown} copyLabel={t("home.copy")} copiedLabel={t("home.copied")} />
        </section>

        {children}
      </div>
    </div>
  );
}
