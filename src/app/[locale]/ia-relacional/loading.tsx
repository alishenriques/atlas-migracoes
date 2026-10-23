import { ResearchSkeleton } from "@/modules/research";

// Shown at once while the page's data loads (the route's Suspense boundary).
export default function Loading() {
  return <ResearchSkeleton />;
}
