import { z } from "zod";

// Mirrors the API's GraphQL types (atlas-migracoes-api, src/graphql/schema.ts).
// Responses are validated here too, even though the API already validates them.

export const dataSourceSchema = z.enum(["database", "demo"]);

export const statsSchema = z.object({
  artists: z.number().int(),
  works: z.number().int(),
  exhibitions: z.number().int(),
  publications: z.number().int(),
  places: z.number().int(),
  originCountries: z.number().int(),
});

export const overviewSchema = z.object({
  meta: z.object({ source: dataSourceSchema }),
  stats: statsSchema,
});

export type DataSource = z.infer<typeof dataSourceSchema>;
export type Stats = z.infer<typeof statsSchema>;
export type Overview = z.infer<typeof overviewSchema>;

export const datePrecisionSchema = z.enum(["day", "month", "year", "circa", "range", "unknown"]);

/** A date from the collection with how exact it is; never display it as more exact than `precision`. */
export const fuzzyDateSchema = z.object({
  raw: z.string().nullable(),
  year: z.number().int().nullable(),
  endYear: z.number().int().nullable(),
  iso: z.string().nullable(),
  precision: datePrecisionSchema,
});

export const placeSchema = z.object({
  id: z.string(),
  label: z.string(),
  country: z.string(),
  currentName: z.string().nullable(),
  lat: z.number().nullable(),
  lng: z.number().nullable(),
});

export const mapExhibitionSchema = z.object({
  id: z.string(),
  title: z.string(),
  startDate: fuzzyDateSchema,
  place: placeSchema.nullable(),
});

/** What the Explorar map needs from each artist to draw a trajectory. */
export const mapArtistSchema = z.object({
  slug: z.string(),
  name: z.string(),
  birthPlace: placeSchema.nullable(),
  birthDate: fuzzyDateSchema,
  deathPlace: placeSchema.nullable(),
  deathDate: fuzzyDateSchema,
  exhibitions: z.array(mapExhibitionSchema),
});

export const mapDataSchema = z.object({
  artists: z.array(mapArtistSchema),
});

export type DatePrecision = z.infer<typeof datePrecisionSchema>;
export type FuzzyDate = z.infer<typeof fuzzyDateSchema>;
export type Place = z.infer<typeof placeSchema>;
export type MapArtist = z.infer<typeof mapArtistSchema>;
export type MapData = z.infer<typeof mapDataSchema>;
