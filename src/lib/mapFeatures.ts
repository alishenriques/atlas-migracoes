import { greatCircle } from "@turf/great-circle";

import { migrationLeg, type GeoPlace, type Stop, type VisibleTrajectory } from "./trajectory";

import type { FeatureCollection, LineString, MultiLineString, Point } from "geojson";

/**
 * `migration`: a leg of the way from the birthplace to the first documented
 * place in Brazil; `route`: any other leg between documented points.
 */
export type LegKind = "migration" | "route";
export type LegProperties = { slug: string; selected: boolean; kind: LegKind };
/** `migration` marks a birthplace or first place in Brazil of a shown artist who migrated. */
export type PlaceProperties = { placeId: string; label: string; artists: number; selected: boolean; migration: boolean };

export type MapFeatures = {
  legs: FeatureCollection<LineString | MultiLineString, LegProperties>;
  places: FeatureCollection<Point, PlaceProperties>;
};

const position = (place: GeoPlace): [number, number] => [place.lng, place.lat];

const samePosition = (a: Stop, b: Stop) => a.place.lat === b.place.lat && a.place.lng === b.place.lng;

/**
 * GeoJSON for the map: each artist's documented points joined in date order by
 * great-circle lines, the legs from the birthplace to the first place in Brazil
 * marked as `migration`, and one point per place, sized by how many of the
 * shown artists passed there. With an artist selected, only their lines are drawn.
 */
export function toMapFeatures(trajectories: VisibleTrajectory[], selectedSlug: string | null): MapFeatures {
  const legFeatures: MapFeatures["legs"]["features"] = [];
  const places = new Map<string, { place: GeoPlace; artists: Set<string>; selected: boolean; migration: boolean }>();
  const focused = trajectories.some((trajectory) => trajectory.artist.slug === selectedSlug);

  for (const trajectory of trajectories) {
    const { slug } = trajectory.artist;
    const selected = slug === selectedSlug;
    const { visible } = trajectory;

    const leg = migrationLeg(trajectory);
    const arrival = leg ? visible.indexOf(leg[1]) : -1;

    if (!focused || selected) {
      visible.slice(1).forEach((to, index) => {
        const from = visible[index] as Stop;
        if (samePosition(from, to)) return;
        const line = greatCircle(position(from.place), position(to.place), { npoints: 64 });
        const kind: LegKind = index < arrival ? "migration" : "route";
        legFeatures.push({ type: "Feature", geometry: line.geometry, properties: { slug, selected, kind } });
      });
    }

    for (const stop of visible) {
      const entry = places.get(stop.place.id) ?? {
        place: stop.place,
        artists: new Set<string>(),
        selected: false,
        migration: false,
      };
      entry.artists.add(slug);
      entry.selected ||= selected;
      entry.migration ||= leg !== null && (stop === leg[0] || stop === leg[1]);
      places.set(stop.place.id, entry);
    }
  }

  return {
    legs: { type: "FeatureCollection", features: legFeatures },
    places: {
      type: "FeatureCollection",
      features: [...places.values()].map(({ place, artists, selected, migration }) => ({
        type: "Feature",
        geometry: { type: "Point", coordinates: position(place) },
        properties: { placeId: place.id, label: place.label, artists: artists.size, selected, migration },
      })),
    },
  };
}

/** [[west, south], [east, north]] around the stops, or null when there are none. */
export function boundsOf(stops: Stop[]): [[number, number], [number, number]] | null {
  if (stops.length === 0) return null;
  const lngs = stops.map((stop) => stop.place.lng);
  const lats = stops.map((stop) => stop.place.lat);
  return [
    [Math.min(...lngs), Math.min(...lats)],
    [Math.max(...lngs), Math.max(...lats)],
  ];
}
