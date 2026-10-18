"use client";

import { useMemo, useTransition } from "react";

import { SelectField } from "@alishenriques/atlas-design-system";
import { useLocale, useTranslations } from "next-intl";

import { useRouter } from "@/i18n/navigation";
import type { ArtistList } from "@/lib/schemas";

export type ArtistPickerProps = {
  artists: ArtistList["artists"];
  /** The artist being researched, or null before one is chosen. */
  selected: string | null;
};

/** Chooses the artist to research; the choice goes in the URL (`?artista=`), so a search can be linked and shared. */
export function ArtistPicker({ artists, selected }: ArtistPickerProps) {
  const t = useTranslations("RESEARCH");
  const locale = useLocale();
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const options = useMemo(
    () => [...artists].sort((a, b) => a.name.localeCompare(b.name, locale)).map(({ slug, name }) => ({ value: slug, label: name })),
    [artists, locale],
  );

  const choose = (slug: string) =>
    startTransition(() => router.push(slug ? { pathname: "/ia-relacional", query: { artista: slug } } : "/ia-relacional"));

  return (
    <SelectField
      label={t("PICK")}
      value={selected ?? ""}
      onChange={choose}
      aria-busy={pending}
      options={[{ value: "", label: t("PICK_PLACEHOLDER") }, ...options]}
    />
  );
}
