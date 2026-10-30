import { styles as institutions } from "../../InstitutionsCard/styles/index.styles";

export const styles = {
  card: "flex flex-col gap-3 rounded-xl border border-line bg-raised p-5 lg:h-full lg:min-h-0",
  header: "flex shrink-0 items-center gap-2",
  title: institutions.title,
  infoText: "block max-w-64 text-xs normal-case tracking-normal",
  legendLabel: "shrink-0 text-[11px] text-muted",
  legend: "shrink-0 -mt-1",
  // Keeps its 4:3 shape when stacked; from lg up it takes the block's free height.
  figure: "relative min-h-0 lg:flex-1",
  svg: "block aspect-[4/3] w-full lg:absolute lg:inset-0 lg:aspect-auto lg:h-full",
  line: "fill-none",
  center: "fill-background stroke-accent",
  name: "fill-foreground font-serif",
  label: "fill-foreground font-sans",
  empty: "text-sm text-muted",
  more: institutions.more,
};
