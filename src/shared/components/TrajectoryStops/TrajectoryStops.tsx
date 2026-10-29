import { ReliabilityTag } from "@alishenriques/atlas-design-system";
import { useLocale, useTranslations } from "next-intl";

import { formatFuzzyDate } from "@/lib/dates";
import { placeName, type Stop, type Trajectory } from "@/lib/trajectory";

import { styles } from "./styles/index.styles";

export type TrajectoryStopsProps = {
  trajectory: Trajectory;
  /** The stops to list; defaults to the whole trajectory. */
  stops?: Stop[];
  /** Shows the "inferred" tag; off where the tag is already beside the list, e.g. in the record's section header. */
  tag?: boolean;
};

/**
 * An artist's trajectory as a dated list, tagged as inferred and explaining
 * what was left out, so the reader knows how the line on the map was drawn.
 */
export function TrajectoryStops({ trajectory, stops = trajectory.stops, tag = true }: TrajectoryStopsProps) {
  const t = useTranslations("TRAJECTORY");
  const locale = useLocale();

  return (
    <div className={styles.root}>
      {tag && <ReliabilityTag level="inferred" label={t("INFERRED")} />}
      <p className={styles.note}>{t("METHOD")}</p>
      <ol className={styles.stops}>
        {stops.map((stop, index) => (
          <li key={index} className={styles.stop}>
            <span className={styles.meta}>
              {t(`STOP.${stop.kind.toUpperCase() as Uppercase<Stop["kind"]>}`)} ·{" "}
              {formatFuzzyDate(stop.date, locale, t("UNKNOWN_DATE"))}
            </span>
            <span>{placeName(stop.place)}</span>
            {stop.title && <span className={styles.title}>{stop.title}</span>}
          </li>
        ))}
      </ol>
      {trajectory.posthumous > 0 && <p className={styles.note}>{t("POSTHUMOUS", { count: trajectory.posthumous })}</p>}
      {trajectory.undrawn > 0 && <p className={styles.note}>{t("UNDRAWN", { count: trajectory.undrawn })}</p>}
    </div>
  );
}
