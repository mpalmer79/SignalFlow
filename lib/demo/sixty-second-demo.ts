// Deterministic stage data for the 60 second guided demo. Pure data and types
// only: no React, no Prisma, no provider calls. The player component under
// components/demo renders these stages and drives the timing. Keeping the
// content here means the story can be edited without touching the player.

export type DemoStageId =
  | "signal"
  | "intent"
  | "recommendation"
  | "review"
  | "workflow"
  | "revenue";

// A single labeled fact rendered as a chip. Used for evidence and for the
// governance checks attached to the recommendation.
export interface DemoChip {
  label: string;
  // Optional value rendered after the label, for example a score or a state.
  value?: string;
}

export interface DemoStage {
  id: DemoStageId;
  index: number;
  // Short eyebrow label, for example "Stage 1 of 6".
  kicker: string;
  // The stage name shown in the progress rail and the header.
  label: string;
  headline: string;
  // What SignalFlow is doing at this stage.
  whatHappening: string;
  // Why the stage matters to a revenue team.
  whyItMatters: string;
  // Supporting evidence chips. Empty for stages that carry no evidence.
  evidence: DemoChip[];
  // Governance and policy checks attached to the stage. Empty when none apply.
  governance: DemoChip[];
  // Auto advance time in milliseconds. The review stage waits for input and
  // the revenue stage is terminal, so both use zero.
  autoAdvanceMs: number;
  // True for the human review stage, which pauses auto play for a decision.
  interactive: boolean;
  // True for the final summary stage, which has no next stage.
  terminal: boolean;
}

// The deterministic customer used throughout the demo. Values line up with the
// automotive high intent scenario so the demo and the scenario tell one story.
export const DEMO_CUSTOMER = {
  name: "Jordan Avery",
  vertical: "Automotive",
  detectedAt: "2026-05-30T13:05:00Z",
  intentScore: 84,
  opportunityScore: 78,
  engagementScore: 71,
  estimatedValue: 4200,
} as const;

export const DEMO_STAGES: DemoStage[] = [
  {
    id: "signal",
    index: 0,
    kicker: "Stage 1 of 6",
    label: "Signal detected",
    headline: "A trade appraisal request just arrived",
    whatHappening:
      "SignalFlow captured an inbound signal from the dealer website and turned it into a structured record with a source, a timestamp, and a confidence score.",
    whyItMatters:
      "In a traditional CRM this sits as a row until someone notices. Here it immediately starts a governed decision flow.",
    evidence: [
      { label: "Source", value: "Website trade form" },
      { label: "Received", value: "13:05, today" },
      { label: "Signal confidence", value: "92%" },
      { label: "Customer", value: "Jordan Avery" },
    ],
    governance: [{ label: "Simulated data", value: "No real customer" }],
    autoAdvanceMs: 11000,
    interactive: false,
    terminal: false,
  },
  {
    id: "intent",
    index: 1,
    kicker: "Stage 2 of 6",
    label: "Intent scored",
    headline: "Signals group into a high intent profile",
    whatHappening:
      "The intelligence engine combined recent signals into an intent score of 84, with supporting evidence for why this shopper is ready to talk.",
    whyItMatters:
      "Scoring is deterministic and explainable, so a manager can see exactly why a customer is prioritized rather than trusting a black box.",
    evidence: [
      { label: "Pricing page viewed", value: "3 times" },
      { label: "Trade-in form started" },
      { label: "Service to sales match" },
      { label: "Intent score", value: "84" },
    ],
    governance: [{ label: "Explainable scoring", value: "Evidence attached" }],
    autoAdvanceMs: 13000,
    interactive: false,
    terminal: false,
  },
  {
    id: "recommendation",
    index: 2,
    kicker: "Stage 3 of 6",
    label: "Governed recommendation",
    headline: "A next best action, with controls attached",
    whatHappening:
      "The recommendation engine proposes a same day SMS to offer a trade appraisal and a test drive. The recommendation arrives with consent, policy, and explanation checks already attached.",
    whyItMatters:
      "The AI never acts on its own. Every recommendation carries the checks that decide whether it is even eligible for a human to approve.",
    evidence: [
      { label: "Action", value: "Send trade appraisal SMS" },
      { label: "Channel", value: "SMS" },
      { label: "Confidence", value: "High" },
    ],
    governance: [
      { label: "Consent on file", value: "SMS granted" },
      { label: "Quiet hours", value: "Passed" },
      { label: "Vertical policy", value: "Standard" },
      { label: "Explanation", value: "Attached" },
    ],
    autoAdvanceMs: 13000,
    interactive: false,
    terminal: false,
  },
  {
    id: "review",
    index: 3,
    kicker: "Stage 4 of 6",
    label: "Human review",
    headline: "A person decides before anything happens",
    whatHappening:
      "The recommendation lands in the review queue. Nothing is sent until a human approves it. Approve to continue the high intent path, or reject to see the safe alternate path.",
    whyItMatters:
      "Human review is the control that makes automation safe to deploy. Approval and rejection are both first class, audited outcomes.",
    evidence: [
      { label: "Queue", value: "Awaiting decision" },
      { label: "Reviewer", value: "Sales manager" },
    ],
    governance: [
      { label: "Action held", value: "Nothing sent yet" },
      { label: "Decision audited", value: "Either way" },
    ],
    autoAdvanceMs: 0,
    interactive: true,
    terminal: false,
  },
  {
    id: "workflow",
    index: 4,
    kicker: "Stage 5 of 6",
    label: "Simulated workflow",
    headline: "The approved action flows into a simulated workflow",
    whatHappening:
      "SignalFlow queues a simulated CRM task and a demo follow up. No real message is sent. Every step is recorded against the customer and the opportunity.",
    whyItMatters:
      "The same engine that decides also coordinates the follow up, so the signal turns into action without a person stitching tools together.",
    evidence: [
      { label: "Simulated CRM task created" },
      { label: "Demo follow up queued" },
      { label: "Opportunity stage", value: "Advanced" },
    ],
    governance: [{ label: "No live send", value: "Simulated only" }],
    autoAdvanceMs: 10000,
    interactive: false,
    terminal: false,
  },
  {
    id: "revenue",
    index: 5,
    kicker: "Stage 6 of 6",
    label: "Revenue attribution",
    headline: "The outcome, attributed and audited",
    whatHappening:
      "The simulated follow up produced a booked appraisal. SignalFlow attributes the influenced revenue and closes the loop with a complete audit trail.",
    whyItMatters:
      "Every dollar of influenced revenue traces back through the workflow, the human decision, the recommendation, and the original signal.",
    evidence: [
      { label: "Outcome", value: "Appraisal booked" },
      { label: "Influenced revenue", value: "$4,200" },
    ],
    governance: [{ label: "Audit trail", value: "Complete" }],
    autoAdvanceMs: 0,
    interactive: false,
    terminal: true,
  },
];

export type DemoDecision = "approved" | "rejected";

// When the reviewer rejects the recommendation, the workflow and revenue stages
// tell the safe alternate path. These partial overrides are merged onto the
// base stages by the player, so the alternate copy stays in the data map.
export const DEMO_REJECTED_OVERRIDES: Partial<
  Record<DemoStageId, Partial<DemoStage>>
> = {
  workflow: {
    headline: "The action was declined, and that is recorded too",
    whatHappening:
      "Because the reviewer rejected the recommendation, nothing was sent. SignalFlow logged the decision and routed the customer to a manual nurture path instead.",
    whyItMatters:
      "A rejection is not a dead end. It is a governed outcome that keeps the customer in view without any automated outreach.",
    evidence: [
      { label: "No message sent" },
      { label: "Logged to audit" },
      { label: "Manual nurture queued" },
    ],
    governance: [{ label: "No live send", value: "Nothing left the system" }],
  },
  revenue: {
    headline: "No revenue from this action, and that is the right call",
    whatHappening:
      "The rejected recommendation produced no influenced revenue. The audit trail still records the full story: the signal, the score, the recommendation, and the human decision to decline.",
    whyItMatters:
      "Governance is only credible if rejecting an action is as clean and auditable as approving one. Here it is.",
    evidence: [
      { label: "Outcome", value: "No action taken" },
      { label: "Influenced revenue", value: "$0" },
    ],
    governance: [{ label: "Audit trail", value: "Complete" }],
  },
};

// The summary figures shown on the final screen. The approved and rejected
// paths tell different but equally governed stories.
export interface DemoSummary {
  influencedRevenue: string;
  reviewedActions: string;
  highIntentCustomers: string;
  auditStatus: string;
  outcomeLabel: string;
  outcomeDetail: string;
}

export function buildDemoSummary(decision: DemoDecision): DemoSummary {
  if (decision === "rejected") {
    return {
      influencedRevenue: "$0",
      reviewedActions: "1 reviewed, 1 rejected",
      highIntentCustomers: "1",
      auditStatus: "Complete",
      outcomeLabel: "Action declined, safely",
      outcomeDetail:
        "The reviewer rejected the recommendation. Nothing was sent, the decision was logged to the audit trail, and the customer was routed to a manual nurture path. Governance worked exactly as intended.",
    };
  }
  return {
    influencedRevenue: "$4,200",
    reviewedActions: "1 reviewed, 1 approved",
    highIntentCustomers: "1",
    auditStatus: "Complete",
    outcomeLabel: "Appraisal booked",
    outcomeDetail:
      "The reviewer approved the recommendation. SignalFlow simulated the follow up, advanced the opportunity, and attributed the influenced revenue with a complete audit trail.",
  };
}

// The total nominal length of the auto play story, used for copy. Computed from
// the auto advancing stages only.
export const DEMO_TOTAL_SECONDS = Math.round(
  DEMO_STAGES.reduce((sum, stage) => sum + stage.autoAdvanceMs, 0) / 1000,
);
