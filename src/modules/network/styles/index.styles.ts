export const styles = {
  // The positioning context for the explorer, which fills it on desktop (see NetworkExplorer).
  page: "relative flex flex-1 flex-col lg:min-h-[560px] lg:overflow-hidden",
  header: "flex flex-col gap-3",
  // Sized to keep the title on one line in the 360px left column.
  title: "font-serif text-4xl leading-tight",
  intro: "text-sm leading-relaxed text-muted",
  fallback: "flex w-full flex-col gap-6 px-4 py-12 sm:px-6 lg:px-10",
  muted: "text-sm text-muted",
  credit: "text-xs leading-relaxed text-muted",
};

export const skeletonStyles = {
  // Where the graph's frame goes (see NetworkExplorer), drawn by the skeleton itself.
  graph: "h-[65svh] min-h-[380px] lg:h-auto lg:min-h-0",
};
