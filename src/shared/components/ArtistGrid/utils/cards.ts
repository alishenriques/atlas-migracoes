import { lifeSpan } from "@/lib/dates";
import type { IndexArtist } from "@/lib/schemas";

import type { ArtistCard } from "../ArtistGrid";

/** Each artist as a card: name, photo, and the birth country beside the life span ("Polônia · 1889–1957"). */
export function artistCards(artists: IndexArtist[], locale: string, unknownDate: string): ArtistCard[] {
  return artists.map((artist) => ({
    slug: artist.slug,
    name: artist.name,
    photo: artist.photo?.url ?? null,
    meta: [artist.birthPlace?.country, lifeSpan(artist.birthDate, artist.deathDate, locale, unknownDate)].filter(Boolean).join(" · "),
  }));
}
