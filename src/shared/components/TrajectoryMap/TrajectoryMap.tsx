"use client";

import "maplibre-gl/dist/maplibre-gl.css";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { ReactNode } from "react";

import Map, {
  Layer,
  NavigationControl,
  Popup,
  Source,
  type MapLayerMouseEvent,
  type MapRef,
} from "react-map-gl/maplibre";

import { boundsOf, toMapFeatures } from "@/lib/mapFeatures";
import type { VisibleTrajectory } from "@/lib/trajectory";
import { baseMapStyle, readMapColors } from "@/shared/map/mapStyle";

import "@/shared/map/worker";
import { styles } from "./styles/index.styles";


export type TrajectoryMapProps = {
  trajectories: VisibleTrajectory[];
  selectedSlug: string | null;
  /** Accessible name of the map region. */
  label: string;
  /** What to show in the popup of a clicked place. */
  renderPlace: (placeId: string) => ReactNode;
  /** Space covered by a floating panel, so fitted bounds stay visible. */
  padding?: { top: number; right: number; bottom: number; left: number };
};

// Europe and Brazil in one view.
const INITIAL_VIEW = { longitude: -18, latitude: 18, zoom: 1.6 };

const prefersReducedMotion = () => window.matchMedia("(prefers-reduced-motion: reduce)").matches;

const NO_PADDING = { top: 0, right: 0, bottom: 0, left: 0 };

/**
 * Trajectories as great-circle arcs between their documented points, the way
 * from the birthplace to Brazil in gold; with an artist selected only their
 * lines are drawn, and their trajectory is kept in view.
 */
export function TrajectoryMap({
  trajectories,
  selectedSlug,
  label,
  renderPlace,
  padding = NO_PADDING,
}: TrajectoryMapProps) {
  const mapRef = useRef<MapRef>(null);
  const [colors] = useState(() => readMapColors());
  const [openPlace, setOpenPlace] = useState<{ id: string; lng: number; lat: number } | null>(null);
  const [hovering, setHovering] = useState(false);
  const mapStyle = useMemo(() => baseMapStyle(colors), [colors]);
  const features = useMemo(() => toMapFeatures(trajectories, selectedSlug), [trajectories, selectedSlug]);
  const dim = selectedSlug !== null;

  // Follow the selected artist: fit their whole trajectory in view, once the map
  // has loaded and whenever the selection changes.
  const fitSelected = useCallback(() => {
    const selected = trajectories.find((t) => t.artist.slug === selectedSlug);
    const bounds = selected ? boundsOf(selected.visible) : null;
    if (!bounds || !mapRef.current) return;
    mapRef.current.fitBounds(bounds, {
      padding: { top: padding.top + 48, right: padding.right + 48, bottom: padding.bottom + 48, left: padding.left + 48 },
      maxZoom: 5,
      duration: prefersReducedMotion() ? 0 : 1200,
    });
  }, [selectedSlug, trajectories, padding]);

  useEffect(fitSelected, [fitSelected]);

  const onClick = (event: MapLayerMouseEvent) => {
    const placeId = event.features?.[0]?.properties?.placeId;
    setOpenPlace(typeof placeId === "string" ? { id: placeId, lng: event.lngLat.lng, lat: event.lngLat.lat } : null);
  };

  return (
    <div className={styles.root} role="region" aria-label={label}>
      <Map
        ref={mapRef}
        initialViewState={INITIAL_VIEW}
        mapStyle={mapStyle}
        interactiveLayerIds={["places"]}
        onClick={onClick}
        onLoad={fitSelected}
        onMouseEnter={() => setHovering(true)}
        onMouseLeave={() => setHovering(false)}
        cursor={hovering ? "pointer" : "grab"}
        renderWorldCopies={false}
        attributionControl={{ compact: true }}
      >
        <NavigationControl position="bottom-right" showCompass={false} />
        <Source id="legs" type="geojson" data={features.legs}>
          {/* Legs between other documented points: thin and dashed, under the migration. */}
          <Layer
            id="legs-route"
            type="line"
            filter={["==", ["get", "kind"], "route"]}
            layout={{ "line-cap": "round" }}
            paint={{
              "line-color": colors.foreground,
              "line-width": ["case", ["get", "selected"], 1.6, 0.9],
              "line-dasharray": [2, 2],
              "line-opacity": ["case", ["get", "selected"], 0.75, 0.3],
            }}
          />
          {/* The way from the birthplace to the first place in Brazil: solid gold. */}
          <Layer
            id="legs-migration"
            type="line"
            filter={["==", ["get", "kind"], "migration"]}
            layout={{ "line-cap": "round" }}
            paint={{
              "line-color": colors.accent,
              "line-width": ["case", ["get", "selected"], 3, 1.4],
              "line-opacity": ["case", ["get", "selected"], 0.95, 0.5],
            }}
          />
        </Source>
        <Source id="places" type="geojson" data={features.places}>
          <Layer
            id="places"
            type="circle"
            paint={{
              "circle-color": ["case", ["get", "migration"], colors.accent, colors.foreground],
              "circle-radius": ["interpolate", ["linear"], ["get", "artists"], 1, 4, 10, 10],
              "circle-stroke-color": colors.water,
              "circle-stroke-width": 1.5,
              "circle-opacity": ["case", ["get", "selected"], 1, dim ? 0.25 : 0.85],
            }}
          />
        </Source>
        {openPlace && (
          <Popup
            longitude={openPlace.lng}
            latitude={openPlace.lat}
            onClose={() => setOpenPlace(null)}
            closeOnClick={false}
            maxWidth="280px"
          >
            {renderPlace(openPlace.id)}
          </Popup>
        )}
      </Map>
    </div>
  );
}
