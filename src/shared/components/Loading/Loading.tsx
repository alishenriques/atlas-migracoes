import type { ReactNode } from "react";

import { useTranslations } from "next-intl";

export type LoadingProps = {
  /** The skeletons, in the layout of the screen that is loading. */
  children: ReactNode;
  className?: string;
};

/**
 * Holds a screen's skeletons while its data loads. The skeletons are decorative, so this one
 * status region is what tells assistive technology that the content is on its way.
 */
export function Loading({ children, className }: LoadingProps) {
  const t = useTranslations("LOADING");

  return (
    <div role="status" aria-busy="true" className={className}>
      <span className="sr-only">{t("LABEL")}</span>
      {children}
    </div>
  );
}
