import { Eyebrow } from "@alishenriques/atlas-design-system";
import { getTranslations } from "next-intl/server";

import type { MapData } from "@/lib/schemas";

import { HistoricalExplorer } from "./components/HistoricalExplorer";
import { styles } from "./styles/index.styles";

/** The Camada Histórica screen: Europe's state borders year by year, and the artists' places of origin in them. */
export async function HistoricalLayer({ data }: { data: MapData | null }) {
  const t = await getTranslations("HISTORICAL_LAYER");

  return (
    <main className={styles.page}>
      <header className={styles.header}>
        <Eyebrow>{t("EYEBROW")}</Eyebrow>
        <h1 className={styles.title}>{t("TITLE")}</h1>
        <p className={styles.intro}>{t("INTRO")}</p>
      </header>

      {data ? <HistoricalExplorer artists={data.artists} /> : <p className={styles.muted}>{t("DATA_UNAVAILABLE")}</p>}

      <footer className={styles.credit}>
        <p>{t("CREDIT")}</p>
      </footer>
    </main>
  );
}
