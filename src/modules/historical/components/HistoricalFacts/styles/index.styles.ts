export const styles = {
  // Scrolls inside the right column of the map screen.
  panel: "flex flex-col gap-2 md:min-h-0 md:overflow-y-auto scrollbar-atlas",
  tags: "flex items-center gap-2",
  infoText: "block max-w-xs text-xs leading-relaxed",
  status: "text-xs leading-relaxed text-muted",
  // "Em 1942" and "Em curso" stand out from the facts under them (asked by Alisson, 2026-10-30).
  groupTitle: "mt-1 border-b border-accent/40 pb-1.5 font-serif text-xl font-semibold leading-tight text-accent",
  facts: "flex flex-col divide-y divide-white/5",
  fact: "flex flex-col gap-1 py-2",
  date: "text-[11px] uppercase tracking-[0.08em] text-accent",
  factTitle: "font-serif text-base leading-snug hover:text-accent",
  text: "text-xs leading-relaxed text-muted",
  ongoing: "flex flex-wrap gap-x-3 gap-y-1 pt-1 text-xs text-muted",
  ongoingItem: "hover:text-accent",
  credit: "text-[11px] leading-relaxed text-muted",
};
