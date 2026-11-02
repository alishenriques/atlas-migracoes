export const styles = {
  list: "flex flex-col gap-5",
  // The search box, and the count beside it from sm up.
  toolbar: "flex flex-col gap-2 sm:flex-row sm:items-end sm:gap-5",
  search: "w-full sm:max-w-sm",
  count: "text-xs text-muted sm:pb-2.5",
  // Shared with the skeleton, so the cards land where their placeholders were.
  grid: "grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5",
  card: "flex h-full items-center justify-between gap-4 rounded-xl border border-line bg-raised px-4 py-3 transition-colors hover:border-accent focus-visible:outline-2 focus-visible:outline-accent",
  cardText: "flex min-w-0 flex-col gap-1",
  cardName: "font-serif text-xl leading-tight",
  cardMeta: "text-xs text-muted",
  empty: "text-sm text-muted",
};

export const skeletonStyles = {
  // The search box above the cards, as tall as its label and field.
  list: "flex flex-col gap-5",
  search: "w-full sm:max-w-sm",
  // A card's frame, without the hover of a link.
  card: "flex h-full items-center justify-between gap-4 rounded-xl border border-line bg-raised px-4 py-3",
  // Takes the card's width, which the skeleton lines size themselves against.
  cardText: "flex min-w-0 flex-1 flex-col gap-2",
};
