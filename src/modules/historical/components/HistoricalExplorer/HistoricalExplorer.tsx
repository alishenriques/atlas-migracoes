"use client";

import { useMemo, useState } from "react";

import { Panel, ReliabilityTag, SegmentedControl, SelectField } from "@alishenriques/atlas-design-system";
import { useLocale, useTranslations } from "next-intl";

import { Link } from "@/i18n/navigation";
import { DECADES, mapDate, statesOn, yearsOf, type Decade, type StateAtDate } from "@/lib/cartography";
import { formatFuzzyDate } from "@/lib/dates";
import type { MapArtist } from "@/lib/schemas";
import { placeName } from "@/lib/trajectory";

import { useStates } from "../../hooks/useStates";
import { birthplacesOf, originsIn } from "../../utils/origins";
import { HistoricalMap } from "../HistoricalMap";
import { styles } from "./styles/index.styles";

export type HistoricalExplorerProps = { artists: MapArtist[] };

const FIRST_DECADE: Decade = 1920;

/** The interactive Camada Histórica: Europe's borders by decade and year, and where each artist was born. */
export function HistoricalExplorer({ artists }: HistoricalExplorerProps) {
  const t = useTranslations("HISTORICAL_LAYER");
  const locale = useLocale();
  const loaded = useStates();
  const [decade, setDecade] = useState<Decade>(FIRST_DECADE);
  const [year, setYear] = useState(FIRST_DECADE + 5);

  const states = loaded.status === "ready" ? loaded.states : null;
  const inForce = useMemo(() => (states ? statesOn(states, mapDate(year)) : null), [states, year]);
  const origins = useMemo(() => (states ? originsIn(artists, states, year, locale) : []), [artists, states, year, locale]);
  const birthplaces = useMemo(() => birthplacesOf(origins), [origins]);

  const chooseDecade = (value: string) => {
    const next = DECADES.find((d) => String(d) === value) ?? FIRST_DECADE;
    setDecade(next);
    setYear(next + 5);
  };

  const atBirth = (state: StateAtDate) => {
    switch (state.kind) {
      case "unknown":
        return t("STATE.UNKNOWN");
      case "changed":
        return t("STATE.CHANGED", { from: state.from ?? t("STATE.NONE"), to: state.to ?? t("STATE.NONE") });
      case "state":
        return state.name === null
          ? t("STATE.NONE")
          : state.circa
            ? t("STATE.CIRCA", { name: state.name })
            : state.name;
    }
  };

  const renderPlace = (placeId: string) => {
    const born = origins.filter((origin) => origin.place.id === placeId);
    const first = born[0];
    if (!first) return null;
    return (
      <div className={styles.popup}>
        <p className={styles.popupTitle}>{placeName(first.place)}</p>
        <p className={styles.popupMeta}>{t("IN_YEAR", { year, state: first.inYear ?? t("STATE.NONE") })}</p>
        <ul className={styles.popupList}>
          {born.map(({ artist }) => (
            <li key={artist.slug}>{artist.name}</li>
          ))}
        </ul>
      </div>
    );
  };

  const renderState = (name: string) => {
    const born = origins.filter((origin) => origin.inYear === name);
    return (
      <div className={styles.popup}>
        <p className={styles.popupTitle}>{name}</p>
        <p className={styles.popupMeta}>{t("BORN_HERE", { year, count: born.length })}</p>
        {born.length > 0 && (
          <ul className={styles.popupList}>
            {born.map(({ artist }) => (
              <li key={artist.slug}>{artist.name}</li>
            ))}
          </ul>
        )}
      </div>
    );
  };

  return (
    <section className={styles.root}>
      <div className={styles.map}>
        {inForce ? (
          <HistoricalMap
            states={inForce}
            birthplaces={birthplaces}
            label={t("MAP_LABEL", { year })}
            renderPlace={renderPlace}
            renderState={renderState}
          />
        ) : (
          <p className={styles.mapStatus}>{loaded.status === "error" ? t("BORDERS_UNAVAILABLE") : t("LOADING")}</p>
        )}
      </div>

      <Panel title={t("BORDERS_OF", { year })} className={styles.panel}>
        <SegmentedControl
          label={t("DECADE")}
          value={String(decade)}
          onChange={chooseDecade}
          options={DECADES.map((d) => ({ value: String(d), label: t("DECADE_LABEL", { decade: d }) }))}
        />
        <SelectField
          label={t("YEAR")}
          value={String(year)}
          onChange={(value) => setYear(Number(value))}
          options={yearsOf(decade).map((y) => ({ value: String(y), label: String(y) }))}
        />
        <p className={styles.note}>{t("SOURCE_NOTE")}</p>

        <div className={styles.list}>
          <div className={styles.listHeader}>
            <p className={styles.listTitle}>{t("ORIGINS_TITLE")}</p>
            <ReliabilityTag level="inferred" label={t("INFERRED")} />
          </div>
          <p className={styles.note}>{t("ORIGINS_METHOD")}</p>
          <ul className={styles.origins}>
            {origins.map((origin) => (
              <li key={origin.artist.slug} className={styles.origin}>
                <Link
                  href={{ pathname: "/trajetorias/[slug]", params: { slug: origin.artist.slug } }}
                  className={styles.originName}
                >
                  {origin.artist.name}
                </Link>
                <span className={styles.originMeta}>
                  {t("BORN", {
                    place: placeName(origin.place),
                    date: formatFuzzyDate(origin.artist.birthDate, locale, t("UNKNOWN_DATE")),
                  })}
                </span>
                <span className={styles.originMeta}>
                  {t("AT_BIRTH")}: <span className={styles.state}>{atBirth(origin.atBirth)}</span>
                </span>
                <span className={styles.originMeta}>
                  {t("IN_YEAR", { year, state: origin.inYear ?? t("STATE.NONE") })}
                </span>
              </li>
            ))}
          </ul>
        </div>
      </Panel>
    </section>
  );
}
