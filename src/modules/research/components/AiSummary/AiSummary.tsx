import { Panel } from "@alishenriques/atlas-design-system";
import { useTranslations } from "next-intl";

import { findingAnchor, summaryParts } from "@/lib/research";
import type { ResearchSummary } from "@/lib/schemas";

import { styles } from "./styles/index.styles";

export type AiSummaryProps = {
  summary: ResearchSummary;
  /** How many findings the research has, so only citations of real findings become links. */
  findingCount: number;
};

// Message keys for the statuses that have no text to show.
const STATUS = { not_configured: "NOT_CONFIGURED", rejected: "REJECTED", error: "ERROR" } as const;

/** The AI summary of the findings, each [n] linking to the finding it cites; or why there is none. */
export function AiSummary({ summary, findingCount }: AiSummaryProps) {
  const t = useTranslations("RESEARCH");
  const { status, text, model } = summary;
  if (status === "no_findings") return null;

  return (
    <Panel title={t("AI_SUMMARY")}>
      {status === "ok" && text ? (
        <>
          <p className={styles.text}>
            {summaryParts(text, findingCount).map((part, index) =>
              "cite" in part ? (
                <a
                  key={index}
                  href={`#${findingAnchor(part.cite)}`}
                  className={styles.cite}
                  aria-label={t("CITATION", { n: part.cite })}
                >
                  [{part.cite}]
                </a>
              ) : (
                part.text
              ),
            )}
          </p>
          <p className={styles.note}>{t("AI_NOTE", { model: model ?? "Gemini" })}</p>
        </>
      ) : (
        <p className={styles.status}>{t(`AI_STATUS.${STATUS[status === "ok" ? "error" : status]}`)}</p>
      )}
    </Panel>
  );
}
