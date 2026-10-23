// Below xl each screen is a row of the dropped-down list, marked on the left; from xl on, a tab marked underneath.
const link =
  "whitespace-nowrap border-l-2 py-3 pl-3 text-xs font-medium uppercase tracking-[0.14em] transition-colors xl:border-b-2 xl:border-l-0 xl:py-1 xl:pl-0";
const nav = "xl:static xl:flex xl:flex-row xl:gap-8 xl:border-0 xl:bg-transparent xl:p-0 xl:shadow-none";

export const styles = {
  header:
    "sticky top-0 z-20 flex items-center justify-between gap-4 border-b border-line bg-background/90 px-4 py-3 backdrop-blur sm:px-6 xl:gap-6",
  // Hidden until focused: the first Tab on any page offers to skip the menu.
  skip: "sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-3 focus:z-30 focus:rounded-md focus:bg-raised focus:px-3 focus:py-2 focus:text-sm focus:text-accent",
  brand: "flex shrink-0 items-center gap-3 text-foreground",
  mark: "size-9 shrink-0",
  wordmark: "flex flex-col",
  name: "font-serif text-xl font-semibold leading-none",
  tagline: "mt-1 whitespace-nowrap text-[0.6rem] font-medium uppercase leading-none tracking-[0.24em] text-accent",
  nav: `hidden ${nav}`,
  // Drops over the page instead of pushing it, so the full-screen maps keep their size.
  navOpen: `absolute inset-x-0 top-full flex max-h-[75svh] flex-col gap-1 overflow-y-auto border-b border-line bg-background px-4 py-3 shadow-[0_16px_40px_rgb(0_0_0/0.45)] sm:px-6 ${nav}`,
  link: `${link} border-transparent text-muted hover:text-foreground`,
  linkCurrent: `${link} border-accent text-accent`,
  actions: "flex shrink-0 items-center gap-3",
  menuButton:
    "flex min-h-9 items-center gap-2 rounded-md border border-line px-2 text-xs font-medium uppercase tracking-[0.14em] text-muted transition-colors hover:border-accent hover:text-accent aria-expanded:border-accent aria-expanded:text-accent xl:hidden",
  menuIcon: "size-5",
  // The narrowest phones keep the icon only; the button is still named "Menu".
  menuLabel: "max-[419px]:sr-only",
};
