"use client";

import { createContext, useContext, useTransition, type ReactNode, type TransitionStartFunction } from "react";

import { ResearchResultsSkeleton } from "../ResearchResultsSkeleton";

type Transition = { pending: boolean; start: TransitionStartFunction };

const ResearchTransitionContext = createContext<Transition | null>(null);

/**
 * Shares the navigation that follows choosing an artist between the picker, which starts it, and
 * the results, which give way to their skeleton until it lands. Without this the previous artist's
 * findings would stay on screen until the whole new page arrived.
 */
export function ResearchTransition({ children }: { children: ReactNode }) {
  const [pending, start] = useTransition();
  return <ResearchTransitionContext value={{ pending, start }}>{children}</ResearchTransitionContext>;
}

/** The screen's transition, or one of the caller's own outside ResearchTransition. */
export function useResearchTransition(): Transition {
  const [pending, start] = useTransition();
  return useContext(ResearchTransitionContext) ?? { pending, start };
}

/** The results, or their skeleton while another artist is on the way. */
export function PendingResults({ children }: { children: ReactNode }) {
  const { pending } = useResearchTransition();
  return pending ? <ResearchResultsSkeleton /> : children;
}
