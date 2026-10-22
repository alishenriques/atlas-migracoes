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

/** The Explorar screen: the trajectories map, with the filters, the presentation and the collection counters over it. */
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

  const notice = overview?.meta.source === "demo" && <DemoNotice />;

  const hero = (
    <section className={styles.hero}>
      <Eyebrow>{t("EYEBROW")}</Eyebrow>
      <h1 className={styles.title}>{t("TITLE")}</h1>
      <p className={styles.subtitle}>{t("SUBTITLE")}</p>
    </section>
  );

  const counters = (
    <Panel title={t("STATS_TITLE")}>
      {overview ? <StatGrid stats={stats} /> : <p className={styles.muted}>{t("STATS_UNAVAILABLE")}</p>}
    </Panel>
  );

  // The map fills the screen and carries the presentation and the counters as floating blocks;
  // without it they fall back to a plain column.
  return (
    <main className={styles.page}>
      {mapData ? (
        <Explorar
          artists={mapData.artists}
          intro={
            <>
              {notice}
              <Panel>{hero}</Panel>
            </>
          }
          footer={counters}
        />
      ) : (
        <div className={styles.main}>
          {notice}
          <p className={styles.muted}>{t("MAP_UNAVAILABLE")}</p>
          {hero}
          {counters}
        </div>
      )}
    </main>
  );
}
