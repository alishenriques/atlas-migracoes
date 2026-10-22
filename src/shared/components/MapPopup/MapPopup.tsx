import type { ReactNode } from "react";

import { Eyebrow } from "@alishenriques/atlas-design-system";

import { styles } from "./styles/index.styles";

export type MapPopupProps = {
  /** The place or state the popup is about. */
  title: string;
  /** Small gold label above the title, such as the country. */
  eyebrow?: string;
  /** One quiet line under the title, such as how many records the place holds. */
  meta?: ReactNode;
  /** The records, in a scrollable area when they outgrow the popup. */
  children?: ReactNode;
};

/** The content of a map popup, laid out like the Atlas panels: gold label, serif title, quiet meta, records. */
export function MapPopup({ title, eyebrow, meta, children }: MapPopupProps) {
  return (
    <div className={styles.root}>
      <div className={styles.header}>
        {eyebrow && <Eyebrow tone="accent">{eyebrow}</Eyebrow>}
        <p className={styles.title}>{title}</p>
        {meta && <p className={styles.meta}>{meta}</p>}
      </div>
      {children && <div className={styles.body}>{children}</div>}
    </div>
  );
}
