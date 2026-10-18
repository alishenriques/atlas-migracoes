import { Eyebrow, Panel, ReliabilityTag } from "@alishenriques/atlas-design-system";
import { notFound } from "next/navigation";
import { getLocale, getTranslations } from "next-intl/server";

import { Link } from "@/i18n/navigation";
import { formatFuzzyDate } from "@/lib/dates";
import type { ArtistRecordResponse, FuzzyDate } from "@/lib/schemas";
import { buildTrajectory, placeName } from "@/lib/trajectory";
import { DemoNotice } from "@/shared/components/DemoNotice";
import { TrajectoryStops } from "@/shared/components/TrajectoryStops";

import { RecordMap } from "./components/RecordMap";
import { styles } from "./styles/index.styles";
import { lifeEvent } from "./utils/life";

const joined = (...parts: (string | null | undefined)[]) => parts.filter(Boolean).join(" · ");

/** An artist's record: trajectory on the map, works, exhibitions, publications and sources. */
export async function ArtistRecord({ data }: { data: ArtistRecordResponse }) {
  const { artist } = data;
  if (!artist) notFound();

  const [t, tStop, locale] = await Promise.all([
    getTranslations("TRAJECTORIES"),
    getTranslations("TRAJECTORY"),
    getLocale(),
  ]);
  const unknown = tStop("UNKNOWN_DATE");
  const date = (value: FuzzyDate) => formatFuzzyDate(value, locale, unknown);
  const born = lifeEvent(artist.birthPlace, artist.birthDate, locale, unknown);
  const died = lifeEvent(artist.deathPlace, artist.deathDate, locale, unknown);
  const trajectory = buildTrajectory(artist);
  const documented = <ReliabilityTag level="documented" label={t("DOCUMENTED")} />;

  return (
    <main className={styles.record}>
      {data.meta.source === "demo" && <DemoNotice />}

      <Link href="/trajetorias" className={styles.back}>
        {t("BACK")}
      </Link>

      <header className={styles.header}>
        <Eyebrow>{t("EYEBROW")}</Eyebrow>
        <h1 className={styles.title}>{artist.name}</h1>
        <dl className={styles.life}>
          <div>
            <dt className={styles.lifeLabel}>{t("BORN")}</dt>
            <dd>{born ?? unknown}</dd>
          </div>
          <div>
            <dt className={styles.lifeLabel}>{t("DIED")}</dt>
            <dd>{died ?? unknown}</dd>
          </div>
        </dl>
        <div className={styles.links}>
          <Link href={{ pathname: "/rede", query: { artista: artist.slug } }} className={styles.back}>
            {t("OPEN_NETWORK")}
          </Link>
          <Link href={{ pathname: "/ia-relacional", query: { artista: artist.slug } }} className={styles.back}>
            {t("OPEN_RESEARCH")}
          </Link>
        </div>
      </header>

      <RecordMap
        artist={{
          slug: artist.slug,
          name: artist.name,
          birthPlace: artist.birthPlace,
          birthDate: artist.birthDate,
          deathPlace: artist.deathPlace,
          deathDate: artist.deathDate,
          exhibitions: artist.exhibitions.map(({ id, title, startDate, place }) => ({ id, title, startDate, place })),
        }}
        label={t("MAP_LABEL", { name: artist.name })}
      />

      <div className={styles.columns}>
        <Panel title={t("TRAJECTORY")} className={styles.aside}>
          <TrajectoryStops trajectory={trajectory} />
        </Panel>

        <div className={styles.sections}>
          <Panel title={t("WORKS", { count: artist.works.length })} action={documented}>
            {artist.works.length === 0 ? (
              <p className={styles.muted}>{t("NONE")}</p>
            ) : (
              <ul className={styles.items}>
                {artist.works.map((work) => (
                  <li key={work.id} className={styles.item}>
                    <span className={styles.itemTitle}>{work.title}</span>
                    <span className={styles.itemMeta}>{joined(date(work.date), work.technique, work.dimensions)}</span>
                    <span className={styles.itemMeta}>
                      {joined(
                        t("ACCESSION", { id: work.id }),
                        work.acquisition,
                        work.acquisitionDate.year !== null ? date(work.acquisitionDate) : null,
                      )}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </Panel>

          <Panel title={t("EXHIBITIONS", { count: artist.exhibitions.length })} action={documented}>
            {artist.exhibitions.length === 0 ? (
              <p className={styles.muted}>{t("NONE")}</p>
            ) : (
              <ul className={styles.items}>
                {artist.exhibitions.map((exhibition) => (
                  <li key={exhibition.id} className={styles.item}>
                    <span className={styles.itemTitle}>{exhibition.title}</span>
                    <span className={styles.itemMeta}>
                      {joined(
                        exhibition.endDate.year !== null && exhibition.endDate.raw !== exhibition.startDate.raw
                          ? `${date(exhibition.startDate)} – ${date(exhibition.endDate)}`
                          : date(exhibition.startDate),
                        exhibition.institution,
                        exhibition.venue,
                        exhibition.place ? placeName(exhibition.place) : null,
                      )}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </Panel>

          <Panel title={t("PUBLICATIONS", { count: artist.publications.length })} action={documented}>
            {artist.publications.length === 0 ? (
              <p className={styles.muted}>{t("NONE")}</p>
            ) : (
              <ul className={styles.items}>
                {artist.publications.map((publication) => (
                  <li key={publication.id} className={styles.item}>
                    <span className={styles.itemTitle}>{publication.title}</span>
                    <span className={styles.itemMeta}>
                      {joined(
                        publication.authors,
                        publication.periodical,
                        publication.city,
                        publication.publisher,
                        date(publication.date),
                        publication.category,
                      )}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </Panel>

          <Panel title={t("SOURCES")}>
            <ul className={styles.sources}>
              <li className={styles.source}>
                {documented}
                <span>{t("SOURCE_COLLECTION")}</span>
              </li>
              <li className={styles.source}>
                <ReliabilityTag level="inferred" label={tStop("INFERRED")} />
                <span>{t("SOURCE_TRAJECTORY")}</span>
              </li>
            </ul>
          </Panel>
        </div>
      </div>
    </main>
  );
}
