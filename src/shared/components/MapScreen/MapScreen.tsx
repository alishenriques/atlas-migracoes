import type { ReactNode } from "react";

import { Panel } from "@alishenriques/atlas-design-system";

import { styles } from "./styles/index.styles";

/** Room the left column takes from the map on desktop (its width plus the gaps), for maps that fit their content. */
export const SIDE_INSET = 360;
/** Room the right column (`aside`) takes from the map on desktop, likewise. */
export const ASIDE_INSET = 344;

export type MapScreenProps = {
  /** The map, which fills the screen on desktop. */
  map: ReactNode;
  /** Floats above the panel, in the left column (the screen's presentation). */
  intro?: ReactNode;
  /** Floats along the bottom of the map on desktop. */
  footer?: ReactNode;
  /** Floats in a column on the right of the map on desktop, after the panel on mobile. */
  aside?: ReactNode;
  /** Title of the left panel (the controls); left out while they load. */
  title?: string;
  /** Next to the panel title, such as a link to clear the filters. */
  action?: ReactNode;
  /** The panel's content: the controls and lists. */
  children: ReactNode;
};

/**
 * A map screen after the Atlas screens in the project deck: the map fills the screen under the
 * top bar, with no page scroll, and carries floating blocks (`intro` over the panel in the left
 * column, which scrolls inside it, `aside` in a column on the right and `footer` along the bottom).
 * On mobile the blocks stack under the map.
 */
export function MapScreen({ map, intro, footer, aside, title, action, children }: MapScreenProps) {
  return (
    <section className={styles.root}>
      <div className={styles.map}>{map}</div>

      <div className={styles.overlay}>
        <div className={styles.side}>
          {intro && <div className={styles.intro}>{intro}</div>}
          <Panel title={title} className={styles.panel} action={action}>
            {children}
          </Panel>
        </div>
        {aside && <div className={styles.aside}>{aside}</div>}
        {footer && <div className={styles.footer}>{footer}</div>}
      </div>
    </section>
  );
}
