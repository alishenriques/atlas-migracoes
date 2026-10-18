"use client";

import { useEffect, useMemo, useRef, useState, type KeyboardEvent } from "react";

import { neighborsOf, type Layout, type NodeKind, type PositionedNode } from "@/lib/network";

import { styles } from "./styles/index.styles";

export type NetworkGraphProps = {
  layout: Layout;
  /** The node whose links are highlighted, if any. */
  selectedId: string | null;
  /** The node the network is centered on, drawn larger and always labelled. */
  centerId: string | null;
  onSelect: (id: string | null) => void;
  /** Accessible name of the graph. */
  label: string;
  /** Visible name of a kind of node, for each node's accessible name. */
  kindLabel: (kind: NodeKind) => string;
};

const RADIUS: Record<NodeKind, number> = {
  artist: 8,
  work: 4.5,
  exhibition: 4.5,
  publication: 4.5,
  institution: 6.5,
  place: 6,
};

/** Size assumed until the SVG is measured (and where it can't be, as on the server). */
const FALLBACK_SIZE = { width: 700, height: 700 };

/** Drawing units per CSS pixel, so circles and labels keep the same on-screen size however large the graph is. */
const unitOf = ([, , width, height]: Layout["viewBox"], size: { width: number; height: number }) =>
  Math.max(width / size.width, height / size.height);

/** The rendered size of an element, kept current as it resizes. */
function useSize<T extends Element>() {
  const ref = useRef<T>(null);
  const [size, setSize] = useState(FALLBACK_SIZE);
  useEffect(() => {
    const element = ref.current;
    if (!element || typeof ResizeObserver === "undefined") return;
    const observer = new ResizeObserver(([entry]) => {
      const { width, height } = entry?.contentRect ?? { width: 0, height: 0 };
      if (width > 0 && height > 0) setSize({ width, height });
    });
    observer.observe(element);
    return () => observer.disconnect();
  }, []);
  return [ref, size] as const;
}

/** The network as an SVG: one focusable circle per node, lines thickened by how many records back each link. */
export function NetworkGraph({ layout, selectedId, centerId, onSelect, label, kindLabel }: NetworkGraphProps) {
  const [ref, size] = useSize<SVGSVGElement>();
  const unit = unitOf(layout.viewBox, size);
  const positions = useMemo(() => new Map(layout.nodes.map((node) => [node.id, node])), [layout]);
  const highlighted = useMemo(() => {
    if (!selectedId) return null;
    return new Set([selectedId, ...neighborsOf(layout, selectedId).map((node) => node.id)]);
  }, [layout, selectedId]);

  const onKeyDown = (event: KeyboardEvent, id: string) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      onSelect(id);
    } else if (event.key === "Escape") {
      onSelect(null);
    }
  };

  const showLabel = (node: PositionedNode) =>
    node.kind === "artist" || node.id === centerId || (highlighted?.has(node.id) ?? false);

  return (
    <svg
      ref={ref}
      role="group"
      aria-label={label}
      viewBox={layout.viewBox.join(" ")}
      preserveAspectRatio="xMidYMid meet"
      className={styles.svg}
      onClick={(event) => {
        if (event.target === event.currentTarget) onSelect(null);
      }}
    >
      <g>
        {layout.edges.map((edge) => {
          const source = positions.get(edge.source);
          const target = positions.get(edge.target);
          if (!source || !target) return null;
          const active = selectedId !== null && (edge.source === selectedId || edge.target === selectedId);
          return (
            <line
              key={`${edge.source}|${edge.target}|${edge.kind}`}
              x1={source.x}
              y1={source.y}
              x2={target.x}
              y2={target.y}
              className={active ? styles.edgeActive : styles.edge}
              strokeWidth={unit * (0.6 + 0.6 * Math.log2(edge.weight))}
              strokeOpacity={active ? 0.9 : highlighted ? 0.08 : 0.3}
            />
          );
        })}
      </g>
      <g>
        {layout.nodes.map((node) => {
          const radius = unit * (node.id === centerId ? 11 : RADIUS[node.kind]);
          const dimmed = highlighted !== null && !highlighted.has(node.id);
          return (
            <g
              key={node.id}
              role="button"
              tabIndex={0}
              aria-label={`${kindLabel(node.kind)}: ${node.label}`}
              aria-pressed={node.id === selectedId}
              className={styles.node}
              opacity={dimmed ? 0.25 : 1}
              transform={`translate(${node.x} ${node.y})`}
              onClick={() => onSelect(node.id)}
              onKeyDown={(event) => onKeyDown(event, node.id)}
            >
              <circle r={radius} fill={`var(--atlas-color-entity-${node.kind})`} stroke="var(--atlas-color-bg)" strokeWidth={unit} />
              {node.id === selectedId && <circle r={radius + 3 * unit} className={styles.ring} strokeWidth={1.5 * unit} />}
              {showLabel(node) && (
                <text x={radius + 3 * unit} dy="0.35em" fontSize={11 * unit} className={styles.label}>
                  {node.label}
                </text>
              )}
            </g>
          );
        })}
      </g>
    </svg>
  );
}
