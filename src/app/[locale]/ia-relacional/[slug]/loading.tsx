import { ResearchSkeleton } from "@/modules/research";

// Shown at once while the artist's research loads (the route's Suspense boundary).
export default function Loading() {
  return <ResearchSkeleton />;
}
