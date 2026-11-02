import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";

import { Link } from "@/i18n/navigation";
import type { ResearchResponse } from "@/lib/schemas";
import { DemoNotice } from "@/shared/components/DemoNotice";

import { ResearchHeader } from "./components/ResearchHeader";
import { ResearchResults } from "./components/ResearchResults";
import { styles } from "./styles/index.styles";

export type ResearchProps = {
  /** The research on the page's artist; null when the open sources could not be reached. */
  data: ResearchResponse | null;
};

/** One artist's page in IA Relacional: what the collection records beside what open sources say about them. */
export async function Research({ data }: ResearchProps) {
  // An artist the collection does not have goes to the 404, as on Trajetórias.
  if (data && !data.research) notFound();
  const t = await getTranslations("RESEARCH");

  return (
    <main className={styles.artistPage}>
      {data?.meta.source === "demo" && <DemoNotice />}
      <Link href="/ia-relacional" className={styles.back}>
        <span aria-hidden="true">←</span> {t("BACK")}
      </Link>
      <ResearchHeader />
      {data?.research ? <ResearchResults research={data.research} /> : <p className={styles.muted}>{t("UNAVAILABLE")}</p>}
    </main>
  );
}
