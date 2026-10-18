"use client";

import dynamic from "next/dynamic";

import { styles } from "./styles/index.styles";

// MapLibre needs WebGL and the window, so the map only renders in the browser.
export const LazyTrajectoryMap = dynamic(() => import("./TrajectoryMap").then((module) => module.TrajectoryMap), {
  ssr: false,
  loading: () => <div className={styles.loading} />,
});
