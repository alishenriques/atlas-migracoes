import { Suspense } from "react";

import { Eyebrow, Panel } from "@alishenriques/atlas-design-system";
import { useTranslations } from "next-intl";

import { Link } from "@/i18n/navigation";

import { HeroSlider } from "./components/HeroSlider";
import { HomeCounters, HomeCountersSkeleton } from "./components/HomeCounters";
import { HomeFooter } from "./components/HomeFooter";
import { SCREENS } from "./constants/screens";
import { styles } from "./styles/index.styles";

const IMPACTS = ["RESEARCH", "COLLECTION"] as const;
const IMPACT_ITEMS = ["1", "2", "3"] as const;
const METHOD = ["READING", "RELATION", "RELIABILITY"] as const;

/**
 * The home page: the slider that presents the project, then why the Atlas is needed, what it changes for research
 * and for the collection, the screens it offers and its method, with the collection's counters from the API, and the
 * developer's credit at the foot.
 */
export function Home() {
  const t = useTranslations("HOME");
  const tNav = useTranslations("NAV");
  const tAbout = useTranslations("ABOUT");

  return (
    <>
      <main className={styles.page}>
        <HeroSlider />

        <div className={styles.sections}>
          <section aria-labelledby="home-acervo" className={styles.countersSection}>
            <Panel>
              <div className={styles.counters}>
                <h2 id="home-acervo" className={styles.label}>
                  {t("COUNTERS.TITLE")}
                </h2>
                <Suspense fallback={<HomeCountersSkeleton />}>
                  <HomeCounters />
                </Suspense>
              </div>
            </Panel>
          </section>

          <section aria-labelledby="home-necessidade" className={styles.need}>
            <div className={styles.needIntro}>
              <Eyebrow>{t("NEED.EYEBROW")}</Eyebrow>
              <h2 id="home-necessidade" className={styles.title}>
                {t("NEED.TITLE")}
              </h2>
            </div>
            <div className={styles.needBody}>
              <p className={styles.lead}>{t("NEED.BODY")}</p>
              <blockquote className={styles.question}>
                <p className={styles.label}>{tAbout("PROJECT.QUESTION_LABEL")}</p>
                <p className={styles.questionText}>{tAbout("PROJECT.QUESTION")}</p>
              </blockquote>
            </div>
          </section>

          <section aria-labelledby="home-impactos" className={styles.section}>
            <div className={styles.heading}>
              <Eyebrow>{t("IMPACTS.EYEBROW")}</Eyebrow>
              <h2 id="home-impactos" className={styles.title}>
                {t("IMPACTS.TITLE")}
              </h2>
            </div>
            <div className={styles.impacts}>
              {IMPACTS.map((impact) => (
                <article key={impact} className={styles.impact}>
                  <h3 className={styles.impactTitle}>{t(`IMPACTS.${impact}.TITLE`)}</h3>
                  <ul className={styles.impactList}>
                    {IMPACT_ITEMS.map((item) => (
                      <li key={item} className={styles.impactItem}>
                        {t(`IMPACTS.${impact}.ITEMS.${item}`)}
                      </li>
                    ))}
                  </ul>
                </article>
              ))}
            </div>
          </section>

          <section aria-labelledby="home-telas" className={styles.section}>
            <div className={styles.heading}>
              <Eyebrow>{t("SCREENS.EYEBROW")}</Eyebrow>
              <h2 id="home-telas" className={styles.title}>
                {t("SCREENS.TITLE")}
              </h2>
            </div>
            <ol className={styles.screens}>
              {SCREENS.map(({ href, labelKey }, index) => (
                <li key={href}>
                  <Link href={href} className={styles.screen}>
                    <span className={styles.screenNumber} aria-hidden="true">
                      {String(index + 1).padStart(2, "0")}
                    </span>
                    <span className={styles.screenName}>{tNav(labelKey)}</span>
                    <span className={styles.screenText}>{t(`SCREENS.${labelKey}`)}</span>
                  </Link>
                </li>
              ))}
            </ol>
          </section>

          <section aria-labelledby="home-metodo" className={styles.section}>
            <div className={styles.heading}>
              <Eyebrow>{tAbout("METHOD.TITLE")}</Eyebrow>
              <h2 id="home-metodo" className={styles.title}>
                {t("METHOD.TITLE")}
              </h2>
            </div>
            <ol className={styles.method}>
              {METHOD.map((step) => (
                <li key={step} className={styles.step}>
                  <h3 className={styles.stepTitle}>{tAbout(`METHOD.${step}`)}</h3>
                  <p className={styles.muted}>{tAbout(`METHOD.${step}_BODY`)}</p>
                </li>
              ))}
            </ol>
            <Link href="/sobre" className={styles.more}>
              {t("METHOD.MORE")}
            </Link>
          </section>
        </div>
      </main>
      {/* Outside main, so it is the page's contentinfo landmark. */}
      <HomeFooter />
    </>
  );
}
