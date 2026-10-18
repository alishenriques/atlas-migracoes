import { getTranslations } from "next-intl/server";

import { getMapData } from "@/lib/atlas";
import { HistoricalLayer } from "@/modules/historical";

import type { Metadata } from "next";

// Collection data changes independently of deploys and is fetched with Axios
// (not Next's `fetch`), so Next can't detect it's dynamic on its own.
export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: PageProps<"/[locale]/camada-historica">): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "HISTORICAL_LAYER" });
  return { title: t("TITLE") };
}

export default async function Page() {
  const data = await getMapData().catch((error: unknown) => {
    console.error("Failed to load the artists:", error instanceof Error ? error.message : error);
    return null;
  });
  return <HistoricalLayer data={data} />;
}
