import { getTranslations } from "next-intl/server";

import { ComingSoon } from "@/shared/components/ComingSoon";

import type { Metadata } from "next";

export async function generateMetadata({ params }: PageProps<"/[locale]/sobre">): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "ABOUT" });
  return { title: t("TITLE") };
}

export default async function Page() {
  const t = await getTranslations("ABOUT");
  return <ComingSoon title={t("TITLE")} />;
}
