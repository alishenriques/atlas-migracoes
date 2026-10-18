import { getTranslations } from "next-intl/server";

import { getArtistList, getResearch } from "@/lib/atlas";
import { Research, type ResearchState } from "@/modules/research";

import type { Metadata } from "next";

// Collection data and open sources change independently of deploys and are
// fetched with Axios (not Next's `fetch`), so Next can't detect it's dynamic.
export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: PageProps<"/[locale]/ia-relacional">): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "RESEARCH" });
  return { title: t("TITLE") };
}

const logged =
  (what: string) =>
  (error: unknown): null => {
    console.error(`Failed to load ${what}:`, error instanceof Error ? error.message : error);
    return null;
  };

async function researchState(slug: string | null): Promise<ResearchState> {
  if (!slug) return { status: "idle" };
  try {
    const research = await getResearch(slug);
    return research ? { status: "found", research } : { status: "not_found" };
  } catch (error) {
    logged("the research")(error);
    return { status: "unavailable" };
  }
}

export default async function Page({ searchParams }: PageProps<"/[locale]/ia-relacional">) {
  // `?artista=<slug>` opens the research on that artist (linked from the record).
  const { artista } = await searchParams;
  const slug = typeof artista === "string" && artista ? artista : null;
  const [list, state] = await Promise.all([getArtistList().catch(logged("the artist list")), researchState(slug)]);
  return <Research list={list} slug={slug} state={state} />;
}
