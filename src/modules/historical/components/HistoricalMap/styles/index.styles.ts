export const styles = {
  root: "absolute inset-0",
  loading: "absolute inset-0 animate-pulse bg-raised",
  // At the top left on mobile, clear of the attribution; on desktop centered at the bottom,
  // between the floating blocks and clear of the zoom buttons.
  legend:
    "pointer-events-none absolute top-3 left-3 flex max-w-[calc(100%-1.5rem)] items-center gap-2 rounded-2xl border border-line bg-background/85 px-3 py-1.5 text-xs text-muted backdrop-blur md:top-auto md:bottom-8 md:left-1/2 md:max-w-[calc(100%-6rem)] md:-translate-x-1/2 md:rounded-full",
  legendDot: "inline-block size-2.5 shrink-0 rounded-full bg-[var(--atlas-color-entity-artist)] ring-[1.5px] ring-background",
};
