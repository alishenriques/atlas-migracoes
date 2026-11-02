export const styles = {
  // Reaches the bottom of the screen. Its title is the DS's small muted label, set apart here in
  // gold serif; the DS's CSS is not in a layer, so these overrides need "!".
  panel:
    "md:flex-1 [&>header>[role=heading]]:font-serif! [&>header>[role=heading]]:text-2xl! [&>header>[role=heading]]:normal-case! [&>header>[role=heading]]:tracking-normal! [&>header>[role=heading]]:text-accent!",
  mapStatus: "absolute inset-0 flex items-center justify-center bg-raised text-sm text-muted",
  note: "text-xs leading-relaxed text-muted",
  sourceNote: "flex max-w-xs flex-col gap-2 text-xs leading-relaxed",
  sourceTitle: "text-[11px] uppercase tracking-[0.12em] text-accent",
  sourceBase: "border-b border-line pb-2 text-muted",
  sourceRule: "relative pl-3 before:absolute before:left-0 before:top-[0.55em] before:size-1 before:rounded-full before:bg-accent",
  strong: "font-semibold text-foreground",
  list: "flex flex-col gap-2",
  listHeader: "flex items-center justify-between gap-3",
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
