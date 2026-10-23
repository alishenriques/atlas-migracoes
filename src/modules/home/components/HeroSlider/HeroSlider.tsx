"use client";

import { useState } from "react";

import { Eyebrow } from "@alishenriques/atlas-design-system";
import { useTranslations } from "next-intl";

import { Link } from "@/i18n/navigation";
import { AtlasMark } from "@/shared/components/AtlasMark";

import { AUTOPLAY_INTERVAL_MS, SLIDES } from "./constants/slides";
import { focusStyles, styles } from "./styles/index.styles";

const SLIDE_ID = "apresentacao-slide";

function Arrow({ direction }: { direction: "prev" | "next" }) {
  // A thin line with the gold arrival dot of the "Traço" icons, pointing the way it goes.
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false" className={styles.arrowIcon}>
      {direction === "prev" ? (
        <>
          <path d="M20 12H6m5-5-5 5 5 5" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          <circle cx="4" cy="12" r="1.8" className={styles.arrowDot} />
        </>
      ) : (
        <>
          <path d="M4 12h14m-5-5 5 5-5 5" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          <circle cx="20" cy="12" r="1.8" className={styles.arrowDot} />
        </>
      )}
    </svg>
  );
}

/**
 * The home page's opening: the Atlas name over an illustration of the collection in relation, and a slider that
 * walks through the project's argument (the collection, the problem, the relations, the AI), each slide leading to
 * the screen that answers it. Modelled on the home slider of Alisson's portfolio.
 *
 * Autoplay is driven by the progress line: the slide advances when its fill animation ends, so pausing (WCAG 2.2.2)
 * only freezes the animation and resuming picks up where it stopped. The line is not displayed under
 * prefers-reduced-motion, so it never ends and the slides only change by hand there. The illustration zooms into the
 * part each slide talks about.
 */
export function HeroSlider() {
  const t = useTranslations("HOME.HERO");
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const slide = SLIDES[index];
  const count = SLIDES.length;

  const go = (next: number) => setIndex((next + count) % count);

  return (
    <section className={styles.root} aria-roledescription={t("ROLE")} aria-label={t("LABEL")}>
      <div className={`${styles.illustration} ${focusStyles[slide.focus]}`} aria-hidden="true" />
      <div className={styles.shade} aria-hidden="true" />

      <div className={styles.progressTrack} aria-hidden="true">
        {/* Keyed by slide, so the countdown restarts on every change, a click included. */}
        <div
          key={index}
          data-testid="hero-progress"
          className={styles.progressFill}
          style={{
            animationDuration: `${AUTOPLAY_INTERVAL_MS}ms`,
            animationPlayState: paused ? "paused" : "running",
          }}
          onAnimationEnd={() => go(index + 1)}
        />
      </div>

      <div className={styles.content}>
        <h1 className={styles.brand}>
          <AtlasMark className={styles.mark} />
          {t("TITLE")}
        </h1>
        <Eyebrow>{t("EYEBROW")}</Eyebrow>

        {/* Announced when it changes only while paused: an autoplaying region would keep interrupting. */}
        <div
          id={SLIDE_ID}
          key={slide.key}
          role="group"
          aria-roledescription={t("SLIDE_ROLE")}
          aria-label={t("POSITION", { number: index + 1, count })}
          aria-live={paused ? "polite" : "off"}
          className={styles.slide}
        >
          <p className={styles.slideEyebrow}>{t(`SLIDES.${slide.key}.EYEBROW`)}</p>
          <h2 className={styles.headline}>
            {t.rich(`SLIDES.${slide.key}.TITLE`, {
              hl: (chunks) => <span className={styles.highlight}>{chunks}</span>,
            })}
          </h2>
          <p className={styles.body}>{t(`SLIDES.${slide.key}.BODY`)}</p>
          <Link href={slide.href} className={styles.cta}>
            {t(`SLIDES.${slide.key}.CTA`)}
            <Arrow direction="next" />
          </Link>
        </div>

        <div className={styles.controls}>
          <button
            type="button"
            className={styles.arrow}
            aria-controls={SLIDE_ID}
            aria-label={t("PREV")}
            onClick={() => go(index - 1)}
          >
            <Arrow direction="prev" />
          </button>
          <div className={styles.dots}>
            {SLIDES.map(({ key }, dot) => (
              <button
                key={key}
                type="button"
                aria-controls={SLIDE_ID}
                aria-current={dot === index ? "true" : undefined}
                aria-label={t("GOTO", { number: dot + 1, title: t(`SLIDES.${key}.EYEBROW`) })}
                className={dot === index ? styles.dotActive : styles.dot}
                onClick={() => setIndex(dot)}
              />
            ))}
          </div>
          <button
            type="button"
            className={styles.arrow}
            aria-controls={SLIDE_ID}
            aria-label={t("NEXT")}
            onClick={() => go(index + 1)}
          >
            <Arrow direction="next" />
          </button>
          <button
            type="button"
            className={styles.pause}
            aria-label={paused ? t("PLAY") : t("PAUSE")}
            onClick={() => setPaused((current) => !current)}
          >
            <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false" className={styles.pauseIcon}>
              {paused ? (
                <path d="M8 5.5v13l10.5-6.5Z" fill="currentColor" />
              ) : (
                <path d="M8 5.5v13M16 5.5v13" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" />
              )}
            </svg>
          </button>
        </div>
      </div>
    </section>
  );
}
