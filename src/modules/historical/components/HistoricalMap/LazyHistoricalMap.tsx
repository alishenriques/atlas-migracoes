"use client";

import dynamic from "next/dynamic";

import { preconnectTiles } from "@/shared/map/preconnect";

import { styles } from "./styles/index.styles";

import type { HistoricalMapProps } from "./HistoricalMap";

// MapLibre needs WebGL and the window, so the map only renders in the browser.
const DynamicHistoricalMap = dynamic(() => import("./HistoricalMap").then((module) => module.HistoricalMap), {
  ssr: false,
  loading: () => <div className={styles.loading} />,
});

export function LazyHistoricalMap(props: HistoricalMapProps) {
  preconnectTiles();
  return <DynamicHistoricalMap {...props} />;
}
