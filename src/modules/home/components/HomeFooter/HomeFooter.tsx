import { useTranslations } from "next-intl";

import { styles } from "./styles/index.styles";

const PORTFOLIO_URL = "https://www.alissonhenriques.dev";

// The "AH" monogram and its triangle, as in the portfolio's brand files (alis-portfolio, shared/components/Logo).
const MONOGRAM_PATH =
  "M250 0 160 0 0 400 280 400 252 330 118 330 205 112.5 320 400 410 400 350 250 465 250 525 400 615 400 455 0 365 0 435 175 320 175Z";
const TRIANGLE_PATH = "M615 185 700 185 657.5 275Z";

/** The home page's footer: a quiet credit, the developer's AH logo in the Atlas colours, linking to the developer's portfolio. */
export function HomeFooter() {
  const t = useTranslations("HOME.FOOTER");

  return (
    <footer className={styles.root}>
      <a href={PORTFOLIO_URL} target="_blank" rel="noopener noreferrer" className={styles.link}>
        {t("DEVELOPED_BY")}{" "}
        <svg viewBox="0 0 700 400" role="img" aria-label={t("AUTHOR")} className={styles.logo}>
          <title>{t("AUTHOR")}</title>
          <path d={MONOGRAM_PATH} className={styles.monogram} />
          <path d={TRIANGLE_PATH} className={styles.triangle} />
        </svg>
      </a>
    </footer>
  );
}
