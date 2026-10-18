import axios from "axios";
import { beforeEach, describe, expect, it, vi } from "vitest";

const post = vi.fn();
vi.spyOn(axios, "create").mockReturnValue({ post } as unknown as ReturnType<typeof axios.create>);

const { getArtistRecord, getMapData, getNetworkData, getOverview } = await import("./atlas");

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
