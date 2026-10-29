import { describe, expect, it } from "vitest";

import type { FuzzyDate, Research } from "@/lib/schemas";

import { activityYears, artistProfile, institutionsOf, listOf, stripCitations } from "./profile";

const finding = (property: string, value: string, reliability: "documented" | "undetermined" = "documented") => ({
  source: "wikidata" as const,
  sourceUrl: "https://www.wikidata.org/wiki/Q1",
  sourceTitle: "Wikidata",
  property: property as Research["findings"][number]["property"],
  propertyId: null,
  value,
  references: 1,
  reliability,
  reviews: [],
});

const research = (overrides: Partial<Research> = {}): Research =>
  ({
    findings: [
      finding("occupation", "pintor"),
      finding("occupation", "Pintor"),
      finding("occupation", "gravador"),
      finding("citizenship", "Brasil"),
      finding("memberOf", "Grupo Ruptura"),
      finding("movement", "abstracionismo", "undetermined"),
    ],
    summary: { status: "ok", text: "Nasceu em 1913 [1] em Varsóvia [2, 3]. Integrou o Grupo Ruptura [9–10].", citations: [], prompt: null, model: "gemini", detail: null },
    retrievedAt: "2026-10-21T15:00:00.000Z",
    ...overrides,
  }) as Research;

const year = (y: number | null, endYear = y): FuzzyDate => ({ raw: null, year: y, endYear, iso: null, precision: "year" });

describe("artistProfile", () => {
  it("takes the documented open-source facts, without repeats, and the AI summary without its marks", () => {
    const profile = artistProfile(research());
    expect(profile.occupation).toEqual({ values: ["pintor", "gravador"], sources: [{ title: "Wikidata", url: "https://www.wikidata.org/wiki/Q1" }] });
    expect(profile.nationality?.values).toEqual(["Brasil"]);
    expect(profile.group?.values).toEqual(["Grupo Ruptura"]);
    expect(profile.movement).toBeNull();
    expect(profile.education).toBeNull();
    expect(profile.bio).toEqual({
      text: "Nasceu em 1913 em Varsóvia. Integrou o Grupo Ruptura.",
      model: "gemini",
      retrievedAt: "2026-10-21T15:00:00.000Z",
    });
  });

  it("has no bio when the summary did not come out, and nothing without research", () => {
    const failed = research({ summary: { status: "error", text: null, citations: [], prompt: null, model: null, detail: "503" } });
    expect(artistProfile(failed).bio).toBeNull();
    expect(artistProfile(null)).toEqual({ occupation: null, nationality: null, movement: null, education: null, group: null, bio: null });
  });
});

describe("text helpers", () => {
  it("strips citation marks", () => {
    expect(stripCitations("Pintor [1, 2] e gravador [3-4] .")).toBe("Pintor e gravador.");
  });

  it("joins a list in the locale's style", () => {
    expect(listOf(["pintor", "artista gráfico", "designer"], "pt")).toBe("pintor, artista gráfico e designer");
    expect(listOf(["painter", "engraver"], "en")).toBe("painter and engraver");
  });
});

describe("collection facts", () => {
  it("spans the dated works and exhibitions", () => {
    const works = [{ date: year(1950, 1955) }, { date: year(null) }] as never;
    const exhibitions = [{ startDate: year(1961), institution: " MAM " }, { startDate: year(1948), institution: "MAM" }, { startDate: year(null), institution: null }] as never;
    expect(activityYears({ works, exhibitions, deathDate: year(null) })).toEqual({ from: 1948, to: 1961 });
    // A show after the artist's death is not activity.
    expect(activityYears({ works, exhibitions, deathDate: year(1958) })).toEqual({ from: 1948, to: 1955 });
    expect(activityYears({ works: [], exhibitions: [], deathDate: year(1958) })).toBeNull();
    expect(institutionsOf({ exhibitions })).toEqual(["MAM"]);
  });
});
