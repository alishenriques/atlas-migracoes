// Each stroke turns about its own middle, then the outer two meet at the icon's center.
const line = "transition-[translate,rotate,opacity] duration-300 ease-out [transform-box:view-box] motion-reduce:transition-none";

/** Three thin strokes that turn into an X while the menu is open, drawn like the "Traço" icons. */
export function MenuIcon({ open, className }: { open: boolean; className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" aria-hidden="true" className={className}>
      <path d="M5 7h14" className={`${line} origin-[12px_7px] ${open ? "translate-y-[5px] rotate-45" : ""}`} />
      <path d="M5 12h14" className={`${line} ${open ? "opacity-0" : ""}`} />
      <path d="M5 17h14" className={`${line} origin-[12px_17px] ${open ? "-translate-y-[5px] -rotate-45" : ""}`} />
    </svg>
  );
}
