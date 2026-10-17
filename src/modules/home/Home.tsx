import { Eyebrow, Panel, StatGrid, type Stat } from "@alishenriques/atlas-design-system";
import { getLocale, getTranslations } from "next-intl/server";

import { getMapData, getOverview } from "@/lib/atlas";
import type { MapData, Overview } from "@/lib/schemas";
import { DemoNotice } from "@/shared/components/DemoNotice";

import { Explorar } from "./components/Explorar";
import { styles } from "./styles/index.styles";

// Each block still renders when its query fails; the cause goes to the server log.
async function attempt<T>(what: string, load: () => Promise<T>): Promise<T | null> {
  try {
    return await load();
  } catch (error) {
    console.error(`Failed to load ${what}:`, error instanceof Error ? error.message : error);
    return null;
  }
}

/** The Explorar screen: the trajectories map with its filters, then the collection counters. */
export async function Home() {
  const [t, locale, overview, mapData] = await Promise.all([
    getTranslations("HOME"),
    getLocale(),
    attempt<Overview>("the collection overview", getOverview),
    attempt<MapData>("the map data", getMapData),
  ]);
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
    <main className={styles.page}>
      {overview?.meta.source === "demo" && (
        <div className={styles.notice}>
          <DemoNotice />
        </div>
      )}

      {mapData ? <Explorar artists={mapData.artists} /> : <p className={styles.mapUnavailable}>{t("MAP_UNAVAILABLE")}</p>}

      <div className={styles.main}>
        <section className={styles.hero}>
          <Eyebrow>{t("EYEBROW")}</Eyebrow>
          <h1 className={styles.title}>{t("TITLE")}</h1>
          <p className={styles.subtitle}>{t("SUBTITLE")}</p>
        </section>

        <Panel title={t("STATS_TITLE")}>
          {overview ? <StatGrid stats={stats} /> : <p className={styles.muted}>{t("STATS_UNAVAILABLE")}</p>}
        </Panel>
      </div>
    </main>
  );
}
