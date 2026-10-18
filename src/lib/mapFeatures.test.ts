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

describe("toMapFeatures", () => {
  it("draws one curved line from the birthplace to the first place in Brazil", () => {
    const { legs } = toMapFeatures(visible([artist("a")]), null);
    expect(legs.features).toHaveLength(1);
    const first = legs.features[0]?.geometry;
    expect(first?.type).toBe("LineString");
    if (first?.type !== "LineString") return;
    expect(first.coordinates[0]?.map((n) => Math.round(n))).toEqual([16, 48]);
    expect(first.coordinates.at(-1)?.map((n) => Math.round(n))).toEqual([-43, -23]);
    expect(first.coordinates.length).toBeGreaterThan(2);
  });

  it("marks the selected artist's lines and places", () => {
    const { legs, places } = toMapFeatures(visible([artist("a"), artist("b", { exhibitions: [] })]), "b");
    expect(legs.features.filter((f) => f.properties.selected).map((f) => f.properties.slug)).toEqual(["b"]);
    expect(places.features.find((f) => f.properties.placeId === "rio")?.properties.selected).toBe(false);
    expect(places.features.find((f) => f.properties.placeId === "viena")?.properties.selected).toBe(true);
  });

  it("puts one point per place, counting the artists who passed there", () => {
    const { places } = toMapFeatures(visible([artist("a"), artist("b")]), null);
    expect(places.features).toHaveLength(4);
    expect(places.features.find((f) => f.properties.placeId === "viena")?.properties.artists).toBe(2);
  });

  it("keeps exhibitions as points without lines between them", () => {
    const { legs, places } = toMapFeatures(visible([artist("a")]), null);
    expect(legs.features).toHaveLength(1);
    expect(places.features.map((f) => f.properties.placeId)).toContain("paris");
  });

  it("skips the line when both ends share the same coordinates", () => {
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
