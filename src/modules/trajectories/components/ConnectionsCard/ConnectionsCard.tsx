import { Legend, Toggletip, type EntityTone } from "@alishenriques/atlas-design-system";
import { useTranslations } from "next-intl";

import { Link } from "@/i18n/navigation";
import { CONNECTION_KINDS, type Connection, type ConnectionKind } from "@/lib/network";
import {
  CENTER_RADIUS,
  CONNECTIONS_CENTER,
  CONNECTIONS_VIEW,
  nameLines,
  ringSlots,
} from "@/modules/trajectories/utils/connections";

import { styles } from "./styles/index.styles";

/** Each kind of connection takes the colour of what it links to in the Rede Relacional. */
const TONE: Record<ConnectionKind, EntityTone> = {
  joint_exhibition: "artist",
  institution: "institution",
  place: "place",
};

const LABEL_KEY = {
  joint_exhibition: "RELATION_JOINT_EXHIBITION",
  institution: "RELATION_INSTITUTION",
  place: "RELATION_PLACE",
} as const;

export type ConnectionsCardProps = {
  slug: string;
  name: string;
  /** The artist's closest connections; null when the network could not be loaded. */
  connections: Connection[] | null;
};

/**
 * A small view of the artist's network on the record: the artist in the middle
 * and their closest connections around them, coloured by kind of relation, with
 * a link to the full network in the Rede Relacional, opened on this artist.
 */
export function ConnectionsCard({ slug, name, connections }: ConnectionsCardProps) {
  const t = useTranslations("TRAJECTORIES");
  const slots = ringSlots((connections ?? []).map((connection) => connection.label));
  const lines = nameLines(name);

  return (
    <section className={styles.card} aria-labelledby="record-connections">
      <div className={styles.header}>
        <h2 id="record-connections" className={styles.title}>
          {t("CONNECTIONS")}
        </h2>
        <Toggletip
          // The toggletip draws its own "i"; the trigger only names it for assistive technology.
          trigger={<span className="sr-only">{t("CONNECTIONS_ABOUT")}</span>}
        >
          <span className={styles.infoText}>{t("CONNECTIONS_INFO")}</span>
        </Toggletip>
      </div>

      <p className={styles.legendLabel}>{t("RELATION_TYPES")}</p>
      <Legend
        className={styles.legend}
        label={t("RELATION_TYPES")}
        items={CONNECTION_KINDS.map((kind) => ({ tone: TONE[kind], label: t(LABEL_KEY[kind]) }))}
      />

      {connections === null || connections.length === 0 ? (
        <p className={styles.empty}>{t(connections === null ? "CONNECTIONS_UNAVAILABLE" : "NO_CONNECTIONS")}</p>
      ) : (
        <div className={styles.figure}>
          {/* The drawing repeats the list below it, which is what assistive technology reads. */}
          <svg
            className={styles.svg}
            viewBox={`0 0 ${CONNECTIONS_VIEW.width} ${CONNECTIONS_VIEW.height}`}
            preserveAspectRatio="xMidYMid meet"
            aria-hidden="true"
          >
            {connections.map((connection, index) => {
              const slot = slots[index]!;
              const colour = `var(--atlas-color-entity-${TONE[connection.kind]})`;
              return (
                <g key={connection.id}>
                  {/* The whole name on hover, for labels cut short. */}
                  <title>{connection.label}</title>
                  <line
                    className={styles.line}
                    x1={slot.from.x}
                    y1={slot.from.y}
                    x2={slot.x}
                    y2={slot.y}
                    stroke={colour}
                    strokeOpacity={0.7}
                    strokeWidth={1}
                    // Birth and death are drawn dashed, as in the Rede Relacional.
                    strokeDasharray={connection.kind === "place" ? "3 3" : undefined}
                  />
                  <circle cx={slot.x} cy={slot.y} r={4.5} fill={colour} />
                  <text className={styles.label} x={slot.label.x} y={slot.label.y} textAnchor={slot.label.anchor} fontSize={10}>
                    {slot.label.text}
                  </text>
                </g>
              );
            })}
            <circle
              className={styles.center}
              cx={CONNECTIONS_CENTER.x}
              cy={CONNECTIONS_CENTER.y}
              r={CENTER_RADIUS}
              strokeWidth={1.5}
            />
            <text className={styles.name} x={CONNECTIONS_CENTER.x} textAnchor="middle" fontSize={14}>
              {lines.map((line, index) => (
                <tspan
                  key={line}
                  x={CONNECTIONS_CENTER.x}
                  y={CONNECTIONS_CENTER.y + 5 + (index - (lines.length - 1) / 2) * 16}
                >
                  {line}
                </tspan>
              ))}
            </text>
          </svg>
          <ul className="sr-only">
            {connections.map((connection) => (
              <li key={connection.id}>{`${t(LABEL_KEY[connection.kind])}: ${connection.label}`}</li>
            ))}
          </ul>
        </div>
      )}

      <Link href={{ pathname: "/rede", query: { artista: slug } }} className={styles.more}>
        {t("SEE_NETWORK")}
        <span aria-hidden="true">→</span>
      </Link>
    </section>
  );
}
