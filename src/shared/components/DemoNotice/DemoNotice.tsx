import { useTranslations } from "next-intl";

import { styles } from "./styles/index.styles";

/**
 * Shown whenever the API serves its simulated demo records (no database
 * connected), so nobody mistakes them for the MAC USP collection.
 */
export function DemoNotice() {
  const t = useTranslations();

  return (
    <p role="status" className={styles.notice}>
      {t("DEMO_NOTICE")}
    </p>
  );
}
