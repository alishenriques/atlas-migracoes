export const styles = {
  // Desktop: fills the screen under the top bar, with no page scroll.
  root: "relative flex flex-col md:flex-1 md:min-h-[560px] md:overflow-hidden",
  map: "relative h-[60svh] min-h-[360px] md:absolute md:inset-0 md:h-auto",
  // A grid laid over the map: the left column (intro over the filters) | free map, then the
  // footer along the bottom. Only the blocks take pointer events, so the map stays draggable.
  overlay:
    "flex flex-col gap-4 p-4 md:pb-8 md:pointer-events-none md:absolute md:inset-0 md:grid md:grid-cols-[336px_minmax(0,1fr)] md:grid-rows-[minmax(0,1fr)_auto]",
  side: "flex flex-col gap-4 md:col-start-1 md:row-start-1 md:min-h-0",
  intro: "md:pointer-events-auto md:shrink-0",
  // Takes what the intro leaves of the column and scrolls inside it.
  panel: "md:pointer-events-auto md:min-h-0 md:overflow-y-auto scrollbar-atlas",
  // Stops short of the right edge, and the overlay leaves a strip under it, so MapLibre's zoom
  // buttons and the map attribution stay visible.
  footer: "md:pointer-events-auto md:col-span-2 md:row-start-2 md:mr-12",
  clear: "text-xs uppercase tracking-[0.12em] text-accent hover:underline",
  legend: "flex flex-col gap-1",
  legendItem: "flex items-center gap-2 text-xs text-muted",
  // Line samples matching the map: solid gold for the migration, dashed light for the other legs.
  legendMigration: "inline-block h-0.5 w-6 shrink-0 rounded bg-accent",
  legendRoute: "inline-block w-6 shrink-0 border-t border-dashed border-foreground/60",
  list: "flex flex-col gap-2 border-t border-line pt-3",
  listTitle: "text-[11px] uppercase tracking-[0.12em] text-muted",
  artists: "flex flex-col",
  artist:
    "flex w-full items-baseline justify-between gap-3 rounded px-2 py-1.5 text-left text-sm hover:bg-white/5 focus-visible:outline-2 focus-visible:outline-accent",
  artistOrigin: "shrink-0 text-xs text-muted",
  detail: "flex flex-col gap-3 border-t border-line pt-3",
  detailHeader: "flex items-start justify-between gap-3",
  detailName: "font-serif text-2xl leading-tight",
  note: "text-xs leading-relaxed text-muted",
  recordLink: "text-xs uppercase tracking-[0.12em] text-accent hover:underline",
  popupGroups: "flex flex-col gap-3",
  popupGroup: "flex flex-col gap-1",
  popupArtist:
    "self-start text-left text-sm font-medium text-foreground hover:text-accent focus-visible:outline-2 focus-visible:outline-accent",
  // Each record as a row with a thread on the left, like the trajectory list in the panel.
  popupStops: "flex flex-col border-l border-line pl-3",
  popupStop: "flex items-baseline justify-between gap-3 py-0.5",
  popupKind: "text-[11px] uppercase tracking-[0.12em] text-accent",
  popupDate: "text-xs text-muted tabular-nums",
};
