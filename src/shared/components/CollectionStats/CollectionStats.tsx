import { CollectionIcon, StatGrid, type CollectionIconName } from "@alishenriques/atlas-design-system";
import { useLocale, useTranslations } from "next-intl";

import type { Overview } from "@/lib/schemas";

type Counter = {
  key: keyof Overview["stats"];
  label: "ARTISTS" | "WORKS" | "EXHIBITIONS" | "PUBLICATIONS" | "ORIGIN_COUNTRIES";
  icon: CollectionIconName;
};

// The collection's counters, in the order of the strip under the map.
const COUNTERS: Counter[] = [
  { key: "artists", label: "ARTISTS", icon: "artists" },
  { key: "works", label: "WORKS", icon: "works" },
  { key: "exhibitions", label: "EXHIBITIONS", icon: "exhibitions" },
  { key: "publications", label: "PUBLICATIONS", icon: "publications" },
  { key: "originCountries", label: "ORIGIN_COUNTRIES", icon: "countries" },
];

export type CollectionStatsProps = {
  stats: Overview["stats"];
};

/** The collection counters (artists, works, exhibitions, publications, origin countries), each with its icon. */
export function CollectionStats({ stats }: CollectionStatsProps) {
  const t = useTranslations("COLLECTION_STATS");
  const format = new Intl.NumberFormat(useLocale());

  return (
    <StatGrid
      stats={COUNTERS.map(({ key, label, icon }) => ({
        value: format.format(stats[key]),
        label: t(label),
        icon: <CollectionIcon name={icon} />,
      }))}
    />
  );
}
