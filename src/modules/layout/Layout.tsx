import type { ReactNode } from "react";

import { TopBar } from "./components/TopBar";

export function Layout({ children }: { children: ReactNode }) {
  return (
    <>
      <TopBar />
      {children}
    </>
  );
}
