"use client";

import { useMemo, useState, type ReactNode } from "react";

import { ReliabilityTag, SegmentedControl, SelectField, Toggletip } from "@alishenriques/atlas-design-system";
import { useLocale, useTranslations } from "next-intl";

import { Link } from "@/i18n/navigation";
import { DECADES, mapDate, statesOn, yearsOf, type Decade, type StateAtDate } from "@/lib/cartography";
import { formatFuzzyDate } from "@/lib/dates";
import type { MapArtist } from "@/lib/schemas";
import { stateNameLocale } from "@/lib/stateNames";
import { placeName } from "@/lib/trajectory";
import { MapPopup } from "@/shared/components/MapPopup";
import { MapScreen, SIDE_INSET } from "@/shared/components/MapScreen";
import { useIsDesktop } from "@/shared/hooks/useIsDesktop";

import { useStates } from "../../hooks/useStates";
import { birthplacesOf, originsIn } from "../../utils/origins";
import { HistoricalFacts } from "../HistoricalFacts";
import { HistoricalMap } from "../HistoricalMap";
import { styles } from "./styles/index.styles";

export type HistoricalExplorerProps = {
  artists: MapArtist[];
  /** Floats above the controls, in the left column (the screen's presentation). */
  intro?: ReactNode;
  /** Closes the controls panel (the borders' credit). */
  credit?: ReactNode;
};

const FIRST_DECADE: Decade = 1920;
// Keeps the opening view clear of the left column on desktop.
const SIDE_PADDING = { top: 0, right: 0, bottom: 0, left: SIDE_INSET };

/**
 * The interactive Camada Histórica: Europe's borders by decade and year, and where each artist was born.
 * Laid out like Explorar: the map fills the screen and the presentation and the controls float over it.
 */
export function HistoricalExplorer({ artists, intro, credit }: HistoricalExplorerProps) {
  const t = useTranslations("HISTORICAL_LAYER");
  const locale = useLocale();
  const isDesktop = useIsDesktop();
  const loaded = useStates();
  const [decade, setDecade] = useState<Decade>(FIRST_DECADE);
  const [year, setYear] = useState(FIRST_DECADE + 5);

  const states = loaded.status === "ready" ? loaded.states : null;
  const inForce = useMemo(() => (states ? statesOn(states, mapDate(year), stateNameLocale(locale)) : null), [states, year, locale]);
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
      // No country label here: the layer is about the state of the period, not today's country.
      <MapPopup title={placeName(first.place)} meta={t("IN_YEAR", { year, state: first.inYear ?? t("STATE.NONE") })}>
        <ul className={styles.popupList}>
          {born.map(({ artist }) => (
            <li key={artist.slug}>{artist.name}</li>
          ))}
        </ul>
      </MapPopup>
    );
  };

  const renderState = (name: string) => {
    const born = origins.filter((origin) => origin.inYear === name);
    return (
      <MapPopup title={name} meta={t("BORN_HERE", { year, count: born.length })}>
        {born.length > 0 && (
          <ul className={styles.popupList}>
            {born.map(({ artist }) => (
              <li key={artist.slug}>{artist.name}</li>
            ))}
          </ul>
        )}
      </MapPopup>
    );
  };

  return (
    <MapScreen
      map={
        inForce ? (
          <HistoricalMap
            states={inForce}
            birthplaces={birthplaces}
            label={t("MAP_LABEL", { year })}
            renderPlace={renderPlace}
            renderState={renderState}
            padding={isDesktop ? SIDE_PADDING : undefined}
          />
        ) : (
          <p className={styles.mapStatus}>{loaded.status === "error" ? t("BORDERS_UNAVAILABLE") : t("LOADING")}</p>
        )
      }
      intro={intro}
      title={t("BORDERS_OF", { year })}
      action={
        // How the borders are drawn, out of the way of the facts (asked by Tânia, 2026-10-30).
        <Toggletip align="end" trigger={<span className="sr-only">{t("SOURCE_ABOUT")}</span>}>
          <span className={styles.infoText}>{t("SOURCE_NOTE")}</span>
        </Toggletip>
      }
    >
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
      <HistoricalFacts year={year} />

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

      {credit && <div className={styles.credit}>{credit}</div>}
    </MapScreen>
  );
}
