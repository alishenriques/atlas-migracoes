const link = "whitespace-nowrap border-b-2 py-1 text-xs font-medium uppercase tracking-[0.14em] transition-colors";

export const styles = {
  header:
    "sticky top-0 z-20 flex flex-wrap items-center justify-between gap-x-6 gap-y-2 border-b border-line bg-background/90 px-4 py-3 backdrop-blur sm:px-6",
  brand: "font-serif text-xl tracking-wide text-foreground",
  nav: "order-3 flex w-full gap-5 overflow-x-auto md:order-none md:w-auto md:gap-8",
  link: `${link} border-transparent text-muted hover:text-foreground`,
  linkCurrent: `${link} border-accent text-accent`,
};
