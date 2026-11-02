import { Eyebrow } from "@alishenriques/atlas-design-system";
import { useTranslations } from "next-intl";

import { styles } from "../../styles/index.styles";

/** The screen's presentation, on the list of artists and on each artist's page: what it does and how far to trust it. */
export function ResearchHeader() {
  const t = useTranslations("RESEARCH");

  return (
    <header className={styles.header}>
      <Eyebrow>{t("EYEBROW")}</Eyebrow>
      <div className={styles.titleRow}>
        <h1 className={styles.title}>{t("TITLE")}</h1>
        <span aria-hidden="true" className={styles.titleSeparator} />
        <p className={styles.titleNote}>{t("TITLE_NOTE")}</p>
      </div>
      <p className={styles.intro}>{t("INTRO")}</p>
    </header>
  );
}
