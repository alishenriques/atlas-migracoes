"use client";

import { useMemo, useState, useSyncExternalStore } from "react";

import { Button, Panel, ReliabilityTag, SelectField, YearRange } from "@alishenriques/atlas-design-system";
import dynamic from "next/dynamic";
import { useLocale, useTranslations } from "next-intl";

import { formatFuzzyDate } from "@/lib/dates";
import type { MapArtist } from "@/lib/schemas";

import { styles } from "./styles/index.styles";
import {
  buildTrajectory,
  filterTrajectories,
  FULL_PERIOD,
  originCountries,
  type Period,
  type Stop,
} from "../../utils/trajectory";

// MapLibre needs WebGL and the window, so the map only renders in the browser.
const ExplorarMap = dynamic(() => import("../ExplorarMap").then((module) => module.ExplorarMap), {
  ssr: false,
  loading: () => <div className={styles.mapLoading} />,
});

const DESKTOP = "(min-width: 768px)";
const subscribe = (onChange: () => void) => {
  const query = window.matchMedia(DESKTOP);
  query.addEventListener("change", onChange);
  return () => query.removeEventListener("change", onChange);
};

/** Desktop floats the panel over the map's left side; mobile stacks it below. */
function useIsDesktop() {
  return useSyncExternalStore(
    subscribe,
    () => window.matchMedia(DESKTOP).matches,
    () => true,
  );
}

export type ExplorarProps = { artists: MapArtist[] };

/** The interactive part of Explorar: map, filters, timeline and the artist list. */
export function Explorar({ artists }: ExplorarProps) {
  const t = useTranslations("HOME.MAP");
  const locale = useLocale();
  const isDesktop = useIsDesktop();
  const [originCountry, setOriginCountry] = useState("");
  const [period, setPeriod] = useState<Period>(FULL_PERIOD);
  const [selectedSlug, setSelectedSlug] = useState<string | null>(null);

  const trajectories = useMemo(() => artists.map(buildTrajectory), [artists]);
  const countries = useMemo(() => originCountries(artists, locale), [artists, locale]);
  const visible = useMemo(
    () => filterTrajectories(trajectories, { originCountry, period }),
    [trajectories, originCountry, period],
  );
  const selected = visible.find((trajectory) => trajectory.artist.slug === selectedSlug) ?? null;
  const filtered = originCountry !== "" || period[0] !== FULL_PERIOD[0] || period[1] !== FULL_PERIOD[1];
  const padding = useMemo(() => ({ top: 0, right: 0, bottom: 0, left: isDesktop ? 360 : 0 }), [isDesktop]);

  const date = (stop: Stop) => formatFuzzyDate(stop.date, locale, t("UNKNOWN_DATE"));
  const placeName = (stop: Stop) =>
    stop.place.currentName ? `${stop.place.label} (${stop.place.currentName})` : stop.place.label;

  const clear = () => {
    setOriginCountry("");
    setPeriod(FULL_PERIOD);
    setSelectedSlug(null);
  };

  const renderPlace = (placeId: string) => {
    const events = visible.flatMap((trajectory) =>
      trajectory.visible
        .filter((stop) => stop.place.id === placeId)
        .map((stop) => ({ name: trajectory.artist.name, stop })),
    );
    const first = events[0]?.stop;
    if (!first) return null;
    return (
      <div className={styles.popup}>
        <p className={styles.popupTitle}>{placeName(first)}</p>
        <ul className={styles.popupList}>
          {events.map(({ name, stop }, index) => (
            <li key={index}>
              {name}: {t(`STOP.${stop.kind.toUpperCase() as Uppercase<Stop["kind"]>}`)}, {date(stop)}
            </li>
          ))}
        </ul>
      </div>
    );
  };

  return (
    <section className={styles.root}>
      <div className={styles.map}>
        <ExplorarMap
          trajectories={visible}
          selectedSlug={selected?.artist.slug ?? null}
          label={t("LABEL")}
          renderPlace={renderPlace}
          padding={padding}
        />
      </div>

      <Panel
        title={t("FILTERS")}
        className={styles.panel}
        action={
          filtered || selected ? (
            <button type="button" className={styles.clear} onClick={clear}>
              {t("CLEAR")}
            </button>
          ) : undefined
        }
      >
        <SelectField
          label={t("ORIGIN")}
          value={originCountry}
          onChange={setOriginCountry}
          options={[{ value: "", label: t("ALL_COUNTRIES") }, ...countries.map((c) => ({ value: c, label: c }))]}
        />
        <YearRange
          label={t("PERIOD")}
          fromLabel={t("PERIOD_FROM")}
          toLabel={t("PERIOD_TO")}
          min={FULL_PERIOD[0]}
          max={FULL_PERIOD[1]}
          value={period}
          onChange={setPeriod}
        />

        {selected ? (
          <div className={styles.detail}>
            <div className={styles.detailHeader}>
              <h2 className={styles.detailName}>{selected.artist.name}</h2>
              <Button variant="ghost" onClick={() => setSelectedSlug(null)}>
                {t("BACK")}
              </Button>
            </div>
            <ReliabilityTag level="inferred" label={t("INFERRED")} />
            <p className={styles.note}>{t("METHOD")}</p>
            <ol className={styles.stops}>
              {selected.visible.map((stop, index) => (
                <li key={index} className={styles.stop}>
                  <span className={styles.stopMeta}>
                    {t(`STOP.${stop.kind.toUpperCase() as Uppercase<Stop["kind"]>}`)} · {date(stop)}
                  </span>
                  <span>{placeName(stop)}</span>
                  {stop.title && <span className={styles.stopTitle}>{stop.title}</span>}
                </li>
              ))}
            </ol>
            {selected.posthumous > 0 && <p className={styles.note}>{t("POSTHUMOUS", { count: selected.posthumous })}</p>}
            {selected.undrawn > 0 && <p className={styles.note}>{t("UNDRAWN", { count: selected.undrawn })}</p>}
          </div>
        ) : (
          <div className={styles.list}>
            <p className={styles.listTitle}>{t("ARTISTS", { count: visible.length })}</p>
            {visible.length === 0 ? (
              <p className={styles.note}>{t("NO_RESULTS")}</p>
            ) : (
              <ul className={styles.artists}>
                {visible.map((trajectory) => (
                  <li key={trajectory.artist.slug}>
                    <button
                      type="button"
                      className={styles.artist}
                      onClick={() => setSelectedSlug(trajectory.artist.slug)}
                    >
                      <span>{trajectory.artist.name}</span>
                      <span className={styles.artistOrigin}>{trajectory.artist.birthPlace?.country}</span>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}
      </Panel>
    </section>
  );
}
