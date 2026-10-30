"use client";

import { Panel, ReliabilityTag, Toggletip } from "@alishenriques/atlas-design-system";
import { useLocale, useTranslations } from "next-intl";

import { formatFuzzyDate } from "@/lib/dates";
import { asFuzzyDate, factSpan, factsOfYear, factText } from "@/lib/historicalFacts";

import { styles } from "./styles/index.styles";
import { useHistoricalFacts } from "../../hooks/useHistoricalFacts";

export type HistoricalFactsProps = {
  /** The year chosen on the Camada Histórica. */
  year: number;
};

/**
 * The block of historical facts of the chosen year: what happened in Europe
 * and in Brazil that year and the longer events still under way, each linked
 * to its Wikipedia article. Chosen by the platform, so labelled inferred.
 * A panel of its own, floating on the right of the map on desktop.
 */
export function HistoricalFacts({ year }: HistoricalFactsProps) {
  const t = useTranslations("HISTORICAL_LAYER.FACTS");
  const locale = useLocale();
  const loaded = useHistoricalFacts();
  const { inYear, ongoing } = loaded.status === "ready" ? factsOfYear(loaded.facts, year) : { inYear: [], ongoing: [] };

  return (
    <Panel
      title={t("TITLE")}
      className={styles.panel}
      action={
        <span className={styles.tags}>
          <ReliabilityTag level="inferred" label={t("INFERRED")} />
          <Toggletip align="end" trigger={<span className="sr-only">{t("ABOUT")}</span>}>
            <span className={styles.infoText}>{t("INFO")}</span>
          </Toggletip>
        </span>
      }
    >
      {loaded.status === "loading" && <p className={styles.status}>{t("LOADING")}</p>}
      {loaded.status === "error" && <p className={styles.status}>{t("UNAVAILABLE")}</p>}
      {loaded.status === "ready" && inYear.length === 0 && ongoing.length === 0 && (
        <p className={styles.status}>{t("NONE", { year })}</p>
      )}

      {inYear.length > 0 && (
        <>
          <h3 className={styles.groupTitle}>{t("IN_YEAR", { year })}</h3>
          <ul className={styles.facts}>
            {inYear.map((fact) => {
              const { title, text, url } = factText(fact, locale);
              return (
                <li key={fact.id} className={styles.fact}>
                  <span className={styles.date}>{formatFuzzyDate(asFuzzyDate(fact.start), locale, "")}</span>
                  <a href={url} target="_blank" rel="noreferrer" className={styles.factTitle}>
                    {title}
                  </a>
                  <p className={styles.text}>{text}</p>
                </li>
              );
            })}
          </ul>
        </>
      )}

      {ongoing.length > 0 && (
        <>
          <h3 className={styles.groupTitle}>{t("ONGOING")}</h3>
          <ul className={styles.ongoing}>
            {ongoing.map((fact) => {
              const { title, url } = factText(fact, locale);
              return (
                <li key={fact.id}>
                  <a href={url} target="_blank" rel="noreferrer" className={styles.ongoingItem}>
                    {title} ({factSpan(fact)})
                  </a>
                </li>
              );
            })}
          </ul>
        </>
      )}

      {loaded.status === "ready" && <p className={styles.credit}>{t("CREDIT")}</p>}
    </Panel>
  );
}
