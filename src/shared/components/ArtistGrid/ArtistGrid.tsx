"use client";

import { useMemo, useState } from "react";

import { Avatar, SearchField } from "@alishenriques/atlas-design-system";
import { useTranslations } from "next-intl";

import { Link } from "@/i18n/navigation";
import { normalizeName } from "@/lib/network";

import { styles } from "./styles/index.styles";

export type ArtistCard = {
  slug: string;
  name: string;
  /** Photo URL; null while the base has none. */
  photo: string | null;
  /** Country and life span, already formatted, e.g. "Polônia · 1889–1957". */
  meta: string;
};

/** The per-artist pages a card can open: the Trajetórias record or the IA Relacional research. */
export type ArtistCardRoute = "/trajetorias/[slug]" | "/ia-relacional/[slug]";

export type ArtistGridProps = {
  artists: ArtistCard[];
  /** Where each card leads, with the artist's slug. */
  route: ArtistCardRoute;
  /** Names the list for assistive technology, e.g. "Fichas dos artistas". */
  label: string;
};

/** The artists' cards, filtered by name as the visitor types (case- and accent-insensitive). */
export function ArtistGrid({ artists, route, label }: ArtistGridProps) {
  const t = useTranslations("ARTIST_GRID");
  const [query, setQuery] = useState("");
  const indexed = useMemo(() => artists.map((artist) => ({ ...artist, key: normalizeName(artist.name) })), [artists]);
  const needle = normalizeName(query);
  const shown = needle ? indexed.filter((artist) => artist.key.includes(needle)) : indexed;

  return (
    <section className={styles.list} aria-label={label}>
      <div className={styles.toolbar}>
        <SearchField
          className={styles.search}
          label={t("SEARCH")}
          placeholder={t("SEARCH_PLACEHOLDER")}
          clearLabel={t("SEARCH_CLEAR")}
          value={query}
          onChange={setQuery}
        />
        <p className={styles.count} aria-live="polite">
          {needle ? t("SEARCH_COUNT", { shown: shown.length, total: artists.length }) : t("COUNT", { count: artists.length })}
        </p>
      </div>

      {shown.length ? (
        <ul className={styles.grid}>
          {shown.map((artist) => (
            <li key={artist.slug}>
              <Link href={{ pathname: route, params: { slug: artist.slug } }} className={styles.card}>
                <span className={styles.cardText}>
                  <span className={styles.cardName}>{artist.name}</span>
                  <span className={styles.cardMeta}>{artist.meta}</span>
                </span>
                {/* Without a photo, the avatar marks the empty slot. The name beside it already labels a photo. */}
                {artist.photo ? (
                  <Avatar src={artist.photo} size={52} />
                ) : (
                  <Avatar label={t("NO_PHOTO")} title={t("NO_PHOTO")} size={52} />
                )}
              </Link>
            </li>
          ))}
        </ul>
      ) : (
        <p className={styles.empty}>{t("SEARCH_EMPTY", { query: query.trim() })}</p>
      )}
    </section>
  );
}
