import { getTranslations } from "next-intl/server";

import { getNetworkData } from "@/lib/atlas";
import { Network } from "@/modules/network";

import type { Metadata } from "next";

// Collection data changes independently of deploys and is fetched with Axios
// (not Next's `fetch`), so Next can't detect it's dynamic on its own.
export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: PageProps<"/[locale]/rede">): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "NETWORK" });
  return { title: t("TITLE") };
}

export default async function Page({ searchParams }: PageProps<"/[locale]/rede">) {
  // `?artista=<slug>` opens the network centered on that artist (linked from the record).
  const { artista } = await searchParams;
  const data = await getNetworkData().catch((error: unknown) => {
    console.error("Failed to load the network:", error instanceof Error ? error.message : error);
    return null;
  });
  return <Network data={data} initialSlug={typeof artista === "string" ? artista : null} />;
}
