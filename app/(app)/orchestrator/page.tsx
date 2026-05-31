import type { Metadata } from "next";
import { SectionHeading } from "@/components/section-heading";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export const metadata: Metadata = { title: "Orchestrator" };

interface WorkflowStep {
  label: string;
  state: "done" | "active" | "blocked" | "waiting";
}

interface DemoWorkflow {
  name: string;
  trigger: string;
  description: string;
  steps: WorkflowStep[];
}

const stateStyles: Record<
  WorkflowStep["state"],
  { label: string; variant: "success" | "primary" | "danger" | "muted" }
> = {
  done: { label: "Done", variant: "success" },
  active: { label: "Active", variant: "primary" },
  blocked: { label: "Blocked", variant: "danger" },
  waiting: { label: "Waiting", variant: "muted" },
};

const workflows: DemoWorkflow[] = [
  {
    name: "Immediate SMS after lead submission",
    trigger: "Trigger: new automotive lead",
    description:
      "Responds to a new lead within seconds when SMS consent is present.",
    steps: [
      { label: "Lead received", state: "done" },
      { label: "Consent check passed", state: "done" },
      { label: "SMS drafted", state: "done" },
      { label: "SMS delivered", state: "active" },
    ],
  },
  {
    name: "Email fallback after no reply",
    trigger: "Trigger: no SMS reply within window",
    description:
      "Falls back to email when an SMS goes unanswered after the wait window.",
    steps: [
      { label: "SMS sent", state: "done" },
      { label: "Wait for reply", state: "done" },
      { label: "Email fallback drafted", state: "active" },
      { label: "Email delivered", state: "waiting" },
    ],
  },
  {
    name: "Human task for high-value lead",
    trigger: "Trigger: estimated value above threshold",
    description:
      "Routes high-value opportunities to a human before any automated send.",
    steps: [
      { label: "Lead scored high value", state: "done" },
      { label: "Routed to human review", state: "active" },
      { label: "Human confirms outreach", state: "waiting" },
    ],
  },
  {
    name: "Voice follow-up after consent approval",
    trigger: "Trigger: voice consent granted",
    description:
      "Queues a simulated voice follow-up once voice consent is confirmed.",
    steps: [
      { label: "Voice consent granted", state: "done" },
      { label: "Call script generated", state: "done" },
      { label: "Simulated call queued", state: "active" },
    ],
  },
  {
    name: "Stop workflow after opt-out",
    trigger: "Trigger: customer replies STOP",
    description:
      "Halts every active step immediately and records the opt-out.",
    steps: [
      { label: "Opt-out received", state: "done" },
      { label: "All steps halted", state: "done" },
      { label: "Outreach blocked", state: "blocked" },
    ],
  },
];

export default function OrchestratorPage() {
  return (
    <>
      <SectionHeading
        title="Orchestrator"
        description="Simulated multi-channel workflows. These illustrate orchestration logic and do not send live messages."
      />
      <div className="grid gap-4 lg:grid-cols-2">
        {workflows.map((workflow) => (
          <Card key={workflow.name}>
            <CardHeader>
              <CardTitle>{workflow.name}</CardTitle>
              <p className="text-xs text-muted-foreground">{workflow.trigger}</p>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">
                {workflow.description}
              </p>
              <ol className="space-y-2">
                {workflow.steps.map((step, index) => {
                  const style = stateStyles[step.state];
                  return (
                    <li
                      key={step.label}
                      className="flex items-center justify-between gap-3 rounded-md border border-border bg-secondary/30 px-3 py-2"
                    >
                      <span className="flex items-center gap-2 text-sm">
                        <span className="font-mono text-xs text-muted-foreground">
                          {index + 1}
                        </span>
                        {step.label}
                      </span>
                      <Badge variant={style.variant}>{style.label}</Badge>
                    </li>
                  );
                })}
              </ol>
            </CardContent>
          </Card>
        ))}
      </div>
    </>
  );
}
