import type { Metadata } from "next";
import {
  ArrowDown,
  BrainCircuit,
  CheckCircle2,
  MessageSquarePlus,
  Radio,
  Route,
  ShieldCheck,
  Timer,
  UserCog,
} from "lucide-react";
import Link from "next/link";
import { SectionHeading } from "@/components/section-heading";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { WorkflowPlanView } from "@/components/workflow/workflow-plan-view";
import { getShowcaseWorkflow } from "@/lib/services/workflow-service";
import { guardPage } from "@/lib/auth/guard-page";
import type { LucideIcon } from "lucide-react";

export const metadata: Metadata = { title: "Action Graph" };
export const dynamic = "force-dynamic";

interface GraphStep {
  title: string;
  detail: string;
  icon: LucideIcon;
  branch?: string;
}

const steps: GraphStep[] = [
  {
    title: "New lead received",
    detail: "A signal enters the system and updates the customer intelligence graph.",
    icon: Radio,
  },
  {
    title: "Check consent",
    detail: "The policy layer evaluates channel consent, opt-out, and quiet hours.",
    icon: ShieldCheck,
    branch: "Blocked actions stop here and are recorded.",
  },
  {
    title: "Score intent",
    detail: "Signal context produces an intent score used to prioritize the action.",
    icon: BrainCircuit,
  },
  {
    title: "Choose channel",
    detail: "The graph selects SMS, email, voice, or a human task based on preference and policy.",
    icon: Route,
  },
  {
    title: "Generate message",
    detail: "A draft is produced through the mock AI provider. Nothing is sent in Phase 0.",
    icon: MessageSquarePlus,
  },
  {
    title: "Queue follow-up",
    detail: "The action is queued as a simulated communication record.",
    icon: Timer,
  },
  {
    title: "Escalate if needed",
    detail: "High-value or sensitive cases route to a human for review.",
    icon: UserCog,
    branch: "Human review required for medical and high-value leads.",
  },
  {
    title: "Track outcome",
    detail: "Every step emits an audit event linking signal, decision, action, and outcome.",
    icon: CheckCircle2,
  },
];

export default async function ActionGraphPage() {
  const { context, denied } = await guardPage("VIEW_WORKFLOWS");
  if (denied) return denied;

  const showcase = await getShowcaseWorkflow(context);

  return (
    <>
      <SectionHeading
        title="Action graph"
        description="How SignalFlow turns a recommendation into a governed, simulated execution plan. The flow is deterministic and consent first."
      />

      {showcase ? (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold">
              Live workflow: {showcase.plan.customerName}
            </h2>
            <Link
              href={`/customers/${showcase.plan.customerId}`}
              className="text-xs text-primary hover:underline"
            >
              View customer
            </Link>
          </div>
          <WorkflowPlanView plan={showcase.plan} />
        </div>
      ) : null}

      <div>
        <h2 className="text-sm font-semibold">Decision flow</h2>
        <p className="text-xs text-muted-foreground">
          Every workflow follows the same deterministic decision path.
        </p>
      </div>

      <div className="mx-auto max-w-2xl space-y-2">
        {steps.map((step, index) => {
          const Icon = step.icon;
          return (
            <div key={step.title}>
              <Card>
                <CardContent className="flex items-start gap-4 p-4">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/15 text-primary">
                    <Icon className="h-5 w-5" />
                  </span>
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs text-muted-foreground">
                        {String(index + 1).padStart(2, "0")}
                      </span>
                      <p className="text-sm font-semibold">{step.title}</p>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {step.detail}
                    </p>
                    {step.branch ? (
                      <Badge variant="warning" className="mt-1">
                        {step.branch}
                      </Badge>
                    ) : null}
                  </div>
                </CardContent>
              </Card>
              {index < steps.length - 1 ? (
                <div className="flex justify-center py-1">
                  <ArrowDown className="h-4 w-4 text-muted-foreground" />
                </div>
              ) : null}
            </div>
          );
        })}
      </div>
    </>
  );
}
