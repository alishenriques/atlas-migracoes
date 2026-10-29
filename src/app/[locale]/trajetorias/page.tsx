import { getTranslations } from "next-intl/server";

import { getArtistIndex } from "@/lib/atlas";
import { TrajectoryIndex } from "@/modules/trajectories";

import type { Metadata } from "next";

// Collection data changes independently of deploys and is fetched with Axios
// (not Next's `fetch`), so Next can't detect it's dynamic on its own.
export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: PageProps<"/[locale]/trajetorias">): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "TRAJECTORIES" });
  return { title: t("TITLE") };
}

export default async function Page() {
  const data = await getArtistIndex().catch((error: unknown) => {
    console.error("Failed to load the artists:", error instanceof Error ? error.message : error);
    return null;
  });
  return <TrajectoryIndex data={data} />;
}
