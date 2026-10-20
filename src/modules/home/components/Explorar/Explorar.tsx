"use client";

import { useMemo, useState } from "react";

import { Button, Panel, SelectField, YearRange } from "@alishenriques/atlas-design-system";
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
import { TrajectoryMap } from "@/shared/components/TrajectoryMap";
import { TrajectoryStops } from "@/shared/components/TrajectoryStops";
import { useIsDesktop } from "@/shared/hooks/useIsDesktop";

import { styles } from "./styles/index.styles";

export type ExplorarProps = { artists: MapArtist[] };

/** The interactive part of Explorar: map, filters, timeline and the artist list. */
export function Explorar({ artists }: ExplorarProps) {
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
  const padding = useMemo(() => ({ top: 0, right: 0, bottom: 0, left: isDesktop ? 360 : 0 }), [isDesktop]);

  const date = (stop: Stop) => formatFuzzyDate(stop.date, locale, tStop("UNKNOWN_DATE"));

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
        <p className={styles.popupTitle}>{placeName(first.place)}</p>
        <ul className={styles.popupList}>
          {events.map(({ name, stop }, index) => (
            <li key={index}>
              {name}: {tStop(`STOP.${stop.kind.toUpperCase() as Uppercase<Stop["kind"]>}`)}, {date(stop)}
            </li>
          ))}
        </ul>
      </div>
    );
  };

  return (
    <section className={styles.root}>
      <div className={styles.map}>
        <TrajectoryMap
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
              href={{ pathname: "/trajetorias/[slug]", params: { slug: selected.artist.slug } }}
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
