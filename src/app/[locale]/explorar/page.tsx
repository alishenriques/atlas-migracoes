import { getTranslations } from "next-intl/server";

import { ExplorarScreen } from "@/modules/explorar";

import type { Metadata } from "next";

// Collection data changes independently of deploys and is fetched with Axios
// (not Next's `fetch`), so Next can't detect it's dynamic on its own.
export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: PageProps<"/[locale]/explorar">): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "NAV" });
  return { title: t("EXPLORAR") };
}

export default function Page() {
  return <ExplorarScreen />;
}
