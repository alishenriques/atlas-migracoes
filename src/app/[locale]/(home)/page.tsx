import { Home } from "@/modules/home";

// Collection data changes independently of deploys and is fetched with Axios
// (not Next's `fetch`), so Next can't detect it's dynamic on its own.
export const dynamic = "force-dynamic";

export default function Page() {
  return <Home />;
}
