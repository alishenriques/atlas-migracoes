import { describe, expect, it } from "vitest";

import type { States } from "@/lib/cartography";
import type { FuzzyDate, MapArtist, Place } from "@/lib/schemas";

import { birthplacesOf, originsIn } from "./origins";

const year = (y: number): FuzzyDate => ({ raw: String(y), year: y, endYear: y, iso: null, precision: "year" });
const place = (id: string, lng: number | null, lat: number | null): Place => ({
  id,
  label: id,
  country: "X",
  currentName: null,
  lat,
  lng,
});

const vilna = place("vilna", 25.3, 54.7);
const artist = (slug: string, birthPlace: Place | null, born = 1889): MapArtist => ({
  slug,
  name: slug,
  birthPlace,
  birthDate: year(born),
  deathPlace: null,
  deathDate: year(1957),
  exhibitions: [],
});

const square: [number, number][][] = [
  [
    [20, 50],
    [30, 50],
    [30, 60],
    [20, 60],
    [20, 50],
  ],
];
const states: States = {
  type: "FeatureCollection",
  features: [
    { type: "Feature", properties: { name: "Russia (Soviet Union)", start: "1886-01-01", end: "1917-12-31" }, geometry: { type: "Polygon", coordinates: square } },
    { type: "Feature", properties: { name: "Poland", start: "1922-03-24", end: "1939-09-28" }, geometry: { type: "Polygon", coordinates: square } },
  ],
};

describe("originsIn", () => {
  it("reads each birthplace against the borders at birth and in the year shown, sorted by name", () => {
    const origins = originsIn([artist("segall", vilna), artist("anonimo", vilna, 1930)], states, 1935, "pt");
    expect(origins.map((o) => [o.artist.slug, o.atBirth, o.inYear])).toEqual([
      ["anonimo", { kind: "state", name: "Polônia", circa: false }, "Polônia"],
      ["segall", { kind: "state", name: "Império Russo", circa: false }, "Polônia"],
    ]);
  });

  it("names the states in English on the English site", () => {
    const [origin] = originsIn([artist("segall", vilna)], states, 1935, "en");
    expect([origin?.atBirth, origin?.inYear]).toEqual([{ kind: "state", name: "Russian Empire", circa: false }, "Poland"]);
  });

  it("leaves out artists whose birthplace has no coordinates", () => {
    expect(originsIn([artist("a", null), artist("b", place("x", null, null))], states, 1935, "pt")).toEqual([]);
  });
});

describe("birthplacesOf", () => {
  it("puts one point per place, counting the artists born there", () => {
    const origins = originsIn([artist("a", vilna), artist("b", vilna), artist("c", place("rio", -43, -22))], states, 1935, "pt");
    expect(birthplacesOf(origins)).toEqual([
      { placeId: "vilna", lng: 25.3, lat: 54.7, artists: 2 },
      { placeId: "rio", lng: -43, lat: -22, artists: 1 },
    ]);
  });
});
