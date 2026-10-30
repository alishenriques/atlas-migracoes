import { cache } from "react";

import { getTranslations } from "next-intl/server";

import { getArtistRecord, getNetworkData, getResearch } from "@/lib/atlas";
import { ArtistRecord } from "@/modules/trajectories";

import type { Metadata } from "next";

export const dynamic = "force-dynamic";

// generateMetadata and the page share one request per render.
const loadRecord = cache((slug: string) => getArtistRecord(slug));

export async function generateMetadata({ params }: PageProps<"/[locale]/trajetorias/[slug]">): Promise<Metadata> {
  const { locale, slug } = await params;
  const t = await getTranslations({ locale, namespace: "TRAJECTORIES" });
  const record = await loadRecord(slug).catch(() => null);
  return { title: record?.artist?.name ?? t("TITLE") };
}

export default async function Page({ params }: PageProps<"/[locale]/trajetorias/[slug]">) {
  const { slug } = await params;
  // The bio, the open-source facts and the connections are extras: without them the record still opens.
  const [data, research, network] = await Promise.all([
    loadRecord(slug),
    getResearch(slug).catch((error: unknown) => {
      console.error("Failed to load the research:", error instanceof Error ? error.message : error);
      return null;
    }),
    getNetworkData().catch((error: unknown) => {
      console.error("Failed to load the network:", error instanceof Error ? error.message : error);
      return null;
    }),
  ]);
  // A failed record request goes to the localized error boundary; an unknown slug to the 404.
  return <ArtistRecord data={data} research={research} network={network} />;
}
