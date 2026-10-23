"use client";

import { useMemo, useState, type ReactNode } from "react";

import { Button, SelectField, YearRange } from "@alishenriques/atlas-design-system";
import { useLocale, useTranslations } from "next-intl";

import { Link } from "@/i18n/navigation";
import { formatFuzzyDate } from "@/lib/dates";
import type { MapArtist } from "@/lib/schemas";
import {
  buildTrajectory,
  filterTrajectories,
  FULL_PERIOD,
  originCountries,
  placeName,
  type Period,
  type Stop,
} from "@/lib/trajectory";
import { CountryFlag } from "@/shared/components/CountryFlag";
import { MapPopup } from "@/shared/components/MapPopup";
import { MapScreen, SIDE_INSET } from "@/shared/components/MapScreen";
import { TrajectoryMap } from "@/shared/components/TrajectoryMap";
import { TrajectoryStops } from "@/shared/components/TrajectoryStops";
import { useIsDesktop } from "@/shared/hooks/useIsDesktop";

import { styles } from "./styles/index.styles";

// Room the map leaves on desktop for the counters along the bottom: their height plus the gaps.
const FOOTER_INSET = 152;
const NO_INSET = { top: 0, right: 0, bottom: 0, left: 0 };

export type ExplorarProps = {
  artists: MapArtist[];
  /** Floats above the filters, in the left column (the site's presentation). */
  intro?: ReactNode;
  /** Floats along the bottom of the map on desktop (the collection counters). */
  footer?: ReactNode;
};

/**
 * The interactive part of Explorar: a full-screen map with floating blocks over it
 * (`intro` above the filters and artists on the left, `footer` along the bottom),
 * after the Atlas screens in the project deck. On mobile the blocks stack under the map.
 */
export function Explorar({ artists, intro, footer }: ExplorarProps) {
  const t = useTranslations("HOME.MAP");
  const tStop = useTranslations("TRAJECTORY");
  const locale = useLocale();
  // Desktop floats the panel over the map's left side; mobile stacks it below.
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
  // Keeps the trajectories clear of the floating blocks when the map fits them.
  const padding = useMemo(
    () => (isDesktop ? { top: 0, right: 0, bottom: footer ? FOOTER_INSET : 0, left: SIDE_INSET } : NO_INSET),
    [isDesktop, footer],
  );

  const date = (stop: Stop) => formatFuzzyDate(stop.date, locale, tStop("UNKNOWN_DATE"));

  const clear = () => {
    setOriginCountry("");
    setPeriod(FULL_PERIOD);
    setSelectedSlug(null);
  };

  const renderPlace = (placeId: string) => {
    // One group per artist who passed through the place, in the order of the list.
    const groups = visible
      .map((trajectory) => ({
        artist: trajectory.artist,
        stops: trajectory.visible.filter((stop) => stop.place.id === placeId),
      }))
      .filter((group) => group.stops.length > 0);
    const first = groups[0]?.stops[0];
    if (!first) return null;
    const records = groups.reduce((sum, group) => sum + group.stops.length, 0);
    return (
      <MapPopup
        eyebrow={first.place.country}
        title={placeName(first.place)}
        meta={t("POPUP_SUMMARY", { artists: groups.length, records })}
      >
        <ul className={styles.popupGroups}>
          {groups.map(({ artist, stops }) => (
            <li key={artist.slug} className={styles.popupGroup}>
              <button
                type="button"
                className={styles.popupArtist}
                aria-label={t("SHOW_TRAJECTORY", { name: artist.name })}
                onClick={() => setSelectedSlug(artist.slug)}
              >
                {artist.name}
              </button>
              <ul className={styles.popupStops}>
                {stops.map((stop, index) => (
                  <li key={index} className={styles.popupStop}>
                    <span className={styles.popupKind}>
                      {tStop(`STOP.${stop.kind.toUpperCase() as Uppercase<Stop["kind"]>}`)}
                    </span>
                    <span className={styles.popupDate}>{date(stop)}</span>
                  </li>
                ))}
              </ul>
            </li>
          ))}
        </ul>
      </MapPopup>
    );
  };

  return (
    <MapScreen
      map={
        <TrajectoryMap
          trajectories={visible}
          selectedSlug={selected?.artist.slug ?? null}
          label={t("LABEL")}
          renderPlace={renderPlace}
          padding={padding}
        />
      }
      intro={intro}
      footer={footer}
      title={t("FILTERS")}
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
        options={[
          { value: "", label: t("ALL_COUNTRIES") },
          ...countries.map((c) => ({ value: c, label: c, icon: <CountryFlag country={c} /> })),
        ]}
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
      <div role="group" aria-label={t("LEGEND")} className={styles.legend}>
        <p className={styles.listTitle}>{t("LEGEND")}</p>
        <p className={styles.legendItem}>
          <span aria-hidden className={styles.legendMigration} />
          {t("LEGEND_MIGRATION")}
        </p>
        <p className={styles.legendItem}>
          <span aria-hidden className={styles.legendRoute} />
          {t("LEGEND_ROUTE")}
        </p>
      </div>

      {selected ? (
        <div className={styles.detail}>
          <div className={styles.detailHeader}>
            <h2 className={styles.detailName}>{selected.artist.name}</h2>
            <Button variant="ghost" onClick={() => setSelectedSlug(null)}>
              {t("BACK")}
            </Button>
          </div>
          <TrajectoryStops trajectory={selected} stops={selected.visible} />
          <Link
            href={{
              pathname: "/trajetorias/[slug]",
              params: { slug: selected.artist.slug },
            }}
            className={styles.recordLink}
          >
            {t("OPEN_RECORD")}
          </Link>
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
                    <span className={styles.artistOrigin}>
                      <CountryFlag country={trajectory.artist.birthPlace?.country} />
                      {trajectory.artist.birthPlace?.country}
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </MapScreen>
  );
}
