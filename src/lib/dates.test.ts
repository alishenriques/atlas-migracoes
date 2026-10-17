import { describe, expect, it } from "vitest";

import { formatFuzzyDate } from "./dates";

import type { FuzzyDate } from "./schemas";

const date = (patch: Partial<FuzzyDate>): FuzzyDate => ({
  raw: null,
  year: 1949,
  endYear: 1949,
  iso: null,
  precision: "year",
  ...patch,
});

describe("formatFuzzyDate", () => {
  it("shows a full date only when the source has the day", () => {
    expect(formatFuzzyDate(date({ precision: "day", iso: "1949-03-12" }), "pt", "s.d.")).toBe("12 de mar. de 1949");
    expect(formatFuzzyDate(date({ precision: "day", iso: "1949-03-12" }), "en", "n.d.")).toBe("Mar 12, 1949");
  });

  it("shows month and year for a month", () => {
    expect(formatFuzzyDate(date({ precision: "month", iso: "1949-03" }), "pt", "s.d.")).toBe("mar. de 1949");
  });

  it("keeps approximate dates and ranges approximate", () => {
    expect(formatFuzzyDate(date({ precision: "year" }), "pt", "s.d.")).toBe("1949");
    expect(formatFuzzyDate(date({ precision: "circa" }), "pt", "s.d.")).toBe("c. 1949");
    expect(formatFuzzyDate(date({ precision: "range", year: 1940, endYear: 1945 }), "pt", "s.d.")).toBe("1940–1945");
  });

  it("uses the unknown label when there is no year", () => {
    expect(formatFuzzyDate(date({ precision: "unknown", year: null, endYear: null }), "pt", "s.d.")).toBe("s.d.");
  });
});
