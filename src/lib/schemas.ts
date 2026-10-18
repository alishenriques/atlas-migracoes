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

export const recordWorkSchema = z.object({
  id: z.string(),
  title: z.string(),
  date: fuzzyDateSchema,
  technique: z.string().nullable(),
  dimensions: z.string().nullable(),
  acquisition: z.string().nullable(),
  acquisitionDate: fuzzyDateSchema,
});

export const recordExhibitionSchema = mapExhibitionSchema.extend({
  endDate: fuzzyDateSchema,
  institution: z.string().nullable(),
  venue: z.string().nullable(),
});

export const recordPublicationSchema = z.object({
  id: z.string(),
  authors: z.string().nullable(),
  title: z.string(),
  city: z.string().nullable(),
  publisher: z.string().nullable(),
  date: fuzzyDateSchema,
  category: z.string().nullable(),
  periodical: z.string().nullable(),
});

/** Everything the Trajetórias record shows about one artist. */
export const artistRecordSchema = mapArtistSchema.extend({
  exhibitions: z.array(recordExhibitionSchema),
  works: z.array(recordWorkSchema),
  publications: z.array(recordPublicationSchema),
});

export const artistRecordResponseSchema = z.object({
  meta: z.object({ source: dataSourceSchema }),
  artist: artistRecordSchema.nullable(),
});

export type RecordWork = z.infer<typeof recordWorkSchema>;
export type RecordExhibition = z.infer<typeof recordExhibitionSchema>;
export type RecordPublication = z.infer<typeof recordPublicationSchema>;
export type ArtistRecord = z.infer<typeof artistRecordSchema>;
export type ArtistRecordResponse = z.infer<typeof artistRecordResponseSchema>;

export const networkExhibitionSchema = z.object({
  id: z.string(),
  title: z.string(),
  startDate: fuzzyDateSchema,
  institution: z.string().nullable(),
  place: placeSchema.nullable(),
});

export const networkPublicationSchema = z.object({
  id: z.string(),
  title: z.string(),
  date: fuzzyDateSchema,
  periodical: z.string().nullable(),
});

export const networkWorkSchema = z.object({
  id: z.string(),
  title: z.string(),
  date: fuzzyDateSchema,
  exhibitions: z.array(networkExhibitionSchema),
  publications: z.array(networkPublicationSchema),
});

/** What the Rede Relacional needs: each artist with their works and where each work was shown or published. */
export const networkArtistSchema = z.object({
  slug: z.string(),
  name: z.string(),
  birthPlace: placeSchema.nullable(),
  birthDate: fuzzyDateSchema,
  deathPlace: placeSchema.nullable(),
  works: z.array(networkWorkSchema),
});

export const networkDataSchema = z.object({
  meta: z.object({ source: dataSourceSchema }),
  artists: z.array(networkArtistSchema),
});

export type NetworkExhibition = z.infer<typeof networkExhibitionSchema>;
export type NetworkPublication = z.infer<typeof networkPublicationSchema>;
export type NetworkWork = z.infer<typeof networkWorkSchema>;
export type NetworkArtist = z.infer<typeof networkArtistSchema>;
export type NetworkData = z.infer<typeof networkDataSchema>;

/** The artists to choose from, for screens that start by picking one. */
export const artistListSchema = z.object({
  meta: z.object({ source: dataSourceSchema }),
  artists: z.array(z.object({ slug: z.string(), name: z.string() })),
});

export type ArtistList = z.infer<typeof artistListSchema>;

export const researchSourceSchema = z.enum(["wikidata", "wikipedia"]);
export const findingPropertySchema = z.enum([
  "birthDate",
  "birthPlace",
  "deathDate",
  "deathPlace",
  "citizenship",
  "occupation",
  "movement",
  "educatedAt",
  "memberOf",
  "notableWork",
  "summary",
]);
export const findingReviewSchema = z.enum(["present_day_name", "conflicts_with_collection"]);

// Source links are shown as links, so only https pages are accepted.
const sourceUrlSchema = z.url({ protocol: /^https$/ });

export const findingSchema = z.object({
  source: researchSourceSchema,
  sourceUrl: sourceUrlSchema,
  sourceTitle: z.string(),
  property: findingPropertySchema,
  propertyId: z.string().nullable(),
  value: z.string(),
  references: z.number().int().nonnegative(),
  reliability: z.enum(["documented", "undetermined"]),
  reviews: z.array(findingReviewSchema),
});

export const researchSchema = z.object({
  artist: mapArtistSchema.omit({ exhibitions: true }),
  match: z
    .object({
      id: z.string(),
      label: z.string(),
      description: z.string().nullable(),
      url: sourceUrlSchema,
      basis: z.enum(["birth_year", "name"]),
    })
    .nullable(),
  findings: z.array(findingSchema),
  sources: z.array(
    z.object({
      source: researchSourceSchema,
      status: z.enum(["ok", "no_match", "error"]),
      detail: z.string().nullable(),
    }),
  ),
  retrievedAt: z.iso.datetime({ offset: true }),
});

export const researchResponseSchema = z.object({ research: researchSchema.nullable() });

export type FindingProperty = z.infer<typeof findingPropertySchema>;
export type FindingReview = z.infer<typeof findingReviewSchema>;
export type Finding = z.infer<typeof findingSchema>;
export type Research = z.infer<typeof researchSchema>;
