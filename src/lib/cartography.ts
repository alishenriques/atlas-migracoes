import { booleanPointInPolygon } from "@turf/boolean-point-in-polygon";
import { z } from "zod";

import type { FuzzyDate } from "@/lib/schemas";

import type { FeatureCollection, MultiPolygon, Point, Polygon } from "geojson";

/**
 * Historical state borders of Europe, built into public/cartography by
 * scripts/build-cartography.mts from CShapes 2.0. Each polygon is one version
 * of a state's territory, valid from `start` to `end` (ISO dates, inclusive).
 */
export const STATES_URL = "/cartography/europe-states.geojson";

/** First and last day the source covers. */
export const COVERAGE = { start: "1886-01-01", end: "2019-12-31" } as const;

/** West, south, east, north: the area the borders were clipped to (see the build script). */
export const EUROPE_BOUNDS: [west: number, south: number, east: number, north: number] = [-25, 33, 60, 72];

/** Decades the Camada Histórica switches between, by their first year. */
export const DECADES = [1910, 1920, 1930, 1940, 1950, 1960, 1970, 1980] as const;
export type Decade = (typeof DECADES)[number];

/** The years of a decade, for choosing the exact year of the map. */
export const yearsOf = (decade: Decade) => Array.from({ length: 10 }, (_, index) => decade + index);

/** The day a year's map shows: 1 July, mid-year, so it does not sit on a 1 January treaty date. */
export const mapDate = (year: number) => `${year}-07-01`;

const geometrySchema = z.union([
  z.object({ type: z.literal("Polygon"), coordinates: z.array(z.array(z.tuple([z.number(), z.number()]))) }),
  z.object({
    type: z.literal("MultiPolygon"),
    coordinates: z.array(z.array(z.array(z.tuple([z.number(), z.number()])))),
  }),
]);

const isoDay = z.string().regex(/^\d{4}-\d{2}-\d{2}$/);

const statePropertiesSchema = z.object({
  /** Name of the state as the source gives it. */
  name: z.string(),
  start: isoDay,
  end: isoDay,
});

export const statesSchema = z.object({
  type: z.literal("FeatureCollection"),
  features: z.array(z.object({ type: z.literal("Feature"), properties: statePropertiesSchema, geometry: geometrySchema })),
});

export type StateProperties = z.infer<typeof statePropertiesSchema>;
export type States = FeatureCollection<Polygon | MultiPolygon, StateProperties>;

/** The state polygons in force on a day. */
export function statesOn(states: States, day: string): States {
  return {
    type: "FeatureCollection",
    features: states.features.filter(({ properties }) => properties.start <= day && day <= properties.end),
  };
}

/** The state that contained a point on a day, or null (sea, a territory that was no state's, or outside coverage). */
export function stateAt(states: States, day: string, lng: number, lat: number): string | null {
  const inForce = statesOn(states, day).features;
  return inForce.find((feature) => booleanPointInPolygon([lng, lat], feature))?.properties.name ?? null;
}

/** First and last day a date from the collection can mean, or null when the year is unknown. */
export function dateSpan(date: FuzzyDate): [first: string, last: string] | null {
  if (date.year === null) return null;
  if (date.precision === "day" && date.iso) return [date.iso, date.iso];
  if (date.precision === "month" && date.iso) return [`${date.iso}-01`, `${date.iso}-31`];
  return [`${date.year}-01-01`, `${date.endYear ?? date.year}-12-31`];
}

/** Where a place stood politically at a date of the collection, kept as uncertain as the date. */
export type StateAtDate =
  /** The year is unknown or outside the source's coverage. */
  | { kind: "unknown" }
  /** The same state on the first and last day the date can mean. */
  | { kind: "state"; name: string | null; circa: boolean }
  /** The border moved within the date's span: the state on each end. */
  | { kind: "changed"; from: string | null; to: string | null };

/**
 * The state that held a place at a date as exact as the source gives it: if
 * the date is a year and the border moved during that year, both states are
 * returned rather than picking one. "c." dates are flagged.
 */
export function stateAtDate(states: States, date: FuzzyDate, lng: number, lat: number): StateAtDate {
  const span = dateSpan(date);
  if (!span || span[0] < COVERAGE.start || span[1] > COVERAGE.end) return { kind: "unknown" };
  const [first, last] = span;
  const from = stateAt(states, first, lng, lat);
  const to = stateAt(states, last, lng, lat);
  if (from !== to) return { kind: "changed", from, to };
  return { kind: "state", name: from, circa: date.precision === "circa" };
}

type Ring = [number, number][];

/** Signed area and centroid of a polygon's outer ring (shoelace formula, in degrees). */
function ringCentroid(ring: Ring): { area: number; point: [number, number] } {
  let area = 0;
  let x = 0;
  let y = 0;
  for (let i = 0; i < ring.length - 1; i += 1) {
    const [x0, y0] = ring[i];
    const [x1, y1] = ring[i + 1];
    const cross = x0 * y1 - x1 * y0;
    area += cross;
    x += (x0 + x1) * cross;
    y += (y0 + y1) * cross;
  }
  area /= 2;
  if (area === 0) return { area: 0, point: ring[0] };
  return { area: Math.abs(area), point: [x / (6 * area), y / (6 * area)] };
}

/**
 * One label point per state, at the centre of its largest polygon, so a state
 * made of many islands or exclaves is named once.
 */
export function labelPoints(states: States): FeatureCollection<Point, { name: string }> {
  return {
    type: "FeatureCollection",
    features: states.features.map(({ properties, geometry }) => {
      const polygons = geometry.type === "Polygon" ? [geometry.coordinates] : geometry.coordinates;
      const outerRings = polygons.map((rings) => rings[0] as Ring);
      const largest = outerRings
        .map(ringCentroid)
        .reduce((best, candidate) => (candidate.area > best.area ? candidate : best));
      return { type: "Feature", properties: { name: properties.name }, geometry: { type: "Point", coordinates: largest.point } };
    }),
  };
}
