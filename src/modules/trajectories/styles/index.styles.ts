export const styles = {
  index: "flex w-full flex-1 flex-col gap-8 px-4 py-12 sm:px-6 sm:py-16 lg:px-10",
  record: "flex w-full flex-1 flex-col gap-6 px-4 py-12 sm:px-6 sm:py-16 lg:px-10",
  back: "self-start text-xs uppercase tracking-[0.12em] text-accent hover:underline",
  header: "flex flex-col gap-3",
  title: "font-serif text-4xl leading-tight sm:text-5xl",
  // The title, a thin gold rule and a small label naming what the page holds.
  // Kept on one line: on narrow screens the label wraps beside the rule instead.
  titleRow: "flex items-center gap-4 sm:gap-5",
  titleSeparator: "h-8 w-px shrink-0 bg-accent/60 sm:h-10",
  titleNote: "min-w-0 text-xs font-medium uppercase tracking-[0.16em] text-accent sm:text-sm",
  intro: "max-w-2xl text-muted",
  life: "flex flex-col gap-4 text-sm",
  // The icon sits left of both the label and the value, centred on the pair.
  lifeItem: "relative pl-10",
  lifeIcon: "absolute left-0 top-1/2 -translate-y-1/2",
  lifeLabel: "text-[11px] uppercase tracking-[0.12em] text-muted",
  // The artist (1/3) beside the map (2/3); stacked below lg, the artist first.
  top: "grid gap-6 lg:grid-cols-3",
  profile: "flex flex-col gap-6 rounded-xl border border-line bg-raised p-5 sm:p-6",
  // Photo and name side by side: the photo stays a highlight without making the block tall.
  identity: "flex items-end gap-5",
  portrait: "w-32 shrink-0 sm:w-40",
  naming: "flex min-w-0 flex-col gap-2",
  name: "font-serif text-3xl leading-tight sm:text-4xl",
  actions: "mt-auto flex flex-col gap-3 sm:flex-row lg:flex-col xl:flex-row [&>*]:flex-1",
  // As tall as the artist's block beside it from lg up.
  map: "lg:col-span-2 lg:h-auto lg:min-h-[480px]",
  sources: "flex flex-wrap items-center gap-x-6 gap-y-2 border-y border-line py-3",
  sourcesLabel: "text-[11px] uppercase tracking-[0.12em] text-muted",
  sections: "flex flex-col gap-3",
  items: "flex flex-col divide-y divide-white/5",
  item: "flex flex-col gap-0.5 py-2.5 first:pt-0 last:pb-0",
  itemTitle: "font-serif text-lg leading-snug",
  itemMeta: "text-xs text-muted",
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
  portrait: "aspect-[4/5] h-auto",
  // A folded section: its title is known before the data arrives.
  section: "flex items-center justify-between gap-4 rounded-xl border border-line bg-raised p-4",
  sectionTitle: "font-serif text-[22px] leading-tight text-muted",
};
