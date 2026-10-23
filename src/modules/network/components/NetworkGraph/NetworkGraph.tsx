"use client";

import { useEffect, useEffectEvent, useMemo, useRef, useState, type KeyboardEvent, type PointerEvent, type SVGProps } from "react";

import { neighborsOf, type NetworkEdge, type NodeKind } from "@/lib/network";
import {
  headingY,
  nodeRadius,
  visibleLabels,
  type ColumnKey,
  type LabelSide,
  type Layout,
  type PositionedNode,
  type ViewBox,
} from "@/lib/networkLayout";

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
  /** Heading of each column of the overview. */
  columnLabel: (key: ColumnKey) => string;
  /** Names of the zoom buttons. */
  zoomLabels: { in: string; out: string; fit: string };
};

/** Size assumed until the SVG is measured (and where it can't be, as on the server). */
const FALLBACK_SIZE = { width: 700, height: 700 };
/** How far in the zoom goes, as a share of the whole picture, and how much each step zooms. */
const MAX_ZOOM = 8;
const STEP = 1.5;
/** Pointer travel, in pixels, past which a press is a pan and not a click. */
const DRAG_THRESHOLD = 4;

/** Drawing units per CSS pixel, so circles and labels keep the same on-screen size however large the graph is. */
const unitOf = ([, , width, height]: ViewBox, size: { width: number; height: number }) =>
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

/** Zooms `view` by `factor` around a point in drawing units, never past the whole picture or MAX_ZOOM. */
export function zoomView(view: ViewBox, whole: ViewBox, factor: number, focus?: [number, number]): ViewBox {
  const [x, y, width, height] = view;
  const next = Math.min(whole[2], Math.max(whole[2] / MAX_ZOOM, width / factor));
  if (next >= whole[2]) return whole;
  const scale = next / width;
  const [fx, fy] = focus ?? [x + width / 2, y + height / 2];
  return [fx - (fx - x) * scale, fy - (fy - y) * scale, width * scale, height * scale];
}

const edgePath = (layout: Layout, source: PositionedNode, target: PositionedNode) => {
  if (layout.shape === "radial") return `M${source.x} ${source.y}L${target.x} ${target.y}`;
  // Columns: a smooth S from one column to the next, so bundles of links stay readable.
  const middle = (source.x + target.x) / 2;
  return `M${source.x} ${source.y}C${middle} ${source.y} ${middle} ${target.y} ${target.x} ${target.y}`;
};

/** Where a label goes for each side: beside the node, vertically centred, or centred below it. */
const labelPlacement = (side: LabelSide, gap: number, shift: number): SVGProps<SVGTextElement> =>
  side === "below"
    ? { x: 0, y: gap + shift, dy: "0.8em", textAnchor: "middle" }
    : { x: side === "right" ? gap : -gap, y: shift, dy: "0.35em", textAnchor: side === "right" ? "start" : "end" };

/** Birth and death are life facts, not exhibitions: they are drawn dashed. */
const isLifeLink = (edge: NetworkEdge) => edge.kind === "born_in" || edge.kind === "died_in";

/**
 * The network as an SVG: one focusable circle per node, sized by its links, lines
 * thickened by how many records back each link. Zooms with the wheel or the buttons
 * and pans by dragging; labels that would overlap at the current zoom are left out
 * and show on hover, focus or selection.
 */
export function NetworkGraph({
  layout,
  selectedId,
  centerId,
  onSelect,
  label,
  kindLabel,
  columnLabel,
  zoomLabels,
}: NetworkGraphProps) {
  const [ref, size] = useSize<SVGSVGElement>();
  const [zoom, setZoom] = useState({ layout, view: layout.viewBox });
  // A new layout starts from the whole picture.
  const view = zoom.layout === layout ? zoom.view : layout.viewBox;
  const setView = (next: ViewBox) => setZoom({ layout, view: next });
  const zoomed = view[2] < layout.viewBox[2];
  const unit = unitOf(view, size);

  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const drag = useRef<{ x: number; y: number; view: ViewBox; moved: boolean } | null>(null);

  const positions = useMemo(() => new Map(layout.nodes.map((node) => [node.id, node])), [layout]);
  const highlighted = useMemo(() => {
    if (!selectedId) return null;
    return new Set([selectedId, ...neighborsOf(layout, selectedId).map((node) => node.id)]);
  }, [layout, selectedId]);
  const labelled = useMemo(() => {
    const pinned = new Set([centerId, hoveredId, ...(highlighted ?? [])].filter((id): id is string => id !== null));
    return visibleLabels(layout.nodes, { unit, pinned, candidates: highlighted, centerId });
  }, [layout.nodes, unit, centerId, hoveredId, highlighted]);

  /** Converts a pointer position to drawing units, minding the letterbox `meet` leaves around the picture. */
  const toDrawing = (clientX: number, clientY: number): [number, number] | undefined => {
    const rect = ref.current?.getBoundingClientRect();
    if (!rect?.width || !rect.height) return undefined;
    const scale = unitOf(view, rect);
    return [
      view[0] - (rect.width * scale - view[2]) / 2 + (clientX - rect.left) * scale,
      view[1] - (rect.height * scale - view[3]) / 2 + (clientY - rect.top) * scale,
    ];
  };

  // The wheel listener is attached by hand: React's is passive and can't stop the page from scrolling.
  const onWheel = useEffectEvent((event: WheelEvent) => {
    event.preventDefault();
    setView(zoomView(view, layout.viewBox, event.deltaY < 0 ? 1.2 : 1 / 1.2, toDrawing(event.clientX, event.clientY)));
  });
  useEffect(() => {
    const element = ref.current;
    element?.addEventListener("wheel", onWheel, { passive: false });
    return () => element?.removeEventListener("wheel", onWheel);
  }, [ref]);

  const onPointerDown = (event: PointerEvent<SVGSVGElement>) => {
    drag.current = { x: event.clientX, y: event.clientY, view, moved: false };
  };
  const onPointerMove = (event: PointerEvent<SVGSVGElement>) => {
    const start = drag.current;
    if (!start) return;
    const dx = event.clientX - start.x;
    const dy = event.clientY - start.y;
    if (!start.moved && Math.hypot(dx, dy) < DRAG_THRESHOLD) return;
    start.moved = true;
    const [x, y, width, height] = start.view;
    setView([x - dx * unit, y - dy * unit, width, height]);
  };
  const onPointerUp = () => {
    // Keep the drag until the click that follows it, so a pan never selects or clears.
    if (!drag.current?.moved) drag.current = null;
  };

  const onKeyDown = (event: KeyboardEvent, id: string) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      onSelect(id);
    } else if (event.key === "Escape") {
      onSelect(null);
    }
  };

  return (
    <div className={styles.root}>
      <svg
        ref={ref}
        role="group"
        aria-label={label}
        viewBox={view.join(" ")}
        preserveAspectRatio="xMidYMid meet"
        className={styles.svg}
        // Touch scrolls the page until the graph is zoomed in; then a drag pans it.
        style={{ touchAction: zoomed ? "none" : "pan-y" }}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerLeave={() => (drag.current = null)}
        onClickCapture={(event) => {
          if (drag.current?.moved) event.stopPropagation();
          drag.current = null;
        }}
        onClick={(event) => {
          if (event.target === event.currentTarget) onSelect(null);
        }}
      >
        <g aria-hidden>
          {layout.rings.map((radius) => (
            <circle key={radius} r={radius} className={styles.guide} strokeWidth={unit} />
          ))}
          {layout.columns.map(({ key, x }) => (
            <text key={key} x={x} y={headingY(layout)} fontSize={10 * unit} textAnchor="middle" className={styles.heading}>
              {columnLabel(key)}
            </text>
          ))}
        </g>
        <g>
          {layout.edges.map((edge) => {
            const source = positions.get(edge.source);
            const target = positions.get(edge.target);
            if (!source || !target) return null;
            const active = selectedId !== null && (edge.source === selectedId || edge.target === selectedId);
            return (
              <path
                key={`${edge.source}|${edge.target}|${edge.kind}`}
                d={edgePath(layout, source, target)}
                className={active ? styles.edgeActive : styles.edge}
                strokeWidth={unit * (0.6 + 0.6 * Math.log2(edge.weight))}
                strokeOpacity={active ? 0.9 : highlighted ? 0.08 : layout.shape === "radial" ? 0.2 : 0.3}
                strokeDasharray={isLifeLink(edge) ? `${3 * unit} ${3 * unit}` : undefined}
              />
            );
          })}
        </g>
        <g>
          {layout.nodes.map((node) => {
            const radius = unit * nodeRadius(node, node.id === centerId);
            const dimmed = highlighted !== null && !highlighted.has(node.id);
            const gap = radius + 3 * unit;
            const placedLabel = labelled.get(node.id);
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
                onPointerEnter={() => setHoveredId(node.id)}
                onPointerLeave={() => setHoveredId(null)}
                onFocus={() => setHoveredId(node.id)}
                onBlur={() => setHoveredId(null)}
              >
                <circle r={radius} fill={`var(--atlas-color-entity-${node.kind})`} stroke="var(--atlas-color-bg)" strokeWidth={unit} />
                {node.id === selectedId && <circle r={radius + 3 * unit} className={styles.ring} strokeWidth={1.5 * unit} />}
                {placedLabel && (
                  <text {...labelPlacement(node.side, gap, placedLabel.shift)} fontSize={11 * unit} strokeWidth={3 * unit} className={styles.label}>
                    {placedLabel.text}
                  </text>
                )}
              </g>
            );
          })}
        </g>
      </svg>

      <div className={styles.controls}>
        <button type="button" className={styles.control} aria-label={zoomLabels.in} onClick={() => setView(zoomView(view, layout.viewBox, STEP))}>
          +
        </button>
        <button
          type="button"
          className={styles.control}
          aria-label={zoomLabels.out}
          disabled={!zoomed}
          onClick={() => setView(zoomView(view, layout.viewBox, 1 / STEP))}
        >
          −
        </button>
        <button type="button" className={styles.control} aria-label={zoomLabels.fit} disabled={!zoomed} onClick={() => setView(layout.viewBox)}>
          <span aria-hidden>⤢</span>
        </button>
      </div>
    </div>
  );
}
