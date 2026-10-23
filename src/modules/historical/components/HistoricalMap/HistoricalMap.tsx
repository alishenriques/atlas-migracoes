"use client";

import "maplibre-gl/dist/maplibre-gl.css";

import { useMemo, useState } from "react";
import type { ReactNode } from "react";

import Map, { Layer, NavigationControl, Popup, Source, type MapLayerMouseEvent } from "react-map-gl/maplibre";

import { EUROPE_BOUNDS, labelPoints, type States } from "@/lib/cartography";
import { baseMapStyle, LABEL_FONT, readMapColors } from "@/shared/map/mapStyle";

import "@/shared/map/worker";
import { styles } from "./styles/index.styles";

import type { FeatureCollection, Point } from "geojson";

/** A birthplace on the map and how many of the artists were born there. */
export type Birthplace = { placeId: string; lng: number; lat: number; artists: number };

export type HistoricalMapProps = {
  /** The state polygons in force on the day shown. */
  states: States;
  birthplaces: Birthplace[];
  /** Accessible name of the map region. */
  label: string;
  /** Popup for a clicked birthplace. */
  renderPlace: (placeId: string) => ReactNode;
  /** Popup for a clicked state. */
  renderState: (name: string) => ReactNode;
  /** Room to leave for blocks floating over the map, so the opening view centers in what stays visible. */
  padding?: { top: number; right: number; bottom: number; left: number };
};

// Central Europe, where the artists were born.
const INITIAL_VIEW = { longitude: 18, latitude: 50, zoom: 3.6 };
const NO_PADDING = { top: 0, right: 0, bottom: 0, left: 0 };

type Opened = { kind: "place" | "state"; id: string; lng: number; lat: number };

/** Europe with the borders in force on one day, and the artists' birthplaces on top. */
export function HistoricalMap({
  states,
  birthplaces,
  label,
  renderPlace,
  renderState,
  padding = NO_PADDING,
}: HistoricalMapProps) {
  const [colors] = useState(() => readMapColors());
  const [opened, setOpened] = useState<Opened | null>(null);
  const [hovering, setHovering] = useState(false);
  const mapStyle = useMemo(() => baseMapStyle(colors, { glyphs: true }), [colors]);
  const labels = useMemo(() => labelPoints(states), [states]);
  const points = useMemo<FeatureCollection<Point, Omit<Birthplace, "lng" | "lat">>>(
    () => ({
      type: "FeatureCollection",
      features: birthplaces.map(({ placeId, lng, lat, artists }) => ({
        type: "Feature",
        geometry: { type: "Point", coordinates: [lng, lat] },
        properties: { placeId, artists },
      })),
    }),
    [birthplaces],
  );

  const onClick = (event: MapLayerMouseEvent) => {
    const { lng, lat } = event.lngLat;
    const place = event.features?.find((feature) => feature.layer.id === "birthplaces")?.properties?.placeId;
    const state = event.features?.find((feature) => feature.layer.id === "states-fill")?.properties?.name;
    if (typeof place === "string") setOpened({ kind: "place", id: place, lng, lat });
    else if (typeof state === "string") setOpened({ kind: "state", id: state, lng, lat });
    else setOpened(null);
  };

  return (
    <div className={styles.root} role="region" aria-label={label}>
      <Map
        initialViewState={{ ...INITIAL_VIEW, padding }}
        mapStyle={mapStyle}
        interactiveLayerIds={["birthplaces", "states-fill"]}
        onClick={onClick}
        onMouseEnter={() => setHovering(true)}
        onMouseLeave={() => setHovering(false)}
        cursor={hovering ? "pointer" : "grab"}
        renderWorldCopies={false}
        // The borders stop where they were clipped: keep the view inside them.
        maxBounds={EUROPE_BOUNDS}
        attributionControl={{ compact: true }}
      >
        <NavigationControl position="bottom-right" showCompass={false} />
        <Source id="states" type="geojson" data={states}>
          <Layer
            id="states-fill"
            type="fill"
            paint={{
              "fill-color": colors.accent,
              "fill-opacity": ["case", ["==", ["get", "name"], opened?.kind === "state" ? opened.id : ""], 0.16, 0.04],
            }}
          />
          <Layer id="states-line" type="line" paint={{ "line-color": colors.accent, "line-width": 1, "line-opacity": 0.55 }} />
        </Source>
        <Source id="state-labels" type="geojson" data={labels}>
          <Layer
            id="states-label"
            type="symbol"
            layout={{
              "text-field": ["get", "name"],
              "text-font": LABEL_FONT,
              "text-size": 11,
              "text-max-width": 8,
              "text-transform": "uppercase",
              "text-letter-spacing": 0.08,
            }}
            paint={{ "text-color": colors.muted, "text-halo-color": colors.water, "text-halo-width": 1 }}
          />
        </Source>
        <Source id="birthplaces" type="geojson" data={points}>
          <Layer
            id="birthplaces"
            type="circle"
            paint={{
              "circle-color": colors.artist,
              "circle-radius": ["interpolate", ["linear"], ["get", "artists"], 1, 4, 6, 9],
              "circle-stroke-color": colors.water,
              "circle-stroke-width": 1.5,
            }}
          />
        </Source>
        {opened && (
          <Popup
            longitude={opened.lng}
            latitude={opened.lat}
            onClose={() => setOpened(null)}
            closeOnClick={false}
            maxWidth="280px"
          >
            {opened.kind === "place" ? renderPlace(opened.id) : renderState(opened.id)}
          </Popup>
        )}
      </Map>
    </div>
  );
}
