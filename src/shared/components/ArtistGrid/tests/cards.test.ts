import { describe, expect, it } from "vitest";

import type { FuzzyDate, IndexArtist } from "@/lib/schemas";

import { artistCards } from "../utils/cards";

const year = (y: number | null): FuzzyDate => ({ raw: null, year: y, endYear: y, iso: null, precision: y === null ? "unknown" : "year" });
const vilna = { id: "v", label: "Vilna", country: "Lituânia", currentName: null, lat: 1, lng: 1 };
const lasar: IndexArtist = {
  slug: "lasar-segall",
  name: "Lasar Segall",
  birthPlace: vilna,
  birthDate: year(1889),
  deathPlace: null,
  deathDate: year(1957),
  photo: { url: "https://api.example/photos/lasar-segall?v=1", credit: null },
};

describe("artistCards", () => {
  it("joins the birth country and the life span, with the photo when there is one", () => {
    expect(artistCards([lasar], "pt", "s.d.")).toEqual([
      { slug: "lasar-segall", name: "Lasar Segall", photo: "https://api.example/photos/lasar-segall?v=1", meta: "Lituânia · 1889–1957" },
    ]);
  });

  it("leaves out what the collection does not know", () => {
    const unknown = { ...lasar, birthPlace: null, birthDate: year(null), deathDate: year(null), photo: null };
    expect(artistCards([unknown], "pt", "s.d.")).toEqual([{ slug: "lasar-segall", name: "Lasar Segall", photo: null, meta: "" }]);
  });
});
