import { describe, expect, it } from "vitest";

import { formatSourceDate, groupFindings, isDateProperty, summariesOf } from "./research";

import type { Finding } from "./schemas";

const finding = (property: Finding["property"], value: string): Finding => ({
  source: property === "summary" ? "wikipedia" : "wikidata",
  sourceUrl: "https://www.wikidata.org/wiki/Q1",
  sourceTitle: "Wikidata: Fulano (Q1)",
  property,
  propertyId: property === "summary" ? null : "P1",
  value,
  references: 0,
  reliability: "undetermined",
  reviews: [],
});

describe("groupFindings", () => {
  it("groups statements in the screen's order, without empty properties or summaries", () => {
    const findings = [
      finding("occupation", "pintor"),
      finding("summary", "Texto"),
      finding("birthDate", "1891"),
      finding("occupation", "gravador"),
    ];
    expect(groupFindings(findings).map(({ property, findings: items }) => [property, items.map((item) => item.value)])).toEqual([
      ["birthDate", ["1891"]],
      ["occupation", ["pintor", "gravador"]],
    ]);
    expect(summariesOf(findings).map((item) => item.value)).toEqual(["Texto"]);
  });
});

describe("isDateProperty", () => {
  it("tells the dates apart", () => {
    expect(isDateProperty("birthDate")).toBe(true);
    expect(isDateProperty("deathDate")).toBe(true);
    expect(isDateProperty("birthPlace")).toBe(false);
  });
});

describe("formatSourceDate", () => {
  it("keeps the precision the source gives", () => {
    expect(formatSourceDate("1891", "pt")).toBe("1891");
    expect(formatSourceDate("1891-07", "pt")).toBe("jul. de 1891");
    expect(formatSourceDate("1891-07-21", "pt")).toBe("21 de jul. de 1891");
    expect(formatSourceDate("0950", "en")).toBe("950");
  });

  it("shows anything else as the source wrote it", () => {
    expect(formatSourceDate("-0300", "pt")).toBe("-0300");
    expect(formatSourceDate("século XIX", "pt")).toBe("século XIX");
  });
});
