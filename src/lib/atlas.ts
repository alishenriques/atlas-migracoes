import { graphqlRequest } from "./graphql-client";
import {
  artistRecordResponseSchema,
  mapDataSchema,
  overviewSchema,
  type ArtistRecordResponse,
  type MapData,
  type Overview,
} from "./schemas";

const OVERVIEW_QUERY = /* GraphQL */ `
  query Overview {
    meta {
      source
    }
    stats {
      artists
      works
      exhibitions
      publications
      places
      originCountries
    }
  }
`;

/** Collection counters and where the data comes from (real or demo). */
export function getOverview(): Promise<Overview> {
  return graphqlRequest(overviewSchema, OVERVIEW_QUERY);
}

const FRAGMENTS = /* GraphQL */ `
  fragment MapPlace on Place {
    id
    label
    country
    currentName
    lat
    lng
  }

  fragment MapDate on FuzzyDate {
    raw
    year
    endYear
    iso
    precision
  }
`;

const MAP_QUERY = /* GraphQL */ `
  ${FRAGMENTS}

  query ExplorarMap {
    artists {
      slug
      name
      birthPlace {
        ...MapPlace
      }
      birthDate {
        ...MapDate
      }
      deathPlace {
        ...MapPlace
      }
      deathDate {
        ...MapDate
      }
      exhibitions {
        id
        title
        startDate {
          ...MapDate
        }
        place {
          ...MapPlace
        }
      }
    }
  }
`;

/** Every artist with the known points of their trajectory, for the Explorar map. */
export function getMapData(): Promise<MapData> {
  return graphqlRequest(mapDataSchema, MAP_QUERY);
}

const ARTIST_RECORD_QUERY = /* GraphQL */ `
  ${FRAGMENTS}

  query ArtistRecord($slug: String!) {
    meta {
      source
    }
    artist(slug: $slug) {
      slug
      name
      birthPlace {
        ...MapPlace
      }
      birthDate {
        ...MapDate
      }
      deathPlace {
        ...MapPlace
      }
      deathDate {
        ...MapDate
      }
      exhibitions {
        id
        title
        startDate {
          ...MapDate
        }
        endDate {
          ...MapDate
        }
        institution
        venue
        place {
          ...MapPlace
        }
      }
      works {
        id
        title
        date {
          ...MapDate
        }
        technique
        dimensions
        acquisition
        acquisitionDate {
          ...MapDate
        }
      }
      publications {
        id
        authors
        title
        city
        publisher
        date {
          ...MapDate
        }
        category
        periodical
      }
    }
  }
`;

/** One artist's record (null when the slug is unknown), with works, exhibitions and publications. */
export function getArtistRecord(slug: string): Promise<ArtistRecordResponse> {
  return graphqlRequest(artistRecordResponseSchema, ARTIST_RECORD_QUERY, { slug });
}
