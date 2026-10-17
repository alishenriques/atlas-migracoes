import { Eyebrow, Panel, StatGrid, type Stat } from "@alishenriques/atlas-design-system";
import { getLocale, getTranslations } from "next-intl/server";

import { getOverview } from "@/lib/atlas";
import type { Overview } from "@/lib/schemas";
import { DemoNotice } from "@/shared/components/DemoNotice";

import { styles } from "./styles/index.styles";

async function loadOverview(): Promise<Overview | null> {
  try {
    return await getOverview();
  } catch (error) {
    // The page still renders without the counters; the cause goes to the server log.
    console.error("Failed to load the collection overview:", error instanceof Error ? error.message : error);
    return null;
  }
}

/** The Explorar screen. The map, filters and timeline arrive in stage 2 of the roadmap. */
export async function Home() {
  const [t, locale, overview] = await Promise.all([getTranslations("HOME"), getLocale(), loadOverview()]);
  const format = new Intl.NumberFormat(locale);

  const stats: Stat[] = overview
    ? [
        { value: format.format(overview.stats.artists), label: t("STATS.ARTISTS") },
        { value: format.format(overview.stats.works), label: t("STATS.WORKS") },
        { value: format.format(overview.stats.exhibitions), label: t("STATS.EXHIBITIONS") },
        { value: format.format(overview.stats.publications), label: t("STATS.PUBLICATIONS") },
        { value: format.format(overview.stats.originCountries), label: t("STATS.ORIGIN_COUNTRIES") },
      ]
    : [];

  return (
    <main className={styles.main}>
      <section className={styles.hero}>
        <Eyebrow>{t("EYEBROW")}</Eyebrow>
        <h1 className={styles.title}>{t("TITLE")}</h1>
        <p className={styles.subtitle}>{t("SUBTITLE")}</p>
      </section>

      {overview?.meta.source === "demo" && <DemoNotice />}

      <Panel title={t("STATS_TITLE")}>
        {overview ? <StatGrid stats={stats} /> : <p className={styles.muted}>{t("STATS_UNAVAILABLE")}</p>}
      </Panel>

      <p className={styles.muted}>{t("MAP_SOON")}</p>
    </main>
  );
}
