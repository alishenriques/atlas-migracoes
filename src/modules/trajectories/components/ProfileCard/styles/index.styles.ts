export const styles = {
  card: "@container flex flex-col gap-5 rounded-xl border border-line bg-raised p-5 sm:p-6",
  back: "inline-flex items-center gap-2 self-start text-xs uppercase tracking-[0.12em] text-foreground hover:text-accent",
  // Photo and name side by side, as on a museum label, once the column is wide
  // enough for both; stacked in a narrow one.
  identity: "flex flex-col items-start gap-4 @[16rem]:flex-row @[16rem]:gap-5",
  portrait: "w-28 shrink-0 @[22rem]:w-32 @[26rem]:w-40",
  naming: "flex min-w-0 flex-col gap-2 pt-1",
  name: "font-serif text-[28px] leading-[1.05] @[22rem]:text-3xl @[26rem]:text-4xl",
  years: "font-serif text-lg text-accent",
  occupation: "text-sm leading-relaxed text-muted",
  bio: "flex flex-col items-start gap-2 text-sm leading-relaxed text-foreground/90",
  bioSource: "text-[11px] uppercase tracking-[0.12em] text-muted",
  bioLink: "text-accent hover:underline",
  facts: "flex flex-col gap-4",
  // The icon sits left of both the label and the value.
  fact: "relative pl-9 text-sm",
  factIcon: "absolute left-0 top-0",
  factLabel: "text-[11px] uppercase tracking-[0.12em] text-muted",
  factValue: "mt-0.5 leading-snug",
  source: "ml-2 inline-flex gap-2 text-[11px] text-muted",
  sourceLink: "underline decoration-dotted underline-offset-2 hover:text-accent",
  actions: "mt-auto flex flex-col gap-3 pt-2 @[26rem]:flex-row [&>*]:flex-1",
};
