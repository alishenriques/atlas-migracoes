import { Eyebrow, Panel } from "@alishenriques/atlas-design-system";
import { useTranslations } from "next-intl";

import { styles } from "./styles/index.styles";

/** Placeholder for an MVP screen that is planned but not built yet. */
export function ComingSoon({ title }: { title: string }) {
  const t = useTranslations("COMING_SOON");

  return (
    <main className={styles.main}>
      <Eyebrow>{t("EYEBROW")}</Eyebrow>
      <h1 className={styles.title}>{title}</h1>
      <Panel>
        <p className={styles.body}>{t("BODY")}</p>
      </Panel>
    </main>
  );
}
