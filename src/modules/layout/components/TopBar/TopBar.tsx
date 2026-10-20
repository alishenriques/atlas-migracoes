"use client";

import { useTranslations } from "next-intl";

import { Link, usePathname } from "@/i18n/navigation";
import { AtlasMark } from "@/shared/components/AtlasMark";

import { menuItems } from "../../constants/menuConfig";
import { LanguageSwitcher } from "../LanguageSwitcher";
import { styles } from "./styles/index.styles";

/** Header from the deck's screens: the Atlas mark and wordmark on the left, the MVP screens in the middle, language on the right. */
export function TopBar() {
  const t = useTranslations();
  const pathname = usePathname();

  return (
    <header className={styles.header}>
      <Link href="/" aria-label={t("SEO.SITE_NAME")} className={styles.brand}>
        <AtlasMark className={styles.mark} />
        <span className={styles.wordmark}>
          <span className={styles.name}>{t("BRAND.NAME")}</span>
          <span className={styles.tagline}>{t("BRAND.TAGLINE")}</span>
        </span>
      </Link>
      <nav aria-label={t("NAV.LABEL")} className={styles.nav}>
        {menuItems.map((item) => {
          // A record page (/trajetorias/[slug]) still belongs to its section.
          const isCurrent = pathname === item.href || (item.href !== "/" && pathname.startsWith(`${item.href}/`));
          return (
            <Link
              key={item.href}
              href={item.href}
              aria-current={isCurrent ? "page" : undefined}
              className={isCurrent ? styles.linkCurrent : styles.link}
            >
              {t(`NAV.${item.labelKey}`)}
            </Link>
          );
        })}
      </nav>
      <LanguageSwitcher />
    </header>
  );
}
