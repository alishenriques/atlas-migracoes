import { describe, expect, it } from "vitest";

import type { FuzzyDate, Place } from "@/lib/schemas";

import { lifeEvent, lifeSpan } from "../utils/life";

const year = (y: number | null, precision: FuzzyDate["precision"] = "year"): FuzzyDate => ({
  raw: null,
  year: y,
  endYear: y,
  iso: null,
  precision: y === null ? "unknown" : precision,
});
const vilna: Place = { id: "v", label: "Vilna", country: "Polônia", currentName: "Vilnius, Lituânia", lat: 1, lng: 1 };

describe("lifeEvent", () => {
  it("joins place and date as the source gives them", () => {
    expect(lifeEvent(vilna, year(1889), "pt", "s.d.")).toBe("Vilna (Vilnius, Lituânia), 1889");
    expect(lifeEvent(vilna, year(null), "pt", "s.d.")).toBe("Vilna (Vilnius, Lituânia), s.d.");
    expect(lifeEvent(null, year(1957, "circa"), "pt", "s.d.")).toBe("c. 1957");
  });

  it("returns null when nothing is known", () => {
    expect(lifeEvent(null, year(null), "pt", "s.d.")).toBeNull();
  });
});

describe("lifeSpan", () => {
  it("shows both ends, unknown ones labelled", () => {
    expect(lifeSpan(year(1889), year(1957), "pt", "s.d.")).toBe("1889–1957");
    expect(lifeSpan(year(1912, "circa"), year(null), "pt", "s.d.")).toBe("c. 1912–s.d.");
    expect(lifeSpan(year(null), year(null), "pt", "s.d.")).toBeNull();
  });
});
