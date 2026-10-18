import { greatCircle } from "@turf/great-circle";

import { migrationLeg, type GeoPlace, type Stop, type VisibleTrajectory } from "./trajectory";

import type { FeatureCollection, LineString, MultiLineString, Point } from "geojson";


export type LegProperties = { slug: string; selected: boolean };
export type PlaceProperties = { placeId: string; label: string; artists: number; selected: boolean };

export type MapFeatures = {
  legs: FeatureCollection<LineString | MultiLineString, LegProperties>;
  places: FeatureCollection<Point, PlaceProperties>;
};

const position = (place: GeoPlace): [number, number] => [place.lng, place.lat];

const samePosition = (a: Stop, b: Stop) => a.place.lat === b.place.lat && a.place.lng === b.place.lng;

/**
 * GeoJSON for the map: at most one great-circle line per artist, from the
 * birthplace to the first documented place in Brazil, and one point per place,
 * sized by how many of the shown artists passed there.
 */
export function toMapFeatures(trajectories: VisibleTrajectory[], selectedSlug: string | null): MapFeatures {
  const legFeatures: MapFeatures["legs"]["features"] = [];
  const places = new Map<string, { place: GeoPlace; artists: Set<string>; selected: boolean }>();

  for (const trajectory of trajectories) {
    const { slug } = trajectory.artist;
    const selected = slug === selectedSlug;

    const leg = migrationLeg(trajectory);
    if (leg && !samePosition(...leg)) {
      const line = greatCircle(position(leg[0].place), position(leg[1].place), { npoints: 64 });
      legFeatures.push({ type: "Feature", geometry: line.geometry, properties: { slug, selected } });
    }

    for (const stop of trajectory.visible) {
      const entry = places.get(stop.place.id) ?? { place: stop.place, artists: new Set<string>(), selected: false };
      entry.artists.add(slug);
      entry.selected ||= selected;
      places.set(stop.place.id, entry);
    }
  }

  return {
    legs: { type: "FeatureCollection", features: legFeatures },
    places: {
      type: "FeatureCollection",
      features: [...places.values()].map(({ place, artists, selected }) => ({
        type: "Feature",
        geometry: { type: "Point", coordinates: position(place) },
        properties: { placeId: place.id, label: place.label, artists: artists.size, selected },
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
