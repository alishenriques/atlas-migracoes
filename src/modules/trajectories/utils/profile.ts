import type { ArtistRecord, Finding, FindingProperty, Research } from "@/lib/schemas";

const SOURCE_NAMES: Record<Finding["source"], string> = { wikidata: "Wikidata", wikipedia: "Wikipédia" };

/** What the open sources say about one fact, with where it was read. */
export type SourcedFact = { values: string[]; sources: { title: string; url: string }[] };

export type ArtistProfile = {
  occupation: SourcedFact | null;
  nationality: SourcedFact | null;
  movement: SourcedFact | null;
  education: SourcedFact | null;
  group: SourcedFact | null;
  /** The AI summary of the open sources, without its [n] citation marks. */
  bio: { text: string; model: string | null; retrievedAt: string } | null;
};

/**
 * The open-source facts the record shows beside the collection's own, from
 * the stored Relational AI research. Only documented findings enter: a fact
 * the sources do not back stays out instead of being guessed.
 */
export function artistProfile(research: Research | null): ArtistProfile {
  const fact = (property: FindingProperty): SourcedFact | null => {
    const found = research?.findings.filter(
      (finding: Finding) => finding.property === property && finding.reliability === "documented",
    );
    if (!found?.length) return null;
    // The first spelling of each value wins; "Pintor" after "pintor" is a repeat.
    const values = found
      .map((finding) => finding.value)
      .filter((value, index, all) => all.findIndex((other) => other.toLocaleLowerCase() === value.toLocaleLowerCase()) === index);
    const sources = [...new Map(found.map((finding) => [finding.sourceUrl, SOURCE_NAMES[finding.source]])).entries()].map(
      ([url, title]) => ({ url, title }),
    );
    return { values, sources };
  };
  const summary = research?.summary;

  return {
    occupation: fact("occupation"),
    nationality: fact("citizenship"),
    movement: fact("movement"),
    education: fact("educatedAt"),
    group: fact("memberOf"),
    bio:
      research && summary?.status === "ok" && summary.text
        ? { text: stripCitations(summary.text), model: summary.model, retrievedAt: research.retrievedAt }
        : null,
  };
}

/** "Nasceu em 1913 [1] em Varsóvia [2, 3]." → "Nasceu em 1913 em Varsóvia." */
export function stripCitations(text: string): string {
  return text.replace(/\s*\[\d+(?:\s*[,–-]\s*\d+)*\]/g, "").replace(/\s+([.,;:])/g, "$1").trim();
}

/** "pintor, artista gráfico e designer gráfico", in the locale's list style. */
export function listOf(values: string[], locale: string): string {
  return new Intl.ListFormat(locale, { style: "long", type: "conjunction" }).format(values);
}

/**
 * Years the collection documents the artist at work: their works' dates and
 * the exhibitions held in their lifetime (posthumous shows are not activity).
 * Null when none is dated.
 */
export function activityYears(
  artist: Pick<ArtistRecord, "works" | "exhibitions" | "deathDate">,
): { from: number; to: number } | null {
  const death = artist.deathDate.endYear ?? artist.deathDate.year ?? Infinity;
  const years = [
    ...artist.works.flatMap((work) => [work.date.year, work.date.endYear]),
    ...artist.exhibitions.map((exhibition) => exhibition.startDate.year),
  ].filter((year): year is number => year !== null && year <= death);
  return years.length ? { from: Math.min(...years), to: Math.max(...years) } : null;
}

/** The institutions that showed the artist's works, in order of their first exhibition, without repeats. */
export function institutionsOf(artist: Pick<ArtistRecord, "exhibitions">): string[] {
  return [...new Set(artist.exhibitions.flatMap((exhibition) => (exhibition.institution ? [exhibition.institution.trim()] : [])))];
}
