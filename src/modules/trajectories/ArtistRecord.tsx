import {
  Accordion,
  Button,
  Eyebrow,
  EventIcon,
  Portrait,
  ReliabilityTag,
  Toggletip,
} from "@alishenriques/atlas-design-system";
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

/**
 * An artist's record: who they were beside their trajectory on the map, then
 * the trajectory, works, exhibitions and publications as sections that fold.
 */
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
  // Each status opens what it means on click, so the legend no longer needs a block of its own.
  const documented = (align?: "end") => (
    <Toggletip trigger={<ReliabilityTag level="documented" label={t("DOCUMENTED")} />} align={align}>
      {t("SOURCE_COLLECTION")}
    </Toggletip>
  );
  const inferred = (align?: "end") => (
    <Toggletip trigger={<ReliabilityTag level="inferred" label={tStop("INFERRED")} />} align={align}>
      {t("SOURCE_TRAJECTORY")}
    </Toggletip>
  );
  const none = <p className={styles.muted}>{t("NONE")}</p>;

  return (
    <main className={styles.record}>
      {data.meta.source === "demo" && <DemoNotice />}

      <Link href="/trajetorias" className={styles.back}>
        {t("BACK")}
      </Link>

      <div className={styles.top}>
        <section className={styles.profile} aria-labelledby="artist-name">
          <div className={styles.identity}>
            <Portrait
              src={artist.photo?.url}
              label={artist.photo ? artist.name : t("NO_PHOTO")}
              caption={artist.photo?.credit ? t("PHOTO_CREDIT", { credit: artist.photo.credit }) : null}
              className={styles.portrait}
            />
            <div className={styles.naming}>
              <Eyebrow>{t("EYEBROW")}</Eyebrow>
              <h1 id="artist-name" className={styles.name}>
                {artist.name}
              </h1>
            </div>
          </div>

          <dl className={styles.life}>
            <div className={styles.lifeItem}>
              <dt className={styles.lifeLabel}>
                <EventIcon name="birth" size={28} className={styles.lifeIcon} />
                {t("BORN")}
              </dt>
              <dd>{born ?? unknown}</dd>
            </div>
            <div className={styles.lifeItem}>
              <dt className={styles.lifeLabel}>
                <EventIcon name="death" size={28} className={styles.lifeIcon} />
                {t("DIED")}
              </dt>
              <dd>{died ?? unknown}</dd>
            </div>
          </dl>

          <div className={styles.actions}>
            <Button asChild>
              <Link href={{ pathname: "/rede", query: { artista: artist.slug } }}>{t("OPEN_NETWORK")}</Link>
            </Button>
            <Button asChild variant="ghost">
              <Link href={{ pathname: "/ia-relacional", query: { artista: artist.slug } }}>{t("OPEN_RESEARCH")}</Link>
            </Button>
          </div>
        </section>

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
          className={styles.map}
        />
      </div>

      <section className={styles.sources} aria-labelledby="record-sources">
        <h2 id="record-sources" className={styles.sourcesLabel}>
          {t("SOURCES")}
        </h2>
        {documented()}
        {inferred()}
      </section>

      <div className={styles.sections}>
        <Accordion title={t("TRAJECTORY")} count={trajectory.stops.length} status={inferred("end")} defaultOpen>
          <TrajectoryStops trajectory={trajectory} tag={false} />
        </Accordion>

        <Accordion title={t("WORKS_TITLE")} count={artist.works.length} status={documented("end")}>
          {artist.works.length === 0 ? (
            none
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
        </Accordion>

        <Accordion title={t("EXHIBITIONS_TITLE")} count={artist.exhibitions.length} status={documented("end")}>
          {artist.exhibitions.length === 0 ? (
            none
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
        </Accordion>

        <Accordion title={t("PUBLICATIONS_TITLE")} count={artist.publications.length} status={documented("end")}>
          {artist.publications.length === 0 ? (
            none
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
        </Accordion>
      </div>
    </main>
  );
}
