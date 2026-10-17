import { getTranslations } from "next-intl/server";

import { ComingSoon } from "@/shared/components/ComingSoon";

import type { Metadata } from "next";

export async function generateMetadata({ params }: PageProps<"/[locale]/trajetorias">): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "TRAJECTORIES" });
  return { title: t("TITLE") };
}

export default async function Page() {
  const t = await getTranslations("TRAJECTORIES");
  return <ComingSoon title={t("TITLE")} />;
}
