"use client";

import { useEffect, useRef, useState } from "react";

import { useTranslations } from "next-intl";

import { Link, usePathname } from "@/i18n/navigation";
import { AtlasMark } from "@/shared/components/AtlasMark";

import { CONTENT_ID, menuItems } from "../../constants/menuConfig";
import { LanguageSwitcher } from "../LanguageSwitcher";
import { MenuIcon } from "./MenuIcon";
import { styles } from "./styles/index.styles";

const NAV_ID = "menu-principal";

/**
 * Header from the deck's screens: the Atlas mark and wordmark on the left, the MVP screens in the middle, language on the right.
 * Below `xl` (1280 px, where the six screens no longer fit beside the brand) the screens fold into a "Menu" button that drops them in a list over the page.
 */
export function TopBar() {
  const t = useTranslations();
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [openedAt, setOpenedAt] = useState(pathname);
  const headerRef = useRef<HTMLElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  // Any navigation (a menu link, the brand, the browser's back button) closes the menu.
  if (openedAt !== pathname) {
    setOpenedAt(pathname);
    setOpen(false);
  }

  useEffect(() => {
    if (!open) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      setOpen(false);
      buttonRef.current?.focus();
    };
    const onPointerDown = (event: PointerEvent) => {
      if (!headerRef.current?.contains(event.target as Node)) setOpen(false);
    };
    document.addEventListener("keydown", onKeyDown);
    document.addEventListener("pointerdown", onPointerDown);
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.removeEventListener("pointerdown", onPointerDown);
    };
  }, [open]);

  return (
    <header ref={headerRef} className={styles.header}>
      <a href={`#${CONTENT_ID}`} className={styles.skip}>
        {t("NAV.SKIP_TO_CONTENT")}
      </a>
      {/* Named by its visible text (no aria-label), so voice control users can say what they see. */}
      <Link href="/" className={styles.brand}>
        <AtlasMark className={styles.mark} />
        <span className={styles.wordmark}>
          <span className={styles.name}>{t("BRAND.NAME")}</span>{" "}
          <span className={styles.tagline}>{t("BRAND.TAGLINE")}</span>
        </span>
      </Link>
      <nav id={NAV_ID} aria-label={t("NAV.LABEL")} className={open ? styles.navOpen : styles.nav}>
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
      <div className={styles.actions}>
        <LanguageSwitcher />
        <button
          ref={buttonRef}
          type="button"
          aria-expanded={open}
          aria-controls={NAV_ID}
          onClick={() => setOpen((current) => !current)}
          className={styles.menuButton}
        >
          <MenuIcon open={open} className={styles.menuIcon} />
          <span className={styles.menuLabel}>{t("NAV.MENU")}</span>
        </button>
      </div>
    </header>
  );
}
