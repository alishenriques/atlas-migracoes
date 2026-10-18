import { describe, expect, it } from "vitest";

import type { FuzzyDate, MapArtist, Place } from "@/lib/schemas";

import {
  buildTrajectory,
  filterTrajectories,
  FULL_PERIOD,
  legs,
  livedDuring,
  originCountries,
  stopsInPeriod,
} from "./trajectory";

const year = (y: number | null, precision: FuzzyDate["precision"] = "year"): FuzzyDate => ({
  raw: y === null ? "s.d." : String(y),
  year: y,
  endYear: y,
  iso: null,
  precision: y === null ? "unknown" : precision,
});

const place = (id: string, country: string, geocoded = true): Place => ({
  id,
  label: id,
  country,
  currentName: null,
  lat: geocoded ? -23.5 : null,
  lng: geocoded ? -46.6 : null,
});

const vilnius = place("vilna", "Polônia");
const paris = place("paris", "França");
const saoPaulo = place("sao-paulo", "Brasil");
const rio = place("rio", "Brasil");

const artist = (patch: Partial<MapArtist> = {}): MapArtist => ({
  slug: "lasar-segall",
  name: "Lasar Segall",
  birthPlace: vilnius,
  birthDate: year(1889),
  deathPlace: saoPaulo,
  deathDate: year(1957),
  exhibitions: [
    { id: "EX.2", title: "Rio", startDate: year(1943), place: rio },
    { id: "EX.1", title: "Paris", startDate: year(1932), place: paris },
  ],
  ...patch,
});

describe("buildTrajectory", () => {
  it("orders birth, exhibitions by year and death", () => {
    const { stops, posthumous, undrawn } = buildTrajectory(artist());
    expect(stops.map((stop) => [stop.kind, stop.place.id, stop.date.year])).toEqual([
      ["birth", "vilna", 1889],
      ["exhibition", "paris", 1932],
      ["exhibition", "rio", 1943],
      ["death", "sao-paulo", 1957],
    ]);
    expect(posthumous).toBe(0);
    expect(undrawn).toBe(0);
  });

  it("leaves out exhibitions after the artist's death", () => {
    const trajectory = buildTrajectory(
      artist({ exhibitions: [{ id: "EX.9", title: "Retrospectiva", startDate: year(1990), place: saoPaulo }] }),
    );
    expect(trajectory.stops.map((stop) => stop.kind)).toEqual(["birth", "death"]);
    expect(trajectory.posthumous).toBe(1);
  });

  it("counts points it cannot draw instead of guessing them", () => {
    const trajectory = buildTrajectory(
      artist({
        birthPlace: place("vombrowa", "Polônia", false),
        deathPlace: saoPaulo,
        deathDate: year(null),
        exhibitions: [
          { id: "EX.1", title: "Sem data", startDate: year(null), place: rio },
          { id: "EX.2", title: "Sem lugar", startDate: year(1950), place: null },
        ],
      }),
    );
    expect(trajectory.stops).toEqual([]);
    expect(trajectory.undrawn).toBe(4);
  });

  it("does not count a death that is simply not recorded", () => {
    expect(buildTrajectory(artist({ deathPlace: null, deathDate: year(null) })).undrawn).toBe(0);
  });
});

describe("periods", () => {
  const trajectory = buildTrajectory(artist());

  it("keeps the birthplace as origin and the stops dated inside the period", () => {
    expect(stopsInPeriod(trajectory, [1930, 1940]).map((stop) => stop.place.id)).toEqual(["vilna", "paris"]);
    expect(stopsInPeriod(trajectory, FULL_PERIOD)).toHaveLength(4);
  });

  it("drops the birthplace when the artist was born after the period", () => {
    expect(stopsInPeriod(trajectory, [1800, 1850])).toEqual([]);
  });

  it("tells whether the artist lived during the period", () => {
    expect(livedDuring(trajectory, [1918, 1930])).toBe(true);
    expect(livedDuring(trajectory, [1960, 1989])).toBe(false);
    expect(livedDuring(buildTrajectory(artist({ deathDate: year(null) })), [1980, 1989])).toBe(true);
  });
});

describe("filterTrajectories", () => {
  const trajectories = [
    buildTrajectory(artist()),
    buildTrajectory(artist({ slug: "anita", name: "Anita", birthPlace: place("viena", "Áustria"), deathDate: year(1940) })),
  ];

  it("filters by country of birth", () => {
    expect(
      filterTrajectories(trajectories, { originCountry: "Áustria", period: FULL_PERIOD }).map((t) => t.artist.slug),
    ).toEqual(["anita"]);
  });

  it("filters by period and cuts each trajectory to it", () => {
    const result = filterTrajectories(trajectories, { originCountry: "", period: [1950, 1989] });
    expect(result.map((t) => t.artist.slug)).toEqual(["lasar-segall"]);
    expect(result[0]?.visible.map((stop) => stop.kind)).toEqual(["birth", "death"]);
  });
});

describe("legs", () => {
  it("joins consecutive stops in different places", () => {
    const { stops } = buildTrajectory(
      artist({
        exhibitions: [
          { id: "EX.1", title: "A", startDate: year(1940), place: saoPaulo },
          { id: "EX.2", title: "B", startDate: year(1945), place: saoPaulo },
        ],
      }),
    );
    expect(legs(stops).map(([a, b]) => [a.place.id, b.place.id])).toEqual([["vilna", "sao-paulo"]]);
  });
});

describe("originCountries", () => {
  it("lists each country of birth once, alphabetically", () => {
    expect(
      originCountries([artist(), artist({ birthPlace: place("viena", "Áustria") }), artist({ birthPlace: null })], "pt"),
    ).toEqual(["Áustria", "Polônia"]);
  });
});
