import type { ReactNode } from "react";

import { TopBar } from "./components/TopBar";
import { CONTENT_ID } from "./constants/menuConfig";

export function Layout({ children }: { children: ReactNode }) {
  return (
    <>
      <TopBar />
      {/* tabIndex -1: the skip link moves focus here, not only the scroll position. */}
      <div id={CONTENT_ID} tabIndex={-1} className="flex flex-1 flex-col outline-none">
        {children}
      </div>
    </>
  );
}
