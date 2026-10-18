import type { StyleSpecification } from "maplibre-gl";

/** Free OpenStreetMap vector tiles, no key or account (https://openfreemap.org). */
const TILES_URL = "https://tiles.openfreemap.org/planet";

/** OpenFreeMap's free font glyphs, needed only by maps that draw text labels. */
export const GLYPHS_URL = "https://tiles.openfreemap.org/fonts/{fontstack}/{range}.pbf";

/** A font OpenFreeMap serves, for text labels on the map. */
export const LABEL_FONT = ["Noto Sans Regular"];

export type MapColors = { land: string; water: string; coast: string };

/**
 * A deliberately bare basemap: land and water only, in the night-blue
 * palette. No present-day borders or place names, so the map does not impose
 * today's political geography on a 1918–1989 history (the borders of each
 * period come with the Camada Histórica). Pass `glyphs` to draw text labels.
 */
export function baseMapStyle(colors: MapColors, options: { glyphs?: boolean } = {}): StyleSpecification {
  return {
    version: 8,
    ...(options.glyphs ? { glyphs: GLYPHS_URL } : {}),
    sources: { openmaptiles: { type: "vector", url: TILES_URL } },
    layers: [
      { id: "land", type: "background", paint: { "background-color": colors.land } },
      {
        id: "water",
        type: "fill",
        source: "openmaptiles",
        "source-layer": "water",
        paint: { "fill-color": colors.water, "fill-outline-color": colors.coast },
      },
    ],
  };
}

/** Reads the design system's tokens so the map follows the same palette as the UI. */
export function readMapColors(element: Element = document.documentElement) {
  const style = getComputedStyle(element);
  const token = (name: string) => style.getPropertyValue(name).trim();
  return {
    land: token("--atlas-color-bg-raised"),
    water: token("--atlas-color-bg"),
    coast: token("--atlas-color-border-strong"),
    accent: token("--atlas-color-accent"),
    foreground: token("--atlas-color-fg"),
    muted: token("--atlas-color-muted"),
    artist: token("--atlas-color-entity-artist"),
  };
}
