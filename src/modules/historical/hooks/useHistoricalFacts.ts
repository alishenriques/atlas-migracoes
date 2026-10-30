"use client";

import { HISTORICAL_FACTS_URL, historicalFactsFileSchema, type HistoricalFact } from "@/lib/historicalFacts";

import { useJsonFile } from "./useJsonFile";

export type FactsStatus = { status: "loading" } | { status: "error" } | { status: "ready"; facts: HistoricalFact[] };

/** Loads the historical facts file once, validated, when the screen opens. */
export function useHistoricalFacts(): FactsStatus {
  const result = useJsonFile(HISTORICAL_FACTS_URL, historicalFactsFileSchema, "the historical facts");
  return result.status === "ready" ? { status: "ready", facts: result.data.facts } : result;
}
