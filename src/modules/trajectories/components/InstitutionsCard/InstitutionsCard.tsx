"use client";

import { useId, useState } from "react";

import { FactIcon } from "@alishenriques/atlas-design-system";
import { useTranslations } from "next-intl";

import { placeName } from "@/lib/trajectory";
import type { InstitutionSummary } from "@/modules/trajectories/utils/profile";

import { styles } from "./styles/index.styles";

/** How many institutions show before "See all". */
export const INSTITUTIONS_SHOWN = 5;

/**
 * The institutions that showed the artist's works, each with where and how
 * often; the first few at once, the rest sliding open behind "See all (N)".
 */
export function InstitutionsCard({ institutions }: { institutions: InstitutionSummary[] }) {
  const t = useTranslations("TRAJECTORIES");
  const [expanded, setExpanded] = useState(false);
  const restId = useId();
  const first = institutions.slice(0, INSTITUTIONS_SHOWN);
  const rest = institutions.slice(INSTITUTIONS_SHOWN);

  const detail = ({ place, exhibitions, years }: InstitutionSummary) =>
    [
      place ? `${placeName(place)}, ${place.country}` : null,
      t("INSTITUTION_EXHIBITIONS", { count: exhibitions }),
      years ? (years.from === years.to ? String(years.from) : `${years.from}–${years.to}`) : null,
    ]
      .filter(Boolean)
      .join(" · ");

  const item = (institution: InstitutionSummary) => (
    <li key={institution.name} className={styles.item}>
      <span className={styles.icon}>
        <FactIcon name="institution" size={20} />
      </span>
      <span className={styles.text}>
        <span className={styles.name}>{institution.name}</span>
        <span className={styles.detail}>{detail(institution)}</span>
      </span>
    </li>
  );

  return (
    <section className={styles.card} aria-labelledby="record-institutions">
      <h2 id="record-institutions" className={styles.title}>
        {t("INSTITUTIONS")}
      </h2>

      {institutions.length === 0 ? (
        <p className={styles.empty}>{t("NO_INSTITUTIONS")}</p>
      ) : (
        <ul className={styles.list}>{first.map(item)}</ul>
      )}

      {rest.length > 0 && (
        // The rest slides open below the first ones; closed, it is out of reach.
        <div id={restId} className={styles.rest} data-open={expanded} inert={!expanded}>
          <div className={styles.restInner}>
            <ul className={styles.list}>{rest.map(item)}</ul>
          </div>
        </div>
      )}

      {rest.length > 0 && (
        <button
          type="button"
          className={styles.more}
          aria-expanded={expanded}
          aria-controls={restId}
          onClick={() => setExpanded((open) => !open)}
        >
          {expanded ? t("FEWER_INSTITUTIONS") : t("MORE_INSTITUTIONS", { count: institutions.length })}
          <span aria-hidden="true" className={expanded ? styles.arrowUp : undefined}>
            →
          </span>
        </button>
      )}
    </section>
  );
}
