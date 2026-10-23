import { Eyebrow, Panel } from "@alishenriques/atlas-design-system";
import { getTranslations } from "next-intl/server";

import type { MapData } from "@/lib/schemas";

import { HistoricalExplorer } from "./components/HistoricalExplorer";
import { styles } from "./styles/index.styles";

/** The Camada Histórica screen: Europe's state borders year by year, and the artists' places of origin in them. */
export async function HistoricalLayer({ data }: { data: MapData | null }) {
  const t = await getTranslations("HISTORICAL_LAYER");

  const header = (
    <header className={styles.header}>
      <Eyebrow>{t("EYEBROW")}</Eyebrow>
      <h1 className={styles.title}>{t("TITLE")}</h1>
      <p className={styles.intro}>{t("INTRO")}</p>
    </header>
  );
  const credit = <p>{t("CREDIT")}</p>;

  // As in Explorar, the map fills the screen and carries the presentation and the controls as floating
  // blocks; without the artists they fall back to a plain column.
  return (
    <main className={styles.page}>
      {data ? (
        <HistoricalExplorer artists={data.artists} intro={<Panel>{header}</Panel>} credit={credit} />
      ) : (
        <div className={styles.fallback}>
          {header}
          <p className={styles.muted}>{t("DATA_UNAVAILABLE")}</p>
          <div className={styles.credit}>{credit}</div>
        </div>
      )}
    </main>
  );
}
