export const styles = {
  index: "flex w-full flex-1 flex-col gap-8 px-4 py-12 sm:px-6 sm:py-16 lg:px-10",
  record: "flex w-full flex-1 flex-col gap-6 px-4 py-12 sm:px-6 sm:py-16 lg:px-10",
  back: "self-start text-xs uppercase tracking-[0.12em] text-accent hover:underline",
  header: "flex flex-col gap-3",
  links: "flex flex-wrap gap-x-6 gap-y-2",
  title: "font-serif text-4xl leading-tight sm:text-5xl",
  // The title, a thin gold rule and a small label naming what the page holds.
  // Kept on one line: on narrow screens the label wraps beside the rule instead.
  titleRow: "flex items-center gap-4 sm:gap-5",
  titleSeparator: "h-8 w-px shrink-0 bg-accent/60 sm:h-10",
  titleNote: "min-w-0 text-xs font-medium uppercase tracking-[0.16em] text-accent sm:text-sm",
  intro: "max-w-2xl text-muted",
  life: "flex flex-col gap-2 text-sm sm:flex-row sm:gap-10",
  // The icon sits left of both the label and the value, centred on the pair.
  lifeItem: "relative pl-10",
  lifeIcon: "absolute left-0 top-1/2 -translate-y-1/2",
  lifeLabel: "text-[11px] uppercase tracking-[0.12em] text-muted",
  columns: "grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,2fr)] lg:items-start",
  aside: "lg:sticky lg:top-20",
  sections: "flex flex-col gap-6",
  items: "flex flex-col divide-y divide-white/5",
  item: "flex flex-col gap-0.5 py-2.5 first:pt-0 last:pb-0",
  itemTitle: "font-serif text-lg leading-snug",
  itemMeta: "text-xs text-muted",
  sources: "flex flex-col gap-3 text-sm",
  source: "flex flex-col gap-1",
  muted: "text-sm text-muted",
  grid: "grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5",
  card: "flex h-full items-center justify-between gap-4 rounded-xl border border-line bg-raised px-4 py-3 transition-colors hover:border-accent focus-visible:outline-2 focus-visible:outline-accent",
  cardText: "flex min-w-0 flex-col gap-1",
  cardName: "font-serif text-xl leading-tight",
};

export const skeletonStyles = {
  // The search box above the cards, as tall as its label and field.
  list: "flex flex-col gap-5",
  search: "w-full sm:max-w-sm",
  // A card's frame, without the hover of a link.
  card: "flex h-full items-center justify-between gap-4 rounded-xl border border-line bg-raised px-4 py-3",
  // Takes the card's width, which the skeleton lines size themselves against.
  cardText: "flex min-w-0 flex-1 flex-col gap-2",
  record: "flex flex-col gap-6",
  // As tall as the record's map.
  map: "h-[50svh] min-h-[320px] w-full",
};
