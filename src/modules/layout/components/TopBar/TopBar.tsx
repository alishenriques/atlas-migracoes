"use client";

import { useTranslations } from "next-intl";

import { Link, usePathname } from "@/i18n/navigation";

import { menuItems } from "../../constants/menuConfig";
import { LanguageSwitcher } from "../LanguageSwitcher";
import { styles } from "./styles/index.styles";

/** Header from the deck's screens: wordmark on the left, the MVP screens in the middle, language on the right. */
export function TopBar() {
  const t = useTranslations();
  const pathname = usePathname();

  return (
    <header className={styles.header}>
      <Link href="/" className={styles.brand}>
        {t("SEO.SITE_NAME")}
      </Link>
      <nav aria-label={t("NAV.LABEL")} className={styles.nav}>
        {menuItems.map((item) => {
          const isCurrent = pathname === item.href;
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
