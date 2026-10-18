"use client";

import { useMemo } from "react";

import { useLocale, useTranslations } from "next-intl";

import { formatFuzzyDate } from "@/lib/dates";
import type { MapArtist } from "@/lib/schemas";
import { buildTrajectory, placeName, type Stop } from "@/lib/trajectory";
import { TrajectoryMap } from "@/shared/components/TrajectoryMap";

import { styles } from "./styles/index.styles";

/** The artist's whole trajectory on the map, in the record. */
export function RecordMap({ artist, label }: { artist: MapArtist; label: string }) {
  const t = useTranslations("TRAJECTORY");
  const locale = useLocale();
  const trajectories = useMemo(() => {
    const trajectory = buildTrajectory(artist);
    return [{ ...trajectory, visible: trajectory.stops }];
  }, [artist]);

  const renderPlace = (placeId: string) => {
    const stops = trajectories[0]?.visible.filter((stop) => stop.place.id === placeId) ?? [];
    const first = stops[0];
    if (!first) return null;
    return (
      <div className={styles.popup}>
        <p className={styles.popupTitle}>{placeName(first.place)}</p>
        <ul className={styles.popupList}>
          {stops.map((stop, index) => (
            <li key={index}>
              {t(`STOP.${stop.kind.toUpperCase() as Uppercase<Stop["kind"]>}`)},{" "}
              {formatFuzzyDate(stop.date, locale, t("UNKNOWN_DATE"))}
              {stop.title && `: ${stop.title}`}
            </li>
          ))}
        </ul>
      </div>
    );
  };

  return (
    <div className={styles.root}>
      <TrajectoryMap
        trajectories={trajectories}
        selectedSlug={artist.slug}
        label={label}
        renderPlace={renderPlace}
      />
    </div>
  );
}
