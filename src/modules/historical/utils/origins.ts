import { mapDate, stateAt, stateAtDate, type StateAtDate, type States } from "@/lib/cartography";
import type { MapArtist } from "@/lib/schemas";
import { isGeocoded, type GeoPlace } from "@/lib/trajectory";

import type { Birthplace } from "../components/HistoricalMap";

/** An artist's place of origin read against the historical borders. */
export type Origin = {
  artist: MapArtist;
  place: GeoPlace;
  /** The state that held the birthplace when the artist was born, as exact as the birth date. */
  atBirth: StateAtDate;
  /** The state that held the birthplace in the year the map shows. */
  inYear: string | null;
};

/** Artists whose birthplace has coordinates, with the state at their birth and in `year`, by name. */
export function originsIn(artists: MapArtist[], states: States, year: number, locale: string): Origin[] {
  const day = mapDate(year);
  return artists
    .flatMap((artist) => (isGeocoded(artist.birthPlace) ? [{ artist, place: artist.birthPlace }] : []))
    .map(({ artist, place }) => ({
      artist,
      place,
      atBirth: stateAtDate(states, artist.birthDate, place.lng, place.lat),
      inYear: stateAt(states, day, place.lng, place.lat),
    }))
    .sort((a, b) => a.artist.name.localeCompare(b.artist.name, locale));
}

/** One map point per birthplace, sized by how many artists were born there. */
export function birthplacesOf(origins: Origin[]): Birthplace[] {
  const byPlace = new Map<string, Birthplace>();
  for (const { place } of origins) {
    const entry = byPlace.get(place.id) ?? { placeId: place.id, lng: place.lng, lat: place.lat, artists: 0 };
    entry.artists += 1;
    byPlace.set(place.id, entry);
  }
  return [...byPlace.values()];
}
