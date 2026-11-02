import { PANEL_TITLE } from "@/shared/styles/panelTitle";

export const styles = {
  // Reaches the bottom of the screen, under a title set apart.
  panel: `md:flex-1 ${PANEL_TITLE}`,
  mapStatus: "absolute inset-0 flex items-center justify-center bg-raised text-sm text-muted",
  sourceNote: "flex max-w-xs flex-col gap-2 whitespace-normal text-xs leading-relaxed",
  sourceTitle: "text-[11px] uppercase tracking-[0.12em] text-accent",
  sourceBase: "border-b border-line pb-2 text-muted",
  sourceRule: "relative pl-3 before:absolute before:left-0 before:top-[0.55em] before:size-1 before:rounded-full before:bg-accent",
  strong: "font-semibold text-foreground",
  list: "flex flex-col gap-2",
  // The title and the tag wrap as whole units when the column is narrow.
  listHeader: "flex flex-wrap items-center justify-between gap-x-3 gap-y-2 [&>*]:whitespace-nowrap",
  inferredText: "block max-w-xs whitespace-normal text-xs leading-relaxed",
  listTitleGroup: "flex items-center gap-2",
  listTitle: "text-[11px] uppercase tracking-[0.12em] text-muted",
  origins: "flex flex-col divide-y divide-white/5",
  origin: "flex flex-col gap-0.5 py-2",
  originName: "font-serif text-lg leading-snug hover:text-accent",
  originMeta: "text-xs text-muted",
  state: "text-foreground",
  credit: "border-t border-line pt-3 text-xs leading-relaxed text-muted",
  popupList: "flex flex-col gap-1 text-sm",
};
