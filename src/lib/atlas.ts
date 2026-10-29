import { graphqlRequest } from "./graphql-client";
import {
  artistListSchema,
  artistRecordResponseSchema,
  mapDataSchema,
  networkDataSchema,
  overviewSchema,
  researchResponseSchema,
  type ArtistList,
  type ArtistRecordResponse,
  type MapData,
  type NetworkData,
  type Overview,
  type Research,
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

const NETWORK_QUERY = /* GraphQL */ `
  ${FRAGMENTS}

  query Network {
    meta {
      source
    }
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
      works {
        id
        title
        date {
          ...MapDate
        }
        exhibitions {
          id
          title
          startDate {
            ...MapDate
          }
          institution
          place {
            ...MapPlace
          }
        }
        publications {
          id
          title
          date {
            ...MapDate
          }
          periodical
        }
      }
    }
  }
`;

/** Every artist with their works and where each work was shown or published, for the Rede Relacional. */
export function getNetworkData(): Promise<NetworkData> {
  return graphqlRequest(networkDataSchema, NETWORK_QUERY);
}

const ARTIST_LIST_QUERY = /* GraphQL */ `
  query ArtistList {
    meta {
      source
    }
    artists {
      slug
      name
    }
  }
`;

/** Every artist's slug and name, for screens that start by picking one. */
export function getArtistList(): Promise<ArtistList> {
  return graphqlRequest(artistListSchema, ARTIST_LIST_QUERY);
}

const RESEARCH_QUERY = /* GraphQL */ `
  ${FRAGMENTS}

  query Research($slug: String!) {
    research(slug: $slug) {
      artist {
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
      }
      match {
        id
        label
        description
        url
        basis
        note
      }
      searchedNames
      candidates {
        id
        label
        description
        url
        birthYear
        foundBy
        reason
      }
      findings {
        source
        sourceUrl
        sourceTitle
        property
        propertyId
        value
        references
        reliability
        reviews
      }
      sources {
        source
        status
        detail
      }
      period {
        day
        approximate
        birthState
        states
      }
      summary {
        status
        text
        citations
        prompt
        model
        detail
      }
      retrievedAt
    }
  }
`;

/** What open sources say about an artist (null when the slug is unknown), each finding with its source. */
export async function getResearch(slug: string): Promise<Research | null> {
  return (await graphqlRequest(researchResponseSchema, RESEARCH_QUERY, { slug })).research;
}
