import { describe, expect, it } from "vitest";

import type { FuzzyDate } from "@/lib/schemas";

import { dateSpan, labelPoints, mapDate, stateAt, stateAtDate, statesOn, statesSchema, yearsOf, type States } from "./cartography";

const square = (west: number, south: number, size: number): [number, number][][] => [
  [
    [west, south],
    [west + size, south],
    [west + size, south + size],
    [west, south + size],
    [west, south],
  ],
];

// Vilnius sits at about 25.3, 54.7.
const states: States = {
  type: "FeatureCollection",
  features: [
    {
      type: "Feature",
      properties: { name: "Russia", start: "1886-01-01", end: "1917-12-31" },
      geometry: { type: "Polygon", coordinates: square(20, 50, 10) },
    },
    {
      type: "Feature",
      properties: { name: "Poland", start: "1922-03-24", end: "1939-09-28" },
      geometry: { type: "Polygon", coordinates: square(20, 50, 10) },
    },
  ],
};

const date = (patch: Partial<FuzzyDate>): FuzzyDate => ({
  raw: null,
  year: null,
  endYear: null,
  iso: null,
  precision: "unknown",
  ...patch,
});

describe("yearsOf and mapDate", () => {
  it("lists the ten years of a decade and maps a year to 1 July", () => {
    expect(yearsOf(1930)).toEqual([1930, 1931, 1932, 1933, 1934, 1935, 1936, 1937, 1938, 1939]);
    expect(mapDate(1935)).toBe("1935-07-01");
  });
});

describe("statesOn and stateAt", () => {
  it("keeps only the polygons in force on the day", () => {
    expect(statesOn(states, "1930-07-01").features.map((f) => f.properties.name)).toEqual(["Poland"]);
    expect(statesOn(states, "1920-07-01").features).toHaveLength(0);
  });

  it("names the state containing the point on the day, or null", () => {
    expect(stateAt(states, "1900-07-01", 25.3, 54.7)).toBe("Russia");
    expect(stateAt(states, "1930-07-01", 25.3, 54.7)).toBe("Poland");
    expect(stateAt(states, "1920-07-01", 25.3, 54.7)).toBeNull();
    expect(stateAt(states, "1930-07-01", -46.6, -23.5)).toBeNull();
  });
});

describe("dateSpan", () => {
  it("spans the days a date can mean, at its precision", () => {
    expect(dateSpan(date({ year: 1946, iso: "1946-06-22", precision: "day" }))).toEqual(["1946-06-22", "1946-06-22"]);
    expect(dateSpan(date({ year: 1950, iso: "1950-03", precision: "month" }))).toEqual(["1950-03-01", "1950-03-31"]);
    expect(dateSpan(date({ year: 1901, endYear: 1901, precision: "year" }))).toEqual(["1901-01-01", "1901-12-31"]);
    expect(dateSpan(date({ year: 1940, endYear: 1945, precision: "range" }))).toEqual(["1940-01-01", "1945-12-31"]);
    expect(dateSpan(date({}))).toBeNull();
  });
});

describe("stateAtDate", () => {
  it("gives one state when the border held for the whole span", () => {
    expect(stateAtDate(states, date({ year: 1889, endYear: 1889, precision: "year" }), 25.3, 54.7)).toEqual({
      kind: "state",
      name: "Russia",
      circa: false,
    });
  });

  it("flags circa dates", () => {
    expect(stateAtDate(states, date({ year: 1930, precision: "circa" }), 25.3, 54.7)).toEqual({
      kind: "state",
      name: "Poland",
      circa: true,
    });
  });

  it("gives both ends when the border moved within the span, instead of picking one", () => {
    expect(stateAtDate(states, date({ year: 1939, endYear: 1939, precision: "year" }), 25.3, 54.7)).toEqual({
      kind: "changed",
      from: "Poland",
      to: null,
    });
  });

  it("is unknown without a year or outside the source's coverage", () => {
    expect(stateAtDate(states, date({}), 25.3, 54.7)).toEqual({ kind: "unknown" });
    expect(stateAtDate(states, date({ year: 1880, endYear: 1880, precision: "year" }), 25.3, 54.7)).toEqual({
      kind: "unknown",
    });
  });
});

describe("statesSchema", () => {
  it("rejects a polygon without validity dates", () => {
    const invalid = { ...states, features: [{ ...states.features[0], properties: { name: "Russia" } }] };
    expect(statesSchema.safeParse(invalid).success).toBe(false);
  });
});

describe("labelPoints", () => {
  it("names each state once, at the centre of its largest polygon", () => {
    const islands: States = {
      type: "FeatureCollection",
      features: [
        {
          type: "Feature",
          properties: { name: "Greece", start: "1886-01-01", end: "2019-12-31" },
          geometry: { type: "MultiPolygon", coordinates: [square(30, 30, 1), square(20, 36, 4)] },
        },
        ...states.features.slice(0, 1),
      ],
    };
    expect(labelPoints(islands).features).toEqual([
      { type: "Feature", properties: { name: "Greece" }, geometry: { type: "Point", coordinates: [22, 38] } },
      { type: "Feature", properties: { name: "Russia" }, geometry: { type: "Point", coordinates: [25, 55] } },
    ]);
  });

  it("falls back to the first vertex of a degenerate ring", () => {
    const line: States = {
      type: "FeatureCollection",
      features: [
        {
          type: "Feature",
          properties: { name: "Sliver", start: "1886-01-01", end: "2019-12-31" },
          geometry: { type: "Polygon", coordinates: [[[1, 1], [2, 2], [1, 1]]] },
        },
      ],
    };
    expect(labelPoints(line).features[0]?.geometry.coordinates).toEqual([1, 1]);
  });
});
