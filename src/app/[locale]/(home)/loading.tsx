import { HomeSkeleton } from "@/modules/home";

// Shown at once while the page's data loads (the route's Suspense boundary).
export default function Loading() {
  return <HomeSkeleton />;
}
