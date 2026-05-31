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
import { SectionHeading } from "@/components/section-heading";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { LucideIcon } from "lucide-react";

export const metadata: Metadata = { title: "Action Graph" };

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

export default function ActionGraphPage() {
  return (
    <>
      <SectionHeading
        title="Action graph"
        description="How SignalFlow decides what happens next. The flow is deterministic and consent first."
      />

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
