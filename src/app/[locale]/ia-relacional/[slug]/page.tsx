import { cache } from "react";

import { getTranslations } from "next-intl/server";

import { getResearchResponse } from "@/lib/atlas";
import { Research } from "@/modules/research";

import type { Metadata } from "next";

// Open sources and the collection change independently of deploys and are
// fetched with Axios (not Next's `fetch`), so Next can't detect it's dynamic.
export const dynamic = "force-dynamic";

// generateMetadata and the page share one request per render. A failure is null:
// the page says the sources are unavailable instead of going to the error screen.
const loadResearch = cache((slug: string) =>
  getResearchResponse(slug).catch((error: unknown) => {
    console.error("Failed to load the research:", error instanceof Error ? error.message : error);
    return null;
  }),
);

export async function generateMetadata({ params }: PageProps<"/[locale]/ia-relacional/[slug]">): Promise<Metadata> {
  const { locale, slug } = await params;
  const [t, data] = await Promise.all([getTranslations({ locale, namespace: "RESEARCH" }), loadResearch(slug)]);
  const name = data?.research?.artist.name;
  return { title: name ? `${name} · ${t("TITLE")}` : t("TITLE") };
}

export default async function Page({ params }: PageProps<"/[locale]/ia-relacional/[slug]">) {
  const { slug } = await params;
  // An unknown slug goes to the 404 (see Research).
  return <Research data={await loadResearch(slug)} />;
}
