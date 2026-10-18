"use client";

import { useParams } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";

import { getPathname, Link, usePathname } from "@/i18n/navigation";
import { routing } from "@/i18n/routing";

import { styles } from "./styles/index.styles";

/** Links to the same page in the other locale. */
export function LanguageSwitcher() {
  const t = useTranslations("NAV");
  const locale = useLocale();
  const pathname = usePathname();
  // Dynamic routes (/trajetorias/[slug]) need their params to build the other locale's URL.
  const params = useParams<Record<string, string>>();
  const href = { pathname, params } as Parameters<typeof getPathname>[0]["href"];
  const other = routing.locales.find((candidate) => candidate !== locale) ?? routing.defaultLocale;

  return (
    <Link href={href} locale={other} hrefLang={other} aria-label={`${t("LANGUAGE")}: ${t("SWITCH_TO")}`} className={styles.link}>
      {other.toUpperCase()}
    </Link>
  );
}
