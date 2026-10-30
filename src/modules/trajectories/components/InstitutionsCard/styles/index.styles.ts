export const styles = {
  card: "flex flex-col gap-4 rounded-xl border border-line bg-raised p-5",
  title: "text-xs font-medium uppercase tracking-[0.14em] text-foreground",
  empty: "text-sm text-muted",
  list: "flex flex-col gap-3",
  // A framed icon beside the name and its details, as on the reference.
  item: "flex items-start gap-3",
  icon: "flex size-9 shrink-0 items-center justify-center rounded-md border border-line bg-background/60 text-accent",
  text: "flex min-w-0 flex-col gap-0.5",
  name: "text-sm leading-snug text-foreground",
  detail: "text-xs text-muted",
  // Opens by growing its row from 0fr to 1fr, so the height needs no measuring.
  rest: "-mt-4 grid grid-rows-[0fr] opacity-0 transition-[grid-template-rows,opacity,margin] duration-300 ease-out data-[open=true]:-mt-1 data-[open=true]:grid-rows-[1fr] data-[open=true]:opacity-100 motion-reduce:transition-none",
  restInner: "min-h-0 overflow-hidden",
  more: "inline-flex items-center gap-2 self-start text-xs font-medium uppercase tracking-[0.12em] text-accent hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent",
  arrowUp: "-rotate-90",
};
