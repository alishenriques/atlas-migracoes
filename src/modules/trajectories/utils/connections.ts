import { fitLabel } from "@/lib/networkLayout";

/** The small network's drawing area, in SVG units. */
export const CONNECTIONS_VIEW = { width: 360, height: 240 };

const CENTER = { x: CONNECTIONS_VIEW.width / 2, y: CONNECTIONS_VIEW.height / 2 };
/** The artist's circle and the ellipse their connections sit on. */
export const CENTER_RADIUS = 38;
const RING = { rx: 92, ry: 84 };
/** Longest label drawn beside a connection (above or below it, where there is more room); longer names are cut with an ellipsis. */
const LABEL_CHARS = { side: 15, vertical: 24 };

export type RingSlot = {
  x: number;
  y: number;
  /** Where the line from the artist leaves their circle. */
  from: { x: number; y: number };
  label: { text: string; x: number; y: number; anchor: "start" | "middle" | "end" };
};

/**
 * Places `labels.length` connections evenly around the artist, starting at the
 * top and going clockwise, each label on the outer side of its dot.
 */
export function ringSlots(labels: string[]): RingSlot[] {
  return labels.map((label, index) => {
    const angle = -Math.PI / 2 + (index * 2 * Math.PI) / labels.length;
    const cos = Math.cos(angle);
    const sin = Math.sin(angle);
    const x = CENTER.x + RING.rx * cos;
    const y = CENTER.y + RING.ry * sin;
    // Near the top and bottom the label is centred above or below the dot; elsewhere it sits beside it.
    const vertical = Math.abs(cos) < 0.3;
    const anchor = vertical ? "middle" : cos > 0 ? "start" : "end";
    return {
      x,
      y,
      from: { x: CENTER.x + CENTER_RADIUS * cos, y: CENTER.y + CENTER_RADIUS * sin },
      label: {
        text: fitLabel(label, vertical ? LABEL_CHARS.vertical : LABEL_CHARS.side),
        x: vertical ? x : x + (cos > 0 ? 9 : -9),
        y: vertical ? y + (sin < 0 ? -10 : 17) : y + 3.5,
        anchor,
      },
    };
  });
}

/** The artist's name in at most two lines that fit their circle, the second cut if needed. */
export function nameLines(name: string, chars = 12): string[] {
  const words = name.trim().split(/\s+/);
  const lines: string[] = [];
  for (const word of words) {
    const last = lines.at(-1);
    if (last !== undefined && `${last} ${word}`.length <= chars) lines[lines.length - 1] = `${last} ${word}`;
    else lines.push(word);
  }
  if (lines.length <= 2) return lines.map((line) => fitLabel(line, chars));
  return [fitLabel(lines[0]!, chars), fitLabel(lines.slice(1).join(" "), chars)];
}

export { CENTER as CONNECTIONS_CENTER };
