import { getTranslations } from "next-intl/server";

import { getArtistList } from "@/lib/atlas";
import { Research } from "@/modules/research";

import type { Metadata } from "next";

// Collection data and open sources change independently of deploys and are
// fetched with Axios (not Next's `fetch`), so Next can't detect it's dynamic.
export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: PageProps<"/[locale]/ia-relacional">): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "RESEARCH" });
  return { title: t("TITLE") };
}

export default async function Page({ searchParams }: PageProps<"/[locale]/ia-relacional">) {
  // `?artista=<slug>` opens the research on that artist (linked from the record).
  const { artista } = await searchParams;
  const slug = typeof artista === "string" && artista ? artista : null;
  // The findings stream in their own Suspense boundary (see Research); the page waits only for the list.
  const list = await getArtistList().catch((error: unknown) => {
    console.error("Failed to load the artist list:", error instanceof Error ? error.message : error);
    return null;
  });
  return <Research list={list} slug={slug} />;
}
