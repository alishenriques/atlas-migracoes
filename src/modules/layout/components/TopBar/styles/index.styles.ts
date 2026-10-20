const link = "whitespace-nowrap border-b-2 py-1 text-xs font-medium uppercase tracking-[0.14em] transition-colors";

export const styles = {
  header:
    "sticky top-0 z-20 flex flex-wrap items-center justify-between gap-x-6 gap-y-2 border-b border-line bg-background/90 px-4 py-3 backdrop-blur sm:px-6",
  // Hidden until focused: the first Tab on any page offers to skip the menu.
  skip: "sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-3 focus:z-30 focus:rounded-md focus:bg-raised focus:px-3 focus:py-2 focus:text-sm focus:text-accent",
  brand: "flex items-center gap-3 text-foreground",
  mark: "size-9",
  wordmark: "flex flex-col",
  name: "font-serif text-xl font-semibold leading-none",
  tagline: "mt-1 text-[0.6rem] font-medium uppercase leading-none tracking-[0.24em] text-accent",
  nav: "order-3 flex w-full gap-5 overflow-x-auto md:order-none md:w-auto md:gap-6 lg:gap-8",
  link: `${link} border-transparent text-muted hover:text-foreground`,
  linkCurrent: `${link} border-accent text-accent`,
};
