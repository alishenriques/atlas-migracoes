"use client";

import "maplibre-gl/dist/maplibre-gl.css";

import { useEffect, useMemo, useRef, useState } from "react";
import type { ReactNode } from "react";

import { setWorkerUrl } from "maplibre-gl";
import Map, {
  Layer,
  NavigationControl,
  Popup,
  Source,
  type MapLayerMouseEvent,
  type MapRef,
} from "react-map-gl/maplibre";

import { baseMapStyle, readMapColors } from "./mapStyle";
import { styles } from "./styles/index.styles";
import { boundsOf, toMapFeatures } from "../../utils/mapFeatures";

import type { VisibleTrajectory } from "../../utils/trajectory";

export type ExplorarMapProps = {
  trajectories: VisibleTrajectory[];
  selectedSlug: string | null;
  /** Accessible name of the map region. */
  label: string;
  /** What to show in the popup of a clicked place. */
  renderPlace: (placeId: string) => ReactNode;
  /** Space covered by the floating panel, so fitted bounds stay visible. */
  padding: { top: number; right: number; bottom: number; left: number };
};

// MapLibre 6 looks for its worker next to its own module, which the bundler
// moves; point it at the worker file emitted as a static asset instead.
setWorkerUrl(new URL("maplibre-gl/dist/maplibre-gl-worker.mjs", import.meta.url).href);

// Europe and Brazil in one view.
const INITIAL_VIEW = { longitude: -18, latitude: 18, zoom: 1.6 };

const prefersReducedMotion = () => window.matchMedia("(prefers-reduced-motion: reduce)").matches;

export function ExplorarMap({ trajectories, selectedSlug, label, renderPlace, padding }: ExplorarMapProps) {
  const mapRef = useRef<MapRef>(null);
  const [colors] = useState(() => readMapColors());
  const [openPlace, setOpenPlace] = useState<{ id: string; lng: number; lat: number } | null>(null);
  const [hovering, setHovering] = useState(false);
  const mapStyle = useMemo(() => baseMapStyle(colors), [colors]);
  const features = useMemo(() => toMapFeatures(trajectories, selectedSlug), [trajectories, selectedSlug]);
  const dim = selectedSlug !== null;

  // Follow the selected artist: fit their whole trajectory in view.
  useEffect(() => {
    const selected = trajectories.find((t) => t.artist.slug === selectedSlug);
    const bounds = selected ? boundsOf(selected.visible) : null;
    if (!bounds || !mapRef.current) return;
    mapRef.current.fitBounds(bounds, {
      padding: { top: padding.top + 48, right: padding.right + 48, bottom: padding.bottom + 48, left: padding.left + 48 },
      maxZoom: 5,
      duration: prefersReducedMotion() ? 0 : 1200,
    });
  }, [selectedSlug, trajectories, padding]);

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
        onMouseEnter={() => setHovering(true)}
        onMouseLeave={() => setHovering(false)}
        cursor={hovering ? "pointer" : "grab"}
        renderWorldCopies={false}
        attributionControl={{ compact: true }}
      >
        <NavigationControl position="bottom-right" showCompass={false} />
        <Source id="legs" type="geojson" data={features.legs}>
          <Layer
            id="legs"
            type="line"
            layout={{ "line-cap": "round" }}
            paint={{
              "line-color": colors.accent,
              "line-width": ["case", ["get", "selected"], 2.5, 1.2],
              "line-opacity": ["case", ["get", "selected"], 0.95, dim ? 0.1 : 0.45],
            }}
          />
        </Source>
        <Source id="places" type="geojson" data={features.places}>
          <Layer
            id="places"
            type="circle"
            paint={{
              "circle-color": colors.accent,
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
