"use client";

import dynamic from "next/dynamic";

import { preconnectTiles } from "@/shared/map/preconnect";

import { styles } from "./styles/index.styles";

import type { TrajectoryMapProps } from "./TrajectoryMap";

// MapLibre needs WebGL and the window, so the map only renders in the browser.
const DynamicTrajectoryMap = dynamic(() => import("./TrajectoryMap").then((module) => module.TrajectoryMap), {
  ssr: false,
  loading: () => <div className={styles.loading} />,
});

export function LazyTrajectoryMap(props: TrajectoryMapProps) {
  preconnectTiles();
  return <DynamicTrajectoryMap {...props} />;
}
