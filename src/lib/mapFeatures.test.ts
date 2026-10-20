import { describe, expect, it } from "vitest";

import type { FuzzyDate, MapArtist, Place } from "@/lib/schemas";

import { boundsOf, toMapFeatures } from "./mapFeatures";
import { buildTrajectory, filterTrajectories, FULL_PERIOD } from "./trajectory";

const year = (y: number): FuzzyDate => ({ raw: String(y), year: y, endYear: y, iso: null, precision: "year" });
const place = (id: string, lat: number, lng: number, country = "Brasil"): Place => ({
  id,
  label: id,
  country,
  currentName: null,
  lat,
  lng,
});

const vienna = place("viena", 48.2, 16.37, "Áustria");
const paris = place("paris", 48.86, 2.35, "França");
const saoPaulo = place("sao-paulo", -23.55, -46.63);
const rio = place("rio", -22.9, -43.2);

const artist = (slug: string, patch: Partial<MapArtist> = {}): MapArtist => ({
  slug,
  name: slug,
  birthPlace: vienna,
  birthDate: year(1900),
  deathPlace: saoPaulo,
  deathDate: year(1970),
  exhibitions: [
    { id: "EX.1", title: "Paris", startDate: year(1930), place: paris },
    { id: "EX.2", title: "Rio", startDate: year(1950), place: rio },
  ],
  ...patch,
});

const visible = (artists: MapArtist[]) =>
  filterTrajectories(artists.map(buildTrajectory), { originCountry: "", period: FULL_PERIOD });

const ends = (feature: ReturnType<typeof toMapFeatures>["legs"]["features"][number]) => {
  const { geometry } = feature;
  const points = geometry.type === "LineString" ? geometry.coordinates : geometry.coordinates.flat();
  return [points[0], points.at(-1)].map((point) => point?.map((n) => Math.round(n)));
};

describe("toMapFeatures", () => {
  it("joins every documented point in date order with curved lines", () => {
    const { legs } = toMapFeatures(visible([artist("a")]), null);
    // Vienna (birth) → Paris (1930) → Rio (1950) → São Paulo (death)
    expect(legs.features.map(ends)).toEqual([
      [
        [16, 48],
        [2, 49],
      ],
      [
        [2, 49],
        [-43, -23],
      ],
      [
        [-43, -23],
        [-47, -24],
      ],
    ]);
    expect(legs.features[0]?.geometry.type).toBe("LineString");
    const first = legs.features[0]?.geometry;
    if (first?.type === "LineString") expect(first.coordinates.length).toBeGreaterThan(2);
  });

  it("marks the legs from the birthplace to the first place in Brazil as the migration", () => {
    const { legs, places } = toMapFeatures(visible([artist("a")]), null);
    expect(legs.features.map((f) => f.properties.kind)).toEqual(["migration", "migration", "route"]);
    const migration = (id: string) => places.features.find((f) => f.properties.placeId === id)?.properties.migration;
    expect(migration("viena")).toBe(true);
    expect(migration("rio")).toBe(true);
    expect(migration("paris")).toBe(false);
    expect(migration("sao-paulo")).toBe(false);
  });

  it("draws only route legs for an artist born in Brazil", () => {
    const { legs, places } = toMapFeatures(visible([artist("a", { birthPlace: saoPaulo, deathPlace: null })]), null);
    expect(legs.features.map((f) => f.properties.kind)).toEqual(["route", "route"]);
    expect(places.features.some((f) => f.properties.migration)).toBe(false);
  });

  it("draws only the selected artist's lines and marks their places", () => {
    const { legs, places } = toMapFeatures(visible([artist("a"), artist("b", { exhibitions: [] })]), "b");
    expect(legs.features.map((f) => [f.properties.slug, f.properties.selected])).toEqual([["b", true]]);
    expect(places.features.find((f) => f.properties.placeId === "rio")?.properties.selected).toBe(false);
    expect(places.features.find((f) => f.properties.placeId === "viena")?.properties.selected).toBe(true);
  });

  it("draws everyone's lines when the selected artist is filtered out", () => {
    const { legs } = toMapFeatures(visible([artist("a")]), "gone");
    expect(legs.features).toHaveLength(3);
  });

  it("puts one point per place, counting the artists who passed there", () => {
    const { places } = toMapFeatures(visible([artist("a"), artist("b")]), null);
    expect(places.features).toHaveLength(4);
    expect(places.features.find((f) => f.properties.placeId === "viena")?.properties.artists).toBe(2);
  });

  it("skips a leg whose ends share the same coordinates", () => {
    const sameSpot = place("sao-paulo-capital", -23.55, -46.63, "Áustria");
    const { legs } = toMapFeatures(visible([artist("a", { birthPlace: sameSpot, exhibitions: [] })]), null);
    expect(legs.features).toHaveLength(0);
  });
});

describe("boundsOf", () => {
  it("wraps the stops", () => {
    const [trajectory] = visible([artist("a")]);
    expect(boundsOf(trajectory?.stops ?? [])).toEqual([
      [-46.63, -23.55],
      [16.37, 48.86],
    ]);
    expect(boundsOf([])).toBeNull();
  });
});
