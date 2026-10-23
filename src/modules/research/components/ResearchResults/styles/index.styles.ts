export const styles = {
  root: "flex flex-col gap-6",
  // On small screens the reading comes right after the collection's record, then the findings,
  // then the period, the sources and the method. From lg up the record, the period, the sources
  // and the method sit in the left column; from xl up the findings get a third column, so each
  // [n] of the summaries has its finding beside it.
  columns:
    "grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,2fr)] lg:grid-rows-[auto_1fr] lg:items-start xl:grid-cols-[minmax(18rem,1fr)_minmax(0,2fr)_minmax(0,1.5fr)]",
  collection: "lg:col-start-1 lg:row-start-1",
  aside: "flex flex-col gap-6 lg:col-start-1 lg:row-start-2",
  main: "flex flex-col gap-6 lg:col-start-2 lg:row-span-2 lg:row-start-1 xl:contents",
  reading: "flex flex-col gap-6 xl:col-start-2 xl:row-span-2 xl:row-start-1",
  // With no match there are no findings, so the reading takes their column too.
  readingWide: "flex flex-col gap-6 xl:col-span-2 xl:col-start-2 xl:row-span-2 xl:row-start-1",
  findingsPanel: "xl:col-start-3 xl:row-span-2 xl:row-start-1",
  facts: "flex flex-col gap-2 text-sm",
  factLabel: "text-[11px] uppercase tracking-[0.12em] text-muted",
  matchTitle: "font-serif text-xl leading-snug",
  text: "text-sm leading-relaxed",
  note: "text-xs leading-relaxed text-muted",
  link: "self-start text-xs uppercase tracking-[0.12em] text-accent hover:underline",
  groups: "flex flex-col divide-y divide-white/5",
  group: "flex flex-col gap-2 py-3 first:pt-0 last:pb-0",
  groupTitle: "text-[11px] uppercase tracking-[0.12em] text-muted",
  findings: "flex flex-col gap-3",
  finding: "flex flex-col gap-1 scroll-mt-24 target:rounded target:outline target:outline-1 target:outline-offset-4 target:outline-accent",
  anchored: "flex flex-col gap-1 scroll-mt-24",
  findingValue: "font-serif text-lg leading-snug",
  findingNumber: "tabular-nums text-accent",
  findingMeta: "flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted",
  review: "text-xs leading-relaxed text-accent",
  sources: "flex flex-col gap-1 text-sm",
  method: "flex flex-col gap-2 text-sm leading-relaxed text-muted",
  promptToggle: "cursor-pointer text-xs uppercase tracking-[0.12em] text-accent",
  prompt: "mt-2 max-h-96 overflow-auto whitespace-pre-wrap break-words rounded border border-white/10 p-3 font-mono text-[11px] leading-relaxed scrollbar-atlas",
};
