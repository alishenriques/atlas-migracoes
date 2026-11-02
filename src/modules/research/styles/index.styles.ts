export const styles = {
  // Full width, with the same margins as Trajetórias.
  page: "flex w-full flex-1 flex-col gap-8 px-4 py-12 sm:px-6 sm:py-16 lg:px-10",
  // An artist's page opens closer to the menu, under the way back to the list.
  artistPage: "flex w-full flex-1 flex-col gap-8 px-4 pb-12 pt-6 sm:px-6 sm:pb-16 lg:px-10",
  back: "inline-flex items-center gap-2 self-start text-xs uppercase tracking-[0.12em] text-foreground hover:text-accent",
  header: "flex flex-col gap-3",
  // Kept on one line: on narrow screens the label beside it wraps instead.
  title: "shrink-0 font-serif text-4xl leading-tight sm:text-5xl",
  // The title, a thin gold rule and a small label naming what the page holds, as on Trajetórias.
  titleRow: "flex items-center gap-4 sm:gap-5",
  titleSeparator: "h-8 w-px shrink-0 bg-accent/60 sm:h-10",
  titleNote: "min-w-0 text-xs font-medium uppercase tracking-[0.16em] text-accent sm:text-sm",
  intro: "max-w-3xl text-muted",
  muted: "text-sm text-muted",
};
