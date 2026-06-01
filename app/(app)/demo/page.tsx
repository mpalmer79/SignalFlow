import { redirect } from "next/navigation";

// The walkthrough lives at /scenarios/automotive-high-intent now, which is the
// canonical 60-second guided demo. /demo stays as a stable entry point and
// redirects to that scenario so links shared earlier continue to work and there
// is one story, not two.
export const dynamic = "force-dynamic";

export default function DemoRedirectPage() {
  redirect("/scenarios/automotive-high-intent");
}
