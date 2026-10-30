export const styles = {
  // Desktop: fills the screen under the top bar with no page scroll, in the margins of the Trajetórias
  // index: the left column (presentation over the controls) | the graph on the rest.
  root: "flex w-full flex-col gap-4 px-4 py-8 sm:px-6 lg:absolute lg:inset-0 lg:grid lg:grid-cols-[360px_minmax(0,1fr)] lg:grid-rows-[minmax(0,1fr)] lg:gap-6 lg:px-10 lg:py-6",
  // On smaller screens the column dissolves into the stack, so the credit can drop below the graph.
  side: "contents lg:flex lg:min-h-0 lg:flex-col lg:gap-4",
  intro: "flex flex-col gap-4 lg:shrink-0",
  // Takes what the presentation leaves of the column and scrolls inside it.
  panel: "flex flex-col gap-4 lg:min-h-0 lg:overflow-y-auto scrollbar-atlas",
  footer: "order-last lg:order-none lg:shrink-0",
  graph: "relative h-[65svh] min-h-[380px] overflow-hidden rounded-xl border border-line bg-raised lg:h-auto lg:min-h-0",
  empty: "absolute inset-0 flex items-center justify-center px-6 text-center text-sm text-muted",
  note: "text-xs leading-relaxed text-muted",
  centerName: "-mb-2 font-serif text-2xl leading-tight text-foreground",
  centerRecord: "w-full",
  clear: "text-xs uppercase tracking-[0.12em] text-accent hover:underline",
  detail: "flex flex-col gap-2 border-t border-line pt-3",
  detailHeader: "flex flex-wrap items-center justify-between gap-2",
  detailKind: "text-[11px] uppercase tracking-[0.12em] text-muted",
  detailTitle: "font-serif text-xl leading-snug",
  detailMeta: "text-xs text-muted",
  actions: "flex flex-wrap gap-x-4 gap-y-1",
  action: "text-xs uppercase tracking-[0.12em] text-accent hover:underline",
  // The panel scrolls on desktop, so the list only scrolls by itself when the columns stack.
  neighbors: "flex max-h-64 flex-col gap-0.5 overflow-y-auto text-sm scrollbar-atlas lg:max-h-none lg:overflow-visible",
  neighbor: "flex w-full items-baseline gap-2 rounded px-1 py-0.5 text-left hover:bg-white/5",
  dot: "inline-block size-2 shrink-0 rounded-full",
};
