"use client";

import { useMemo, useState, type ReactNode } from "react";

import { Button, Legend, Panel, ReliabilityTag, SelectField, YearRange } from "@alishenriques/atlas-design-system";
import { useLocale, useTranslations } from "next-intl";

import { Link } from "@/i18n/navigation";
import { formatFuzzyDate } from "@/lib/dates";
import {
  countByKind,
  egoGraph,
  neighborsOf,
  networkExtent,
  NODE_KINDS,
  nodeIds,
  overviewGraph,
  type NodeKind,
} from "@/lib/network";
import { columnsLayout, radialLayout, type ColumnKey } from "@/lib/networkLayout";
import type { NetworkData } from "@/lib/schemas";
import type { Period } from "@/lib/trajectory";

import { NetworkGraph } from "../NetworkGraph";
import { styles } from "./styles/index.styles";

export type NetworkExplorerProps = {
  data: NetworkData;
  /** Artist to center on at first; an unknown slug falls back to the overview. */
  initialSlug: string | null;
  /** The screen's presentation, at the top of the left column. */
  intro?: ReactNode;
  /** The source credit, at the foot of the left column. */
  footer?: ReactNode;
};

const KEY = (kind: NodeKind) => kind.toUpperCase() as Uppercase<NodeKind>;

/**
 * The interactive part of the Rede Relacional: center and period controls, legend, graph and node detail.
 * On desktop it fills the screen in two columns, the presentation over the controls on the left and the
 * graph on the rest, with no page scroll; on smaller screens they stack.
 */
export function NetworkExplorer({ data, initialSlug, intro, footer }: NetworkExplorerProps) {
  const t = useTranslations("NETWORK");
  const tStop = useTranslations("TRAJECTORY");
  const locale = useLocale();

  const extent = useMemo(() => networkExtent(data), [data]);
  const artists = useMemo(
    () => [...data.artists].sort((a, b) => a.name.localeCompare(b.name, locale)),
    [data.artists, locale],
  );
  const [center, setCenter] = useState(() =>
    initialSlug && data.artists.some((artist) => artist.slug === initialSlug) ? initialSlug : "",
  );
  const [period, setPeriod] = useState<Period>(extent);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const fullPeriod = period[0] === extent[0] && period[1] === extent[1];
  const centerId = center ? nodeIds.artist(center) : null;
  const graph = useMemo(() => {
    const filter = { period, includeUndated: fullPeriod };
    return (center && egoGraph(data, center, filter)) || overviewGraph(data, filter);
  }, [data, center, period, fullPeriod]);
  // The ego network reads outward from the artist; the overview reads left to right, origin to venue.
  const layout = useMemo(
    () => (centerId ? radialLayout(graph, centerId) : columnsLayout(graph)),
    [graph, centerId],
  );
  const counts = countByKind(graph);
  const selected = graph.nodes.find((node) => node.id === selectedId) ?? null;
  const neighbors = selected ? neighborsOf(graph, selected.id) : [];
  const centerName = artists.find((artist) => artist.slug === center)?.name;

  const changeCenter = (slug: string) => {
    setCenter(slug);
    setSelectedId(slug ? nodeIds.artist(slug) : null);
  };
  const clear = () => {
    setCenter("");
    setPeriod(extent);
    setSelectedId(null);
  };

  return (
    <section className={styles.root}>
      <div className={styles.side}>
      {intro && <div className={styles.intro}>{intro}</div>}
      <Panel
        title={t("FILTERS")}
        className={styles.panel}
        action={
          center || !fullPeriod || selected ? (
            <button type="button" className={styles.clear} onClick={clear}>
              {t("CLEAR")}
            </button>
          ) : undefined
        }
      >
        <SelectField
          label={t("CENTER")}
          value={center}
          onChange={changeCenter}
          options={[
            { value: "", label: t("OVERVIEW") },
            ...artists.map((artist) => ({ value: artist.slug, label: artist.name })),
          ]}
        />
        {/* A base dated in one year only has no period to narrow. */}
        {extent[0] < extent[1] && (
          <YearRange
            label={t("PERIOD")}
            fromLabel={t("PERIOD_FROM")}
            toLabel={t("PERIOD_TO")}
            min={extent[0]}
            max={extent[1]}
            value={period}
            onChange={setPeriod}
          />
        )}
        {/* The artist at the center, named before the note that reads their network. */}
        {centerName && <h3 className={styles.centerName}>{centerName}</h3>}
        <p className={styles.note}>
          {centerName ? t("EGO_NOTE", { name: centerName }) : t("OVERVIEW_NOTE")} {t("LINES_NOTE")} {t("UNDATED_NOTE")}
        </p>
        <Legend
          label={t("LEGEND")}
          items={NODE_KINDS.filter((kind) => counts[kind] > 0).map((kind) => ({
            tone: kind,
            label: t(`KINDS.${KEY(kind)}`),
            count: counts[kind],
          }))}
        />
        {center && (
          <Button asChild className={styles.centerRecord}>
            <Link href={{ pathname: "/trajetorias/[slug]", params: { slug: center } }}>{t("CENTER_RECORD")}</Link>
          </Button>
        )}

        <div className={styles.detail} aria-live="polite">
          {selected ? (
            <>
              <div className={styles.detailHeader}>
                <span className={styles.detailKind}>{t(`KIND.${KEY(selected.kind)}`)}</span>
                <ReliabilityTag level="documented" label={t("DOCUMENTED")} />
              </div>
              <p className={styles.detailTitle}>{selected.label}</p>
              {selected.date && (
                <p className={styles.detailMeta}>{formatFuzzyDate(selected.date, locale, tStop("UNKNOWN_DATE"))}</p>
              )}
              {selected.slug && (
                <div className={styles.actions}>
                  {selected.slug !== center && (
                    <button type="button" className={styles.action} onClick={() => changeCenter(selected.slug as string)}>
                      {t("FOCUS")}
                    </button>
                  )}
                  <Link
                    href={{ pathname: "/trajetorias/[slug]", params: { slug: selected.slug } }}
                    className={styles.action}
                  >
                    {t("OPEN_RECORD")}
                  </Link>
                </div>
              )}
              <Neighbors
                title={t("LINKED", { count: neighbors.length })}
                nodes={neighbors}
                onSelect={setSelectedId}
                kindLabel={(kind) => t(`KIND.${KEY(kind)}`)}
              />
            </>
          ) : (
            <p className={styles.note}>{t("SELECT_HINT")}</p>
          )}
        </div>
      </Panel>
      {footer && <div className={styles.footer}>{footer}</div>}
      </div>

      <div className={styles.graph}>
        {graph.edges.length === 0 ? (
          <p className={styles.empty}>{t("EMPTY")}</p>
        ) : (
          <NetworkGraph
            layout={layout}
            selectedId={selectedId}
            centerId={centerId}
            onSelect={setSelectedId}
            label={t("GRAPH_LABEL", { count: graph.nodes.length })}
            kindLabel={(kind) => t(`KIND.${KEY(kind)}`)}
            columnLabel={(key) => t(`COLUMNS.${key.toUpperCase() as Uppercase<ColumnKey>}`)}
            zoomLabels={{ in: t("ZOOM_IN"), out: t("ZOOM_OUT"), fit: t("ZOOM_FIT") }}
          />
        )}
      </div>
    </section>
  );
}

type NeighborsProps = {
  title: string;
  nodes: ReturnType<typeof neighborsOf>;
  onSelect: (id: string) => void;
  kindLabel: (kind: NodeKind) => string;
};

/** The selected node's links, each a button that selects the linked node. */
function Neighbors({ title, nodes, onSelect, kindLabel }: NeighborsProps) {
  return (
    <>
      <p className={styles.detailKind}>{title}</p>
      <ul className={styles.neighbors}>
        {nodes.map((node) => (
          <li key={node.id}>
            <button
              type="button"
              className={styles.neighbor}
              aria-label={`${kindLabel(node.kind)}: ${node.label}`}
              onClick={() => onSelect(node.id)}
            >
              <span aria-hidden className={styles.dot} style={{ background: `var(--atlas-color-entity-${node.kind})` }} />
              <span>{node.label}</span>
            </button>
          </li>
        ))}
      </ul>
    </>
  );
}
