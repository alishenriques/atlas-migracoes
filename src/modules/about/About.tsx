import { Eyebrow, Panel, ReliabilityTag, type ReliabilityLevel } from "@alishenriques/atlas-design-system";
import { useTranslations } from "next-intl";

import { styles } from "./styles/index.styles";

const STEPS = ["READING", "RELATION", "RELIABILITY"] as const;
const LEVELS: { level: ReliabilityLevel; key: "DOCUMENTED" | "INFERRED" | "UNDETERMINED" }[] = [
  { level: "documented", key: "DOCUMENTED" },
  { level: "inferred", key: "INFERRED" },
  { level: "undetermined", key: "UNDETERMINED" },
];

/** Sobre: the research project, its methodology, how to read reliability, the data and the credits. */
export function About() {
  const t = useTranslations("ABOUT");

  return (
    <main className={styles.main}>
      <header className={styles.header}>
        <Eyebrow>{t("EYEBROW")}</Eyebrow>
        <h1 className={styles.title}>{t("TITLE")}</h1>
        <p className={styles.intro}>{t("INTRO")}</p>
      </header>

      <Panel title={t("PROJECT.TITLE")}>
        <p className={styles.body}>{t("PROJECT.PROBLEM")}</p>
        <dl className={styles.definitions}>
          {(["QUESTION", "GOAL", "HYPOTHESIS"] as const).map((key) => (
            <div key={key}>
              <dt className={styles.label}>{t(`PROJECT.${key}_LABEL`)}</dt>
              <dd className={styles.body}>{t(`PROJECT.${key}`)}</dd>
            </div>
          ))}
        </dl>
      </Panel>

      <Panel title={t("METHOD.TITLE")}>
        <ol className={styles.steps}>
          {STEPS.map((step) => (
            <li key={step} className={styles.step}>
              <h2 className={styles.stepTitle}>{t(`METHOD.${step}`)}</h2>
              <p className={styles.muted}>{t(`METHOD.${step}_BODY`)}</p>
            </li>
          ))}
        </ol>
        <p className={styles.body}>{t("METHOD.PROVENANCE")}</p>
      </Panel>

      <Panel title={t("LEVELS.TITLE")}>
        <ul className={styles.levels}>
          {LEVELS.map(({ level, key }) => (
            <li key={key} className={styles.level}>
              <ReliabilityTag level={level} label={t(`LEVELS.${key}`)} />
              <p className={styles.muted}>{t(`LEVELS.${key}_BODY`)}</p>
            </li>
          ))}
        </ul>
      </Panel>

      <Panel title={t("DATA.TITLE")}>
        <p className={styles.body}>{t("DATA.SOURCE")}</p>
        <p className={styles.body}>{t("DATA.PRECISION")}</p>
        <p className={styles.body}>{t("DATA.GAPS")}</p>
      </Panel>

      <Panel title={t("CREDITS.TITLE")}>
        <ul className={styles.credits}>
          {(["COLLECTION", "BASEMAP", "HISTORICAL", "SOFTWARE"] as const).map((key) => (
            <li key={key}>{t(`CREDITS.${key}`)}</li>
          ))}
        </ul>
      </Panel>
    </main>
  );
}
