import type { ReactNode } from "react";

import { Button, EventIcon, FactIcon, Portrait, Tabs, Toggletip, type FactIconName } from "@alishenriques/atlas-design-system";
import { useLocale, useTranslations } from "next-intl";

import { Link } from "@/i18n/navigation";
import type { ArtistRecord, Research } from "@/lib/schemas";
import { lifeEvent, lifeSpan } from "@/modules/trajectories/utils/life";
import { activityYears, artistProfile, institutionsOf, listOf, type SourcedFact } from "@/modules/trajectories/utils/profile";

import { styles } from "./styles/index.styles";

const INSTITUTIONS_SHOWN = 4;

export type ProfileCardProps = {
  artist: ArtistRecord;
  /** The artist's stored Relational AI research; null when it could not be loaded. */
  research: Research | null;
};

/**
 * Who the artist was, beside their map: photo, name and years, what they did,
 * a short bio from the Relational AI, and the facts under an "About" tab. Only
 * facts the collection or the open sources hold are shown; nothing is filled in.
 */
export function ProfileCard({ artist, research }: ProfileCardProps) {
  const t = useTranslations("TRAJECTORIES");
  const tStop = useTranslations("TRAJECTORY");
  const locale = useLocale();
  const unknown = tStop("UNKNOWN_DATE");
  const profile = artistProfile(research);
  const years = lifeSpan(artist.birthDate, artist.deathDate, locale, unknown);
  const activity = activityYears(artist);
  const institutions = institutionsOf(artist);
  const list = (values: string[]) => listOf(values, locale);
  const capitalized = (text: string) => text.charAt(0).toLocaleUpperCase(locale) + text.slice(1);

  // A fact read in the open sources says where, so the reader can tell it from the collection's own.
  const sourced = (fact: SourcedFact) => (
    <>
      {capitalized(list(fact.values))}
      <span className={styles.source}>
        {fact.sources.map((source) => (
          <a key={source.url} href={source.url} target="_blank" rel="noreferrer" className={styles.sourceLink}>
            {source.title}
          </a>
        ))}
      </span>
    </>
  );

  const facts: { icon: ReactNode; label: string; value: ReactNode }[] = [
    { icon: <EventIcon name="birth" size={22} />, label: t("BORN"), value: lifeEvent(artist.birthPlace, artist.birthDate, locale, unknown) ?? unknown },
    { icon: <EventIcon name="death" size={22} />, label: t("DIED"), value: lifeEvent(artist.deathPlace, artist.deathDate, locale, unknown) ?? unknown },
    ...(
      [
        ["nationality", t("NATIONALITY"), profile.nationality],
        ["occupation", t("OCCUPATION"), profile.occupation],
        ["movement", t("MOVEMENT"), profile.movement],
        ["education", t("EDUCATION"), profile.education],
        ["group", t("GROUPS"), profile.group],
      ] as const
    ).flatMap(([icon, label, fact]: readonly [FactIconName, string, SourcedFact | null]) =>
      fact ? [{ icon: <FactIcon name={icon} size={22} />, label, value: sourced(fact) }] : [],
    ),
    ...(activity
      ? [
          {
            icon: <FactIcon name="period" size={22} />,
            label: t("ACTIVITY"),
            value: activity.from === activity.to ? String(activity.from) : `${activity.from} – ${activity.to}`,
          },
        ]
      : []),
    ...(institutions.length
      ? [
          {
            icon: <FactIcon name="institution" size={22} />,
            label: t("INSTITUTIONS"),
            // The first few, in order of their first exhibition; the full list is under Exposições.
            value: [
              ...institutions.slice(0, INSTITUTIONS_SHOWN),
              ...(institutions.length > INSTITUTIONS_SHOWN
                ? [t("MORE_INSTITUTIONS", { count: institutions.length - INSTITUTIONS_SHOWN })]
                : []),
            ].join(" · "),
          },
        ]
      : []),
  ];

  const retrieved = profile.bio
    ? new Intl.DateTimeFormat(locale, { dateStyle: "long", timeZone: "America/Sao_Paulo" }).format(new Date(profile.bio.retrievedAt))
    : null;

  return (
    <section className={styles.card} aria-labelledby="artist-name">
      <Link href="/trajetorias" className={styles.back}>
        <span aria-hidden="true">←</span> {t("BACK")}
      </Link>

      <div className={styles.identity}>
        <Portrait
          src={artist.photo?.url}
          label={artist.photo ? artist.name : t("NO_PHOTO")}
          caption={artist.photo?.credit ? t("PHOTO_CREDIT", { credit: artist.photo.credit }) : null}
          className={styles.portrait}
        />
        <div className={styles.naming}>
          <h1 id="artist-name" className={styles.name}>
            {artist.name}
          </h1>
          {years && <p className={styles.years}>({years.replace("–", " – ")})</p>}
          {profile.occupation && <p className={styles.occupation}>{capitalized(list(profile.occupation.values))}.</p>}
        </div>
      </div>

      {profile.bio && (
        <div className={styles.bio}>
          <p>{profile.bio.text}</p>
          <Toggletip trigger={<span className={styles.bioSource}>{t("BIO_SOURCE")}</span>}>
            {t("BIO_SOURCE_DETAIL", { model: profile.bio.model ?? "Gemini", date: retrieved ?? "" })}{" "}
            <Link href={{ pathname: "/ia-relacional", query: { artista: artist.slug } }} className={styles.bioLink}>
              {t("BIO_SOURCE_LINK")}
            </Link>
          </Toggletip>
        </div>
      )}

      <Tabs
        label={t("PROFILE_TABS", { name: artist.name })}
        tabs={[
          {
            id: "sobre",
            label: t("ABOUT"),
            content: (
              <dl className={styles.facts}>
                {facts.map((fact) => (
                  <div key={fact.label} className={styles.fact}>
                    <dt className={styles.factLabel}>
                      <span className={styles.factIcon}>{fact.icon}</span>
                      {fact.label}
                    </dt>
                    <dd className={styles.factValue}>{fact.value}</dd>
                  </div>
                ))}
              </dl>
            ),
          },
        ]}
      />

      <div className={styles.actions}>
        <Button asChild>
          <Link href={{ pathname: "/rede", query: { artista: artist.slug } }}>{t("OPEN_NETWORK")}</Link>
        </Button>
        <Button asChild variant="ghost">
          <Link href={{ pathname: "/ia-relacional", query: { artista: artist.slug } }}>{t("OPEN_RESEARCH")}</Link>
        </Button>
      </div>
    </section>
  );
}
