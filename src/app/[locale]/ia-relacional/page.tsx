import { getTranslations } from "next-intl/server";

import { redirect } from "@/i18n/navigation";
import { getArtistIndex } from "@/lib/atlas";
import { ResearchIndex } from "@/modules/research";

import type { Metadata } from "next";

// Collection data and open sources change independently of deploys and are
// fetched with Axios (not Next's `fetch`), so Next can't detect it's dynamic.
export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: PageProps<"/[locale]/ia-relacional">): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "RESEARCH" });
  return { title: t("TITLE") };
}

export default async function Page({ params, searchParams }: PageProps<"/[locale]/ia-relacional">) {
  const [{ locale }, { artista }] = await Promise.all([params, searchParams]);
  // Links from before each artist had a page of their own (`?artista=<slug>`) land on that page.
  if (typeof artista === "string" && artista) {
    redirect({ href: { pathname: "/ia-relacional/[slug]", params: { slug: artista } }, locale });
  }
  const data = await getArtistIndex().catch((error: unknown) => {
    console.error("Failed to load the artists:", error instanceof Error ? error.message : error);
    return null;
  });
  return <ResearchIndex data={data} />;
}
