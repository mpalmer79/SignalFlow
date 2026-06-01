import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { SectionHeading } from "@/components/section-heading";
import { SixtySecondDemoPlayer } from "@/components/demo/sixty-second-demo-player";
import { guardPage } from "@/lib/auth/guard-page";

export const metadata: Metadata = { title: "60-second demo" };
export const dynamic = "force-dynamic";

// The canonical guided product demo. It auto plays through six stages, pauses
// for a human review decision, and ends on a summary screen. The longer, static
// scenario walkthrough still lives at /scenarios/automotive-high-intent for
// reviewers who want to inspect each engine in depth.
export default async function DemoPage() {
  const { denied } = await guardPage("VIEW_SCENARIOS");
  if (denied) return denied;

  return (
    <>
      <Link
        href="/"
        className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-3.5 w-3.5" />
        Back to home
      </Link>

      <SectionHeading
        title="The 60-second demo"
        description="Watch one customer signal move from detection to a governed recommendation, human review, a simulated workflow, and attributed revenue. It plays automatically. Pause, restart, or step through it yourself at any time."
        actions={<Badge variant="primary">Guided product demo</Badge>}
      />

      <SixtySecondDemoPlayer />

      <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
        <span>Want the in depth version?</span>
        <Link
          href="/scenarios/automotive-high-intent"
          className="inline-flex items-center gap-1 text-primary hover:underline"
        >
          Open the full scenario walkthrough
          <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      </div>
    </>
  );
}
