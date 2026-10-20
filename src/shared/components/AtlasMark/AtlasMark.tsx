import { styles } from "./styles/index.styles";

interface AtlasMarkProps {
  className?: string;
}

/**
 * The Atlas symbol (Rosa Leste-Sul): a compass rose whose only gold stroke is
 * the quarter turn from East to South, from the hollow origin dot to the solid
 * arrival dot. Decorative: the text next to it carries the name.
 */
export function AtlasMark({ className }: AtlasMarkProps) {
  return (
    <svg
      viewBox="0 0 64 64"
      aria-hidden="true"
      focusable="false"
      className={className ? `${styles.mark} ${className}` : styles.mark}
    >
      <g className={styles.ink}>
        <circle cx="32" cy="32" r="25" fill="none" stroke="currentColor" strokeOpacity=".4" strokeWidth="1.25" />
        <path d="M32 3v6M3 32h6" stroke="currentColor" strokeOpacity=".6" strokeWidth="1.25" strokeLinecap="round" />
        <path d="M32 12 34.4 29.6 50 32 34.4 34.4 32 52 29.6 34.4 14 32 29.6 29.6Z" fill="currentColor" />
      </g>
      <g className={styles.accent}>
        <path d="M56.82 34.99A25 25 0 0 1 32 57" fill="none" stroke="currentColor" strokeWidth="3.2" strokeLinecap="round" />
        <circle cx="57" cy="32" r="3" fill="none" stroke="currentColor" strokeWidth="1.6" />
        <circle cx="32" cy="57" r="3.6" fill="currentColor" />
      </g>
    </svg>
  );
}
