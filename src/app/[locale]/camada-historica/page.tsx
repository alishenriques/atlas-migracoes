import { getTranslations } from "next-intl/server";

import { ComingSoon } from "@/shared/components/ComingSoon";

import type { Metadata } from "next";

export async function generateMetadata({ params }: PageProps<"/[locale]/camada-historica">): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "HISTORICAL_LAYER" });
  return { title: t("TITLE") };
}

export default async function Page() {
  const t = await getTranslations("HISTORICAL_LAYER");
  return <ComingSoon title={t("TITLE")} />;
}
