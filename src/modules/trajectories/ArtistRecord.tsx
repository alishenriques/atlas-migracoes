import { Accordion, ReliabilityTag, Toggletip } from "@alishenriques/atlas-design-system";
import { notFound } from "next/navigation";
import { getLocale, getTranslations } from "next-intl/server";

import { formatFuzzyDate } from "@/lib/dates";
import { connectionsOf } from "@/lib/network";
import type { ArtistRecordResponse, FuzzyDate, NetworkData, Research } from "@/lib/schemas";
import { buildTrajectory, placeName } from "@/lib/trajectory";
import { institutionsOf } from "@/modules/trajectories/utils/profile";
import { DemoNotice } from "@/shared/components/DemoNotice";
import { TrajectoryStops } from "@/shared/components/TrajectoryStops";

import { ConnectionsCard } from "./components/ConnectionsCard";
import { InstitutionsCard } from "./components/InstitutionsCard";
import { ProfileCard } from "./components/ProfileCard";
import { RecordMap } from "./components/RecordMap";
import { styles } from "./styles/index.styles";

const joined = (...parts: (string | null | undefined)[]) => parts.filter(Boolean).join(" · ");

/**
 * An artist's record in three columns: who they were (with what the Relational
 * AI found in open sources), their map with the trajectory, works, exhibitions
 * and publications folded below it, and beside them a small view of their
 * network over the institutions that showed them.
 */
export async function ArtistRecord({
  data,
  research = null,
  network = null,
}: {
  data: ArtistRecordResponse;
  research?: Research | null;
  /** The whole base's network, for the artist's connections; null leaves the block without a drawing. */
  network?: NetworkData | null;
}) {
  const { artist } = data;
  if (!artist) notFound();

  const [t, tStop, locale] = await Promise.all([
    getTranslations("TRAJECTORIES"),
    getTranslations("TRAJECTORY"),
    getLocale(),
  ]);
  const unknown = tStop("UNKNOWN_DATE");
  const date = (value: FuzzyDate) => formatFuzzyDate(value, locale, unknown);
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

      <div className={styles.top}>
        <div className={styles.profile}>
          <ProfileCard artist={artist} research={research} />
        </div>

        <div className={styles.center}>
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

          <section className={styles.sources} aria-labelledby="record-sources">
            <h2 id="record-sources" className={styles.sourcesLabel}>
              {t("SOURCES")}
            </h2>
            {documented()}
            {inferred()}
          </section>

          <div className={styles.sections}>
            <Accordion title={t("TRAJECTORY")} count={trajectory.stops.length} status={inferred("end")}>
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
        </div>

        <div className={styles.aside}>
          <ConnectionsCard
            slug={artist.slug}
            name={artist.name}
            connections={network ? connectionsOf(network, artist.slug) : null}
          />
          <InstitutionsCard institutions={institutionsOf(artist)} />
        </div>
      </div>
    </main>
  );
}
