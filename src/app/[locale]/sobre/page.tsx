import { getTranslations } from "next-intl/server";

import { About } from "@/modules/about";

import type { Metadata } from "next";

export async function generateMetadata({ params }: PageProps<"/[locale]/sobre">): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "ABOUT" });
  return { title: t("TITLE") };
}

export default function Page() {
  return <About />;
}
