import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { SectionHeading } from "@/components/section-heading";
import { WorkflowRunView } from "@/components/workflow/workflow-run-view";
import { getWorkflowRunDetail } from "@/lib/services/workflow-service";

export const metadata: Metadata = { title: "Workflow Run" };
export const dynamic = "force-dynamic";

export default async function WorkflowRunPage({
  params,
}: {
  params: { id: string };
}) {
  const detail = await getWorkflowRunDetail(params.id);

  if (!detail) {
    notFound();
  }

  return (
    <>
      <Link
        href="/orchestrator"
        className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-3.5 w-3.5" />
        Back to orchestrator
      </Link>

      <SectionHeading
        title={`Workflow run for ${detail.run.customerName}`}
        description="A persisted, simulated workflow run with its action graph, policy decisions, and execution timeline."
      />

      <WorkflowRunView run={detail.run} timeline={detail.timeline} />

      <Link
        href={`/customers/${detail.run.customerId}`}
        className="text-xs text-primary hover:underline"
      >
        View customer profile
      </Link>
    </>
  );
}
