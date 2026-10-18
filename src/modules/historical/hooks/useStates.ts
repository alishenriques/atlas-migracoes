"use client";

import { useEffect, useState } from "react";

import { STATES_URL, statesSchema, type States } from "@/lib/cartography";

export type StatesStatus = { status: "loading" } | { status: "error" } | { status: "ready"; states: States };

/** Loads the historical borders file once, validated, when the screen opens. */
export function useStates(): StatesStatus {
  const [result, setResult] = useState<StatesStatus>({ status: "loading" });

  useEffect(() => {
    let active = true;
    fetch(STATES_URL)
      .then((response) => {
        if (!response.ok) throw new Error(`${STATES_URL}: HTTP ${response.status}`);
        return response.json();
      })
      .then((json: unknown) => {
        if (active) setResult({ status: "ready", states: statesSchema.parse(json) });
      })
      .catch((error: unknown) => {
        console.error("Failed to load the historical borders:", error instanceof Error ? error.message : error);
        if (active) setResult({ status: "error" });
      });
    return () => {
      active = false;
    };
  }, []);

  return result;
}
