import axios from "axios";
import { beforeEach, describe, expect, it, vi } from "vitest";

const post = vi.fn();
vi.spyOn(axios, "create").mockReturnValue({ post } as unknown as ReturnType<typeof axios.create>);

const { getArtistIndex, getArtistRecord, getMapData, getNetworkData, getOverview, getResearch, getResearchResponse } = await import(
  "./atlas"
);

const reply = (data: unknown) => post.mockResolvedValue({ data: { data } });

const unknownDate = { raw: null, year: null, endYear: null, iso: null, precision: "unknown" };
const circa1930 = { raw: "c. 1930", year: 1930, endYear: 1930, iso: null, precision: "circa" };
const vilna = { id: "vilna", label: "Vilna", country: "Polônia", currentName: "Vilnius, Lituânia", lat: 54.7, lng: 25.3 };
const noCoordinates = { id: "x", label: "Lugar", country: "Brasil", currentName: null, lat: null, lng: null };

const mapArtist = {
  slug: "lasar-segall",
  name: "Lasar Segall",
  birthPlace: vilna,
  birthDate: circa1930,
  deathPlace: null,
  deathDate: unknownDate,
  exhibitions: [{ id: "EX.1", title: "Bienal", startDate: unknownDate, place: noCoordinates }],
};

beforeEach(() => post.mockReset());

describe("getOverview", () => {
  it("returns the counters and where they come from", async () => {
    const overview = {
      meta: { source: "demo" },
      stats: { artists: 2, works: 3, exhibitions: 1, publications: 1, places: 2, originCountries: 1 },
    };
    reply(overview);

    await expect(getOverview()).resolves.toEqual(overview);
    expect(post.mock.calls[0]?.[1]).toMatchObject({ query: expect.stringContaining("stats") });
  });

  it("rejects an unknown data source", async () => {
    reply({ meta: { source: "invented" }, stats: {} });
    await expect(getOverview()).rejects.toThrow();
  });
});

describe("getMapData", () => {
  it("keeps unknown places and dates as null", async () => {
    reply({ artists: [mapArtist] });
    await expect(getMapData()).resolves.toEqual({ artists: [mapArtist] });
  });

  it("rejects a date without its precision", async () => {
    reply({ artists: [{ ...mapArtist, birthDate: { ...circa1930, precision: undefined } }] });
    await expect(getMapData()).rejects.toThrow();
  });
});

describe("getArtistIndex", () => {
  it("returns each artist with their photo, or null without one", async () => {
    const artist = { ...mapArtist, exhibitions: undefined };
    const artists = [
      { ...artist, photo: null },
      { ...artist, slug: "anatol", photo: { url: "https://api.example/photos/anatol?v=1", credit: "Família" } },
    ];
    reply({ meta: { source: "database" }, artists });
    await expect(getArtistIndex()).resolves.toEqual({ meta: { source: "database" }, artists });
    expect(post.mock.calls[0]?.[1]).toMatchObject({ query: expect.stringContaining("photo") });
  });

  it("rejects a photo without a valid URL", async () => {
    const artist = { ...mapArtist, exhibitions: undefined };
    reply({ meta: { source: "database" }, artists: [{ ...artist, photo: { url: "foto.webp", credit: null } }] });
    await expect(getArtistIndex()).rejects.toThrow();
  });
});

describe("getArtistRecord", () => {
  it("asks for the slug and returns the whole record", async () => {
    const record = {
      ...mapArtist,
      exhibitions: [{ ...mapArtist.exhibitions[0], endDate: unknownDate, institution: null, venue: null }],
      works: [
        {
          id: "1963.1.1",
          title: "Paisagem",
          date: circa1930,
          technique: null,
          dimensions: null,
          acquisition: null,
          acquisitionDate: unknownDate,
        },
      ],
      publications: [
        {
          id: "P.1",
          authors: null,
          title: "Catálogo",
          city: null,
          publisher: null,
          date: unknownDate,
          category: null,
          periodical: null,
        },
      ],
      photo: { url: "https://api.example/photos/lasar-segall?v=abc", credit: null },
    };
    reply({ meta: { source: "database" }, artist: record });

    await expect(getArtistRecord("lasar-segall")).resolves.toEqual({ meta: { source: "database" }, artist: record });
    expect(post.mock.calls[0]?.[1]).toMatchObject({ variables: { slug: "lasar-segall" } });
  });

  it("returns null for an unknown slug", async () => {
    reply({ meta: { source: "database" }, artist: null });
    await expect(getArtistRecord("nobody")).resolves.toEqual({ meta: { source: "database" }, artist: null });
  });
});

describe("getNetworkData", () => {
  it("returns each artist's works with their exhibitions and publications", async () => {
    const network = {
      meta: { source: "database" },
      artists: [
        {
          slug: "lasar-segall",
          name: "Lasar Segall",
          birthPlace: vilna,
          birthDate: circa1930,
          deathPlace: null,
          works: [
            {
              id: "1963.1.1",
              title: "Paisagem",
              date: unknownDate,
              exhibitions: [{ id: "EX.1", title: "Bienal", startDate: circa1930, institution: "MAC USP", place: vilna }],
              publications: [{ id: "PB.1", title: "Catálogo", date: unknownDate, periodical: null }],
            },
          ],
        },
      ],
    };
    reply(network);
    await expect(getNetworkData()).resolves.toEqual(network);
    expect(post.mock.calls[0]?.[1]).toMatchObject({ query: expect.stringContaining("publications") });
  });

  it("rejects an exhibition without its institution field", async () => {
    reply({
      meta: { source: "database" },
      artists: [
        {
          slug: "a",
          name: "A",
          birthPlace: null,
          birthDate: unknownDate,
          deathPlace: null,
          works: [{ id: "w", title: "W", date: unknownDate, publications: [], exhibitions: [{ id: "e", title: "E", startDate: unknownDate, place: null }] }],
        },
      ],
    });
    await expect(getNetworkData()).rejects.toThrow();
  });
});

describe("getResearch", () => {
  const research = {
    artist: { ...mapArtist, exhibitions: undefined, photo: { url: "https://api.example/photos/lasar-segall?v=1", credit: null } },
    searchedNames: ["Lasar Segall"],
    match: { id: "Q1", label: "Lasar Segall", description: null, url: "https://www.wikidata.org/wiki/Q1", basis: "birth_year", note: null },
    candidates: [],
    findings: [
      {
        source: "wikidata",
        sourceUrl: "https://www.wikidata.org/wiki/Q1",
        sourceTitle: "Wikidata: Lasar Segall (Q1)",
        property: "birthDate",
        propertyId: "P569",
        value: "1891-07-21",
        labelLanguage: null,
        references: 1,
        reliability: "documented",
        reviews: ["conflicts_with_collection"],
      },
    ],
    sources: [{ source: "wikidata", status: "ok", detail: null }],
    period: { day: "1891-07-01", approximate: false, birthState: "Império Russo", states: ["Império Russo"] },
    summary: { status: "ok", text: "Pintor [1].", citations: [1], prompt: "# Instruções", model: "gemini-2.5-flash", detail: null },
    retrievedAt: "2026-10-18T12:00:00.000Z",
  };

  const meta = { source: "database" };

  it("asks for the slug and returns the findings with their sources", async () => {
    reply({ meta, research });
    await expect(getResearch("lasar-segall")).resolves.toEqual(research);
    expect(post.mock.calls[0]?.[1]).toMatchObject({ variables: { slug: "lasar-segall" } });
  });

  it("says whether the records are the collection's or the simulated demo", async () => {
    reply({ meta: { source: "demo" }, research });
    await expect(getResearchResponse("lasar-segall")).resolves.toEqual({ meta: { source: "demo" }, research });
    expect(post.mock.calls[0]?.[1]).toMatchObject({ query: expect.stringContaining("photo") });
  });

  it("returns null for an unknown artist", async () => {
    reply({ meta, research: null });
    await expect(getResearch("x")).resolves.toBeNull();
  });

  it("refuses a source link that is not https", async () => {
    const [finding] = research.findings;
    reply({ meta, research: { ...research, findings: [{ ...finding, sourceUrl: "javascript:alert(1)" }] } });
    await expect(getResearch("lasar-segall")).rejects.toThrow();
  });
});
