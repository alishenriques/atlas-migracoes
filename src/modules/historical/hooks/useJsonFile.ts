"use client";

import { useEffect, useState } from "react";

import { preload } from "react-dom";

import type { z } from "zod";

export type JsonFileStatus<T> = { status: "loading" } | { status: "error" } | { status: "ready"; data: T };

/**
 * Loads one of the app's static data files once, validated, when the screen
 * opens. `what` names it in the console when it fails ("the historical borders").
 */
export function useJsonFile<T>(url: string, schema: z.ZodType<T>, what: string): JsonFileStatus<T> {
  // Starts the download with the page's HTML instead of after hydration; the fetch below reuses it.
  preload(url, { as: "fetch", crossOrigin: "anonymous" });
  const [result, setResult] = useState<JsonFileStatus<T>>({ status: "loading" });

  useEffect(() => {
    let active = true;
    fetch(url)
      .then((response) => {
        if (!response.ok) throw new Error(`${url}: HTTP ${response.status}`);
        return response.json();
      })
      .then((json: unknown) => {
        if (active) setResult({ status: "ready", data: schema.parse(json) });
      })
      .catch((error: unknown) => {
        console.error(`Failed to load ${what}:`, error instanceof Error ? error.message : error);
        if (active) setResult({ status: "error" });
      });
    return () => {
      active = false;
    };
  }, [url, schema, what]);

  return result;
}
