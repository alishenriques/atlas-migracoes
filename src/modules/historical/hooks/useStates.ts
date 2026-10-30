"use client";

import { STATES_URL, statesSchema, type States } from "@/lib/cartography";

import { useJsonFile } from "./useJsonFile";

export type StatesStatus = { status: "loading" } | { status: "error" } | { status: "ready"; states: States };

/** Loads the historical borders file once, validated, when the screen opens. */
export function useStates(): StatesStatus {
  const result = useJsonFile(STATES_URL, statesSchema, "the historical borders");
  return result.status === "ready" ? { status: "ready", states: result.data } : result;
}
