"use client";

import { useMemo } from "react";

import { useLocale, useTranslations } from "next-intl";

import { formatFuzzyDate } from "@/lib/dates";
import type { MapArtist } from "@/lib/schemas";
import { buildTrajectory, placeName, type Stop } from "@/lib/trajectory";
import { MapPopup } from "@/shared/components/MapPopup";
import { TrajectoryMap } from "@/shared/components/TrajectoryMap";

import { styles } from "./styles/index.styles";

/** The artist's whole trajectory on the map, in the record. */
export function RecordMap({ artist, label, className }: { artist: MapArtist; label: string; className?: string }) {
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
      <MapPopup eyebrow={first.place.country} title={placeName(first.place)}>
        <ul className={styles.popupStops}>
          {stops.map((stop, index) => (
            <li key={index} className={styles.popupStop}>
              <span className={styles.popupKind}>
                {t(`STOP.${stop.kind.toUpperCase() as Uppercase<Stop["kind"]>}`)} ·{" "}
                {formatFuzzyDate(stop.date, locale, t("UNKNOWN_DATE"))}
              </span>
              {stop.title && <span className={styles.popupTitle}>{stop.title}</span>}
            </li>
          ))}
        </ul>
      </MapPopup>
    );
  };

  return (
    <div className={[styles.root, className].filter(Boolean).join(" ")}>
      <TrajectoryMap
        trajectories={trajectories}
        selectedSlug={artist.slug}
        label={label}
        renderPlace={renderPlace}
      />
    </div>
  );
}
