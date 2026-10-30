export const styles = {
  index: "flex w-full flex-1 flex-col gap-8 px-4 py-12 sm:px-6 sm:py-16 lg:px-10",
  // Close to the menu: the record opens straight on the artist.
  // From lg up it fills the screen under the 61px top bar, without page scroll.
  record:
    "flex w-full flex-1 flex-col gap-6 px-4 pb-12 pt-4 sm:px-6 sm:pb-16 sm:pt-6 lg:relative lg:h-[calc(100svh-61px)] lg:flex-none lg:overflow-hidden lg:px-10 lg:py-6",
  header: "flex flex-col gap-3",
  title: "font-serif text-4xl leading-tight sm:text-5xl",
  // The title, a thin gold rule and a small label naming what the page holds.
  // Kept on one line: on narrow screens the label wraps beside the rule instead.
  titleRow: "flex items-center gap-4 sm:gap-5",
  titleSeparator: "h-8 w-px shrink-0 bg-accent/60 sm:h-10",
  titleNote: "min-w-0 text-xs font-medium uppercase tracking-[0.16em] text-accent sm:text-sm",
  intro: "max-w-2xl text-muted",
  // Three columns as tall as the screen from lg up: the artist (3/12), a
  // scrolling centre with the map, sources and sections (6/12), and a side
  // column whose blocks share its height (3/12). Stacked below lg, in that order.
  // Each area that scrolls is positioned, so absolute pieces inside it (screen-reader
  // text in the DS accordions) scroll with it instead of stretching the page.
  top: "grid gap-6 lg:min-h-0 lg:flex-1 lg:grid-cols-12",
  profile: "lg:col-span-3 lg:min-h-0",
  center:
    "relative flex min-w-0 flex-col gap-6 lg:col-span-6 lg:-mr-3 lg:min-h-0 lg:overflow-y-auto lg:pr-3 scrollbar-atlas",
  map: "shrink-0 lg:h-[min(560px,70svh)]",
  // Each block takes an equal share of the column: the connections over the institutions.
  aside: "flex flex-col gap-6 lg:col-span-3 lg:min-h-0 lg:[&>*]:min-h-0 lg:[&>*]:flex-1",
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
  // The connections' drawing: 4:3 when stacked, the block's free height from lg up.
  connections: "aspect-[4/3] w-full lg:aspect-auto lg:min-h-0 lg:flex-1",
  // As tall as the record's map.
  map: "h-[50svh] min-h-[320px] w-full",
  portrait: "aspect-[4/5] h-auto",
  // A folded section: its title is known before the data arrives.
  section: "flex items-center justify-between gap-4 rounded-xl border border-line bg-raised p-4",
  sectionTitle: "font-serif text-[22px] leading-tight text-muted",
};
