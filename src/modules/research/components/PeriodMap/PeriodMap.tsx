import { Panel } from "@alishenriques/atlas-design-system";
import { useLocale, useTranslations } from "next-intl";

import { Link } from "@/i18n/navigation";
import { formatSourceDate } from "@/lib/research";
import type { ResearchPeriod } from "@/lib/schemas";

import { styles } from "./styles/index.styles";

export type PeriodMapProps = { period: ResearchPeriod | null };

/** The map of Europe on the artist's birth that the AI is given: the birthplace's state and the states then. */
export function PeriodMap({ period }: PeriodMapProps) {
  const t = useTranslations("RESEARCH");
  const locale = useLocale();

  return (
    <Panel title={t("PERIOD")}>
      {period ? (
        <div className={styles.root}>
          <p className={styles.label}>{t("PERIOD_DAY", { date: formatSourceDate(period.day, locale) })}</p>
          <div>
            <p className={styles.label}>{t("PERIOD_BIRTH_STATE")}</p>
            <p className={styles.state}>{period.birthState ?? t("PERIOD_NO_STATE")}</p>
          </div>
          {period.approximate && <p className={styles.note}>{t("PERIOD_APPROXIMATE")}</p>}
          <details>
            <summary className={styles.summary}>{t("PERIOD_STATES", { count: period.states.length })}</summary>
            <ul className={styles.states}>
              {period.states.map((state) => (
                <li key={state}>{state}</li>
              ))}
            </ul>
          </details>
          <p className={styles.note}>{t("PERIOD_SOURCE")}</p>
          <Link href="/camada-historica" className={styles.link}>
            {t("OPEN_LAYER")}
          </Link>
        </div>
      ) : (
        <p className={styles.note}>{t("PERIOD_UNAVAILABLE")}</p>
      )}
    </Panel>
  );
}
