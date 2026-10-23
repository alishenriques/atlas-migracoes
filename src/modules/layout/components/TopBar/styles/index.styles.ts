// Below xl each screen is a row of the dropped-down list, marked on the left; from xl on, a tab marked underneath.
// The rows slide in one after another (--i is the row's position) while the list opens.
const link =
  "nav-light whitespace-nowrap border-l-2 py-3 pl-3 text-xs font-medium uppercase tracking-[0.14em] -translate-x-2 opacity-0 transition-[color,text-shadow,background-color,opacity,translate] duration-300 ease-out [transition-delay:calc(var(--i)*35ms)] group-data-[open=true]:translate-x-0 group-data-[open=true]:opacity-100 motion-reduce:translate-x-0 xl:border-b-2 xl:border-l-0 xl:py-1 xl:pl-0 xl:translate-x-0 xl:opacity-100 xl:[transition-delay:0ms]";
// A thin gold line, drawn as a background so it can travel along an edge (atlas-light-sweep in globals.css).
const light =
  "bg-[linear-gradient(90deg,transparent,var(--atlas-color-accent),transparent)] bg-size-[40%_100%] bg-no-repeat bg-position-[-100%_0]";

export const styles = {
  header:
    "sticky top-0 z-20 flex items-center justify-between gap-4 border-b border-line bg-background/90 px-4 py-3 backdrop-blur sm:px-6 xl:gap-6",
  // Runs once on each page: a light along the header's lower edge.
  headerLight: `pointer-events-none absolute inset-x-0 -bottom-px h-px animate-[atlas-light-sweep_1.8s_ease-out_forwards] motion-reduce:hidden ${light}`,
  // Hidden until focused: the first Tab on any page offers to skip the menu.
  skip: "sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-3 focus:z-30 focus:rounded-md focus:bg-raised focus:px-3 focus:py-2 focus:text-sm focus:text-accent",
  brand: "flex shrink-0 items-center gap-3 text-foreground",
  mark: "size-9 shrink-0",
  wordmark: "flex flex-col",
  name: "font-serif text-xl font-semibold leading-none",
  tagline: "mt-1 whitespace-nowrap text-[0.6rem] font-medium uppercase leading-none tracking-[0.24em] text-accent",
  /*
   * Below xl: a list that drops over the page (so the full-screen maps keep their size), unrolled from the
   * header by its clip-path, lit from the top left, with a light that runs along its lower edge as it opens.
   * Closed, it stays in place but invisible, so the closing can slide too. From xl: a row of tabs.
   */
  nav: [
    "group absolute inset-x-0 top-full flex max-h-[75svh] flex-col gap-1 overflow-y-auto border-b border-line px-4 py-3 sm:px-6",
    "bg-background bg-[radial-gradient(ellipse_at_top_left,rgb(212_166_74/0.07),transparent_45%)] shadow-[0_16px_40px_rgb(0_0_0/0.45)]",
    "invisible opacity-0 [clip-path:inset(0_0_100%_0)] transition-[clip-path,opacity,visibility] duration-300 ease-out",
    "data-[open=true]:visible data-[open=true]:opacity-100 data-[open=true]:[clip-path:inset(0_0_-48px_0)]",
    "after:pointer-events-none after:absolute after:inset-x-0 after:bottom-0 after:h-px after:bg-[linear-gradient(90deg,transparent,var(--atlas-color-accent),transparent)] after:bg-size-[40%_100%] after:bg-no-repeat after:bg-position-[-100%_0]",
    "data-[open=true]:after:animate-[atlas-light-sweep_1.2s_ease-out_0.15s_forwards] motion-reduce:transition-none motion-reduce:after:hidden",
    "xl:visible xl:static xl:flex-row xl:gap-8 xl:overflow-visible xl:border-0 xl:bg-transparent xl:bg-none xl:p-0 xl:opacity-100 xl:shadow-none xl:[clip-path:none] xl:transition-none xl:after:hidden",
  ].join(" "),
  link: `${link} border-transparent text-muted hover:bg-foreground/[0.03] hover:text-foreground xl:hover:bg-transparent`,
  // The current row is lit from its gold mark; the current tab's underline glows.
  linkCurrent: `${link} border-accent bg-linear-to-r from-accent/10 to-transparent text-accent xl:bg-none xl:shadow-[0_6px_10px_-8px_var(--atlas-color-accent)]`,
  actions: "flex shrink-0 items-center gap-3",
  menuButton:
    "flex min-h-9 items-center gap-2 rounded-md border border-line px-2 text-xs font-medium uppercase tracking-[0.14em] text-muted transition-[color,border-color,box-shadow] duration-300 hover:border-accent hover:text-accent hover:shadow-[0_0_12px_-4px_var(--atlas-color-accent)] aria-expanded:border-accent aria-expanded:text-accent aria-expanded:shadow-[0_0_14px_-3px_var(--atlas-color-accent)] xl:hidden",
  menuIcon: "size-5",
  // The narrowest phones keep the icon only; the button is still named "Menu".
  menuLabel: "max-[419px]:sr-only",
};
