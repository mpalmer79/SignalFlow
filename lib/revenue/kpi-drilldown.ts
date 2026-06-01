import { formatCurrency } from "@/lib/utils";

// Deterministic drill-down data for the Revenue Command Center KPI cards. Pure
// data and types only: no React, no Prisma, no network. The page builds these
// from figures already derived from persistence, and the breakdown rows are
// split so they always reconcile to the headline value the card shows. Every
// row is simulated demo data.

export type KpiSection = "today" | "executive" | "lifecycle";

export type KpiTone = "default" | "success" | "warning";

export type ChipTone =
  | "neutral"
  | "info"
  | "success"
  | "warning"
  | "danger";

export interface KpiChip {
  label: string;
  tone: ChipTone;
}

export interface KpiDrilldownRow {
  label: string;
  value: string;
  meta?: string;
  chip?: KpiChip;
}

export interface KpiDrilldown {
  id: string;
  section: KpiSection;
  title: string;
  value: string;
  subtitle: string;
  // Icon key resolved to a Lucide glyph in the client grid and modal.
  icon: string;
  tone: KpiTone;
  period: string;
  description: string;
  columns: string[];
  rows: KpiDrilldownRow[];
  chips?: KpiChip[];
  demoNote: string;
}

export interface KpiDrilldownInput {
  signals: number;
  recommendations: number;
  approvedRecommendations: number;
  rejectedRecommendations: number;
  pendingReview: number;
  revenueInfluenced: number;
  workflowRuns: number;
  positiveOutcomes: number;
  missedOpportunityValue: number;
  criticalMissed: number;
  openOpportunities: number;
  customers: number;
  reactivations: number;
  recoveredOpportunities: number;
  approvalRate: number;
  completionRate: number;
  lifecycleCounts: Record<string, number>;
}

export interface KpiDrilldownGroups {
  today: KpiDrilldown[];
  executive: KpiDrilldown[];
  lifecycle: KpiDrilldown[];
}

const DEMO_NOTE = "Simulated data only. No real customer data.";
const PERIOD_TODAY = "Today, demo organization";
const PERIOD_ORG = "Demo organization";

// Split a whole number into integer buckets by relative weight. The remainder
// is distributed from the first bucket so the parts always sum to the total.
export function splitTotal(total: number, weights: number[]): number[] {
  const weightSum = weights.reduce((sum, weight) => sum + weight, 0);
  if (weightSum <= 0) return weights.map(() => 0);
  const parts = weights.map((weight) =>
    Math.floor((total * weight) / weightSum),
  );
  let used = parts.reduce((sum, part) => sum + part, 0);
  let index = 0;
  while (used < total && parts.length > 0) {
    parts[index % parts.length] += 1;
    used += 1;
    index += 1;
  }
  return parts;
}

function pct(part: number, total: number): string {
  if (total <= 0) return "0%";
  return `${Math.round((part / total) * 100)}%`;
}

// ---- today: hero summary cards -------------------------------------------

function signalRows(total: number): KpiDrilldownRow[] {
  const labels = [
    "Pricing page views",
    "Trade-in starts",
    "Service to sales matches",
    "Appointment activity",
    "Inventory saves",
  ];
  const parts = splitTotal(total, [30, 22, 18, 16, 14]);
  return labels.map((label, i) => ({
    label,
    value: String(parts[i]),
    meta: `${pct(parts[i], total)} of signals`,
  }));
}

function recommendationRows(total: number): KpiDrilldownRow[] {
  const labels = [
    "Follow up outreach",
    "Schedule appointment",
    "Reactivate dormant",
    "Escalate to human",
    "Send appraisal offer",
  ];
  const parts = splitTotal(total, [32, 26, 18, 12, 12]);
  return labels.map((label, i) => ({
    label,
    value: String(parts[i]),
    meta: `${pct(parts[i], total)} of recommendations`,
  }));
}

function revenueRows(total: number): KpiDrilldownRow[] {
  const sources = [
    { name: "Trade appraisal booked", signal: "Trade-in form", note: "Direct attribution" },
    { name: "Test drive scheduled", signal: "Pricing page", note: "Direct attribution" },
    { name: "Service to sales convert", signal: "Service visit", note: "Assisted attribution" },
    { name: "Reactivated buyer", signal: "Dormant outreach", note: "Recovered revenue" },
    { name: "Inventory match win", signal: "Inventory save", note: "Assisted attribution" },
  ];
  const parts = splitTotal(total, [28, 24, 20, 16, 12]);
  return sources.map((source, i) => ({
    label: source.name,
    value: formatCurrency(parts[i]),
    meta: `${source.signal} | ${source.note}`,
  }));
}

function workflowRows(total: number, positive: number): KpiDrilldownRow[] {
  const positiveShare = Math.min(positive, total);
  const labels = [
    { name: "Appointment follow up", chip: chip("Positive outcome", "success") },
    { name: "Appraisal nurture", chip: chip("Positive outcome", "success") },
    { name: "Reactivation sequence", chip: chip("Completed", "info") },
    { name: "Service reminder", chip: chip("Completed", "info") },
    { name: "Escalation handoff", chip: chip("Held for review", "warning") },
  ];
  const parts = splitTotal(total, [30, 24, 18, 16, 12]);
  return labels.map((entry, i) => ({
    label: entry.name,
    value: String(parts[i]),
    meta:
      i < 2
        ? "Simulated task created"
        : "Simulated, nothing sent",
    chip: entry.chip,
    ...(i === 0 ? { meta: `${positiveShare} positive outcomes recorded` } : {}),
  }));
}

function missedRows(total: number, critical: number): KpiDrilldownRow[] {
  const rows = [
    { name: "Stalled high intent buyer", reason: "No reply after 3 attempts", risk: chip("Critical", "danger") },
    { name: "Quiet hours block", reason: "Outreach paused by policy", risk: chip("High", "warning") },
    { name: "Consent not on file", reason: "Channel blocked by consent", risk: chip("High", "warning") },
    { name: "Dormant opportunity", reason: "No recent engagement", risk: chip("Medium", "neutral") },
    { name: "Unworked service lead", reason: "Awaiting assignment", risk: chip("Medium", "neutral") },
  ];
  const parts = splitTotal(total, [34, 24, 18, 14, 10]);
  return rows.map((row, i) => ({
    label: row.name,
    value: formatCurrency(parts[i]),
    meta:
      i === 0 ? `${critical} critical at risk | ${row.reason}` : row.reason,
    chip: row.risk,
  }));
}

function openOppRows(total: number): KpiDrilldownRow[] {
  const stages = [
    { name: "New lead", intent: "Intent 70 to 90", owner: "Sales desk", review: chip("Next best action queued", "info") },
    { name: "Engaged", intent: "Intent 55 to 80", owner: "Sales desk", review: chip("In review", "warning") },
    { name: "Contact attempted", intent: "Intent 40 to 65", owner: "Service desk", review: chip("Awaiting reply", "neutral") },
    { name: "Appraisal pending", intent: "Intent 60 to 85", owner: "Sales desk", review: chip("Scheduled", "success") },
    { name: "Reactivation", intent: "Intent 30 to 55", owner: "Reactivation desk", review: chip("Nurturing", "neutral") },
  ];
  const parts = splitTotal(total, [26, 24, 20, 16, 14]);
  return stages.map((stage, i) => ({
    label: stage.name,
    value: String(parts[i]),
    meta: `${stage.intent} | ${stage.owner}`,
    chip: stage.review,
  }));
}

// ---- executive cards ------------------------------------------------------

function customerSegmentRows(total: number): KpiDrilldownRow[] {
  const labels = [
    "High intent active",
    "Engaged nurturing",
    "Service to sales",
    "Dormant watch",
    "Compliance hold",
  ];
  const parts = splitTotal(total, [24, 28, 20, 18, 10]);
  return labels.map((label, i) => ({
    label,
    value: String(parts[i]),
    meta: `${pct(parts[i], total)} of customers`,
  }));
}

function reactivationRows(total: number): KpiDrilldownRow[] {
  const examples = [
    { name: "Dormant trade-in lead", note: "Re-engaged after appraisal nudge" },
    { name: "Lapsed service customer", note: "Booked a sales conversation" },
    { name: "Expired quote holder", note: "Returned through pricing offer" },
    { name: "Cold inventory saver", note: "Reactivated on inventory match" },
    { name: "Past no show", note: "Rebooked an appointment" },
    { name: "Stalled financing lead", note: "Resumed after follow up" },
  ];
  const count = Math.max(0, Math.min(total, examples.length));
  return examples.slice(0, count).map((example) => ({
    label: example.name,
    value: "Reactivated",
    meta: example.note,
    chip: chip("Recovered", "success"),
  }));
}

function reviewStateRows(
  approved: number,
  rejected: number,
  pending: number,
  escalated: number,
): KpiDrilldownRow[] {
  return [
    { label: "Approved", value: String(approved), chip: chip("Cleared", "success") },
    { label: "Rejected", value: String(rejected), chip: chip("Declined", "danger") },
    { label: "Escalated", value: String(escalated), chip: chip("Routed to human", "warning") },
    { label: "Waiting", value: String(pending), chip: chip("Pending review", "neutral") },
  ];
}

// ---- lifecycle cards ------------------------------------------------------

function lifecycleRows(
  total: number,
  rows: { label: string; weight: number; chip?: KpiChip }[],
): KpiDrilldownRow[] {
  const parts = splitTotal(total, rows.map((row) => row.weight));
  return rows.map((row, i) => ({
    label: row.label,
    value: String(parts[i]),
    meta: `${pct(parts[i], total)} of stage`,
    chip: row.chip,
  }));
}

function chip(label: string, tone: ChipTone): KpiChip {
  return { label, tone };
}

// Build every KPI drill-down grouped by section. Values mirror the card faces.
export function buildKpiDrilldowns(input: KpiDrilldownInput): KpiDrilldownGroups {
  const escalated = Math.max(
    0,
    input.recommendations -
      input.approvedRecommendations -
      input.rejectedRecommendations -
      input.pendingReview,
  );
  const lc = input.lifecycleCounts;

  const today: KpiDrilldown[] = [
    {
      id: "today-signals",
      section: "today",
      title: "Signals analyzed",
      value: String(input.signals),
      subtitle: `${input.customers} customer profiles`,
      icon: "Bell",
      tone: "default",
      period: PERIOD_TODAY,
      description:
        "Inbound revenue and risk events captured from monitored channels and grouped by source.",
      columns: ["Source", "Signals", "Share"],
      rows: signalRows(input.signals),
      chips: [chip("All verticals", "info"), chip("Deterministic", "neutral")],
      demoNote: DEMO_NOTE,
    },
    {
      id: "today-recommendations",
      section: "today",
      title: "AI recommendations",
      value: String(input.recommendations),
      subtitle: `${input.approvalRate}% approval, ${input.pendingReview} pending review`,
      icon: "BrainCircuit",
      tone: "default",
      period: PERIOD_TODAY,
      description:
        "Governed next best actions by type. Each recommendation carries a confidence band and a policy status before any human review.",
      columns: ["Recommendation type", "Count", "Share"],
      rows: recommendationRows(input.recommendations),
      chips: [
        chip(`${input.approvedRecommendations} approved`, "success"),
        chip(`${input.rejectedRecommendations} rejected`, "danger"),
        chip(`${input.pendingReview} pending`, "warning"),
      ],
      demoNote: DEMO_NOTE,
    },
    {
      id: "today-revenue",
      section: "today",
      title: "Revenue influenced",
      value: formatCurrency(input.revenueInfluenced),
      subtitle: `${input.recoveredOpportunities} recovered, ${input.reactivations} reactivated`,
      icon: "Banknote",
      tone: "success",
      period: PERIOD_TODAY,
      description:
        "Influenced revenue broken out by the opportunity that produced it, with the source signal and attribution note.",
      columns: ["Opportunity", "Influenced", "Source and attribution"],
      rows: revenueRows(input.revenueInfluenced),
      chips: [chip("Influenced", "success"), chip("Assisted and recovered", "info")],
      demoNote: DEMO_NOTE,
    },
    {
      id: "today-workflow",
      section: "today",
      title: "Workflow runs",
      value: String(input.workflowRuns),
      subtitle: `${input.completionRate}% positive outcomes`,
      icon: "Workflow",
      tone: "default",
      period: PERIOD_TODAY,
      description:
        "Simulated workflow executions by type. Tasks are created in the demo only and nothing is ever sent.",
      columns: ["Workflow type", "Runs", "Status"],
      rows: workflowRows(input.workflowRuns, input.positiveOutcomes),
      chips: [
        chip(`${input.positiveOutcomes} positive`, "success"),
        chip("Simulated only", "warning"),
      ],
      demoNote: DEMO_NOTE,
    },
    {
      id: "today-missed",
      section: "today",
      title: "Missed revenue",
      value: formatCurrency(input.missedOpportunityValue),
      subtitle: `${input.criticalMissed} critical`,
      icon: "TrendingDown",
      tone: "warning",
      period: PERIOD_TODAY,
      description:
        "Estimated value of opportunities that stalled, with the reason and a risk level for each.",
      columns: ["Stalled opportunity", "Estimated value", "Reason and risk"],
      rows: missedRows(input.missedOpportunityValue, input.criticalMissed),
      chips: [chip(`${input.criticalMissed} critical`, "danger"), chip("At risk", "warning")],
      demoNote: DEMO_NOTE,
    },
    {
      id: "today-open-opportunities",
      section: "today",
      title: "Open opportunities",
      value: String(input.openOpportunities),
      subtitle: "In flight across all verticals",
      icon: "TrendingUp",
      tone: "default",
      period: PERIOD_TODAY,
      description:
        "Open opportunities by stage, with intent score range, owning desk, and the next review state.",
      columns: ["Stage", "Count", "Intent and owner"],
      rows: openOppRows(input.openOpportunities),
      chips: [chip("In flight", "info")],
      demoNote: DEMO_NOTE,
    },
  ];

  const executive: KpiDrilldown[] = [
    {
      id: "exec-customers",
      section: "executive",
      title: "Customers",
      value: String(input.customers),
      subtitle: `${input.openOpportunities} open opportunities`,
      icon: "Users",
      tone: "default",
      period: PERIOD_ORG,
      description:
        "Customer profiles grouped into working segments across all vertical packs.",
      columns: ["Segment", "Customers", "Share"],
      rows: customerSegmentRows(input.customers),
      chips: [chip("Organization scoped", "neutral")],
      demoNote: DEMO_NOTE,
    },
    {
      id: "exec-signals",
      section: "executive",
      title: "Signals",
      value: String(input.signals),
      subtitle: "Across all vertical packs",
      icon: "Bell",
      tone: "default",
      period: PERIOD_ORG,
      description:
        "All captured signals grouped by source across the organization.",
      columns: ["Source", "Signals", "Share"],
      rows: signalRows(input.signals),
      chips: [chip("All verticals", "info")],
      demoNote: DEMO_NOTE,
    },
    {
      id: "exec-recommendations",
      section: "executive",
      title: "Recommendations",
      value: String(input.recommendations),
      subtitle: `${input.pendingReview} awaiting review`,
      icon: "BrainCircuit",
      tone: "default",
      period: PERIOD_ORG,
      description:
        "Governed recommendations by type, with approval status summarized in the chips.",
      columns: ["Recommendation type", "Count", "Share"],
      rows: recommendationRows(input.recommendations),
      chips: [
        chip(`${input.approvedRecommendations} approved`, "success"),
        chip(`${input.rejectedRecommendations} rejected`, "danger"),
        chip(`${input.pendingReview} pending`, "warning"),
      ],
      demoNote: DEMO_NOTE,
    },
    {
      id: "exec-workflow",
      section: "executive",
      title: "Workflow runs",
      value: String(input.workflowRuns),
      subtitle: `${input.completionRate}% positive`,
      icon: "Workflow",
      tone: "success",
      period: PERIOD_ORG,
      description:
        "Simulated workflow executions by type. Nothing is sent in demo mode.",
      columns: ["Workflow type", "Runs", "Status"],
      rows: workflowRows(input.workflowRuns, input.positiveOutcomes),
      chips: [chip(`${input.positiveOutcomes} positive`, "success"), chip("Simulated only", "warning")],
      demoNote: DEMO_NOTE,
    },
    {
      id: "exec-revenue",
      section: "executive",
      title: "Revenue influenced",
      value: formatCurrency(input.revenueInfluenced),
      subtitle: `${input.recoveredOpportunities} recovered`,
      icon: "Banknote",
      tone: "success",
      period: PERIOD_ORG,
      description:
        "Influenced revenue by contributing opportunity, with source signal and attribution note.",
      columns: ["Opportunity", "Influenced", "Source and attribution"],
      rows: revenueRows(input.revenueInfluenced),
      chips: [chip("Influenced", "success"), chip("Assisted and recovered", "info")],
      demoNote: DEMO_NOTE,
    },
    {
      id: "exec-reactivations",
      section: "executive",
      title: "Reactivations",
      value: String(input.reactivations),
      subtitle: "Dormant to reactivated",
      icon: "RotateCcw",
      tone: "success",
      period: PERIOD_ORG,
      description:
        "Dormant customers that re-engaged through a governed, simulated follow up.",
      columns: ["Customer", "State", "Detail"],
      rows: reactivationRows(input.reactivations),
      chips: [chip("Recovered", "success")],
      demoNote: DEMO_NOTE,
    },
    {
      id: "exec-missed",
      section: "executive",
      title: "Missed revenue",
      value: formatCurrency(input.missedOpportunityValue),
      subtitle: `${input.criticalMissed} critical`,
      icon: "TrendingDown",
      tone: "warning",
      period: PERIOD_ORG,
      description:
        "Estimated value of stalled opportunities, with the reason and risk level for each.",
      columns: ["Stalled opportunity", "Estimated value", "Reason and risk"],
      rows: missedRows(input.missedOpportunityValue, input.criticalMissed),
      chips: [chip(`${input.criticalMissed} critical`, "danger"), chip("At risk", "warning")],
      demoNote: DEMO_NOTE,
    },
    {
      id: "exec-approval-rate",
      section: "executive",
      title: "Approval rate",
      value: `${input.approvalRate}%`,
      subtitle: "Of reviewed recommendations",
      icon: "CheckCircle2",
      tone: "default",
      period: PERIOD_ORG,
      description:
        "Approval rate is approved divided by reviewed, where reviewed is approved plus rejected. Pending and escalated are shown for context.",
      columns: ["Review state", "Count", "Status"],
      rows: reviewStateRows(
        input.approvedRecommendations,
        input.rejectedRecommendations,
        input.pendingReview,
        escalated,
      ),
      chips: [
        chip(`${input.approvalRate}% approval`, "success"),
        chip(`${input.approvedRecommendations + input.rejectedRecommendations} reviewed`, "info"),
      ],
      demoNote: DEMO_NOTE,
    },
  ];

  const lifecycle: KpiDrilldown[] = [
    {
      id: "life-signals",
      section: "lifecycle",
      title: "Signal received",
      value: String(lc.signals ?? 0),
      subtitle: "Inbound revenue and risk events.",
      icon: "Bell",
      tone: "default",
      period: PERIOD_ORG,
      description: "Inbound signals entering the lifecycle, grouped by source.",
      columns: ["Source", "Signals", "Share"],
      rows: signalRows(lc.signals ?? 0),
      chips: [chip("Stage 1 of 7", "info")],
      demoNote: DEMO_NOTE,
    },
    {
      id: "life-intelligence",
      section: "lifecycle",
      title: "Intelligence built",
      value: String(lc.intelligence ?? 0),
      subtitle: "Intent, opportunity, and engagement scored.",
      icon: "BrainCircuit",
      tone: "default",
      period: PERIOD_ORG,
      description: "Customer profiles scored into intent bands during intelligence build.",
      columns: ["Intent band", "Profiles", "Share"],
      rows: lifecycleRows(lc.intelligence ?? 0, [
        { label: "High intent", weight: 30, chip: chip("60 and above", "success") },
        { label: "Medium intent", weight: 38, chip: chip("40 to 59", "info") },
        { label: "Low intent", weight: 22, chip: chip("Below 40", "neutral") },
        { label: "Risk flagged", weight: 10, chip: chip("Needs care", "warning") },
      ]),
      chips: [chip("Stage 2 of 7", "info")],
      demoNote: DEMO_NOTE,
    },
    {
      id: "life-recommendation",
      section: "lifecycle",
      title: "AI recommendation",
      value: String(lc.recommendation ?? 0),
      subtitle: "Deterministic, provider free.",
      icon: "Sparkles",
      tone: "default",
      period: PERIOD_ORG,
      description: "Recommendations produced at the recommendation stage, by type.",
      columns: ["Recommendation type", "Count", "Share"],
      rows: recommendationRows(lc.recommendation ?? 0),
      chips: [chip("Stage 3 of 7", "info")],
      demoNote: DEMO_NOTE,
    },
    {
      id: "life-review",
      section: "lifecycle",
      title: "Human review",
      value: String(lc.review ?? 0),
      subtitle: "Approved, rejected, or escalated by a human.",
      icon: "ClipboardCheck",
      tone: "warning",
      period: PERIOD_ORG,
      description: "Recommendations that reached human review, by decision state.",
      columns: ["Review state", "Count", "Share"],
      rows: lifecycleRows(lc.review ?? 0, [
        { label: "Approved", weight: 46, chip: chip("Cleared", "success") },
        { label: "Rejected", weight: 22, chip: chip("Declined", "danger") },
        { label: "Escalated", weight: 16, chip: chip("Routed to human", "warning") },
        { label: "Waiting", weight: 16, chip: chip("Pending", "neutral") },
      ]),
      chips: [chip("Stage 4 of 7", "info")],
      demoNote: DEMO_NOTE,
    },
    {
      id: "life-workflow",
      section: "lifecycle",
      title: "Workflow executed",
      value: String(lc.workflow ?? 0),
      subtitle: "Simulated only. No live communication.",
      icon: "Workflow",
      tone: "default",
      period: PERIOD_ORG,
      description: "Workflows executed at the workflow stage, by type. Simulated only.",
      columns: ["Workflow type", "Runs", "Status"],
      rows: workflowRows(lc.workflow ?? 0, input.positiveOutcomes),
      chips: [chip("Stage 5 of 7", "info")],
      demoNote: DEMO_NOTE,
    },
    {
      id: "life-outcome",
      section: "lifecycle",
      title: "Outcome recorded",
      value: String(lc.outcome ?? 0),
      subtitle: "Replies, advances, wins, and dormancies.",
      icon: "CheckCircle2",
      tone: "success",
      period: PERIOD_ORG,
      description: "Recorded outcome events at the outcome stage, by type.",
      columns: ["Outcome type", "Count", "Share"],
      rows: lifecycleRows(lc.outcome ?? 0, [
        { label: "Appointment booked", weight: 28, chip: chip("Positive", "success") },
        { label: "Customer replied", weight: 26, chip: chip("Positive", "success") },
        { label: "Opportunity advanced", weight: 22, chip: chip("Positive", "success") },
        { label: "Went dormant", weight: 14, chip: chip("Negative", "warning") },
        { label: "No response", weight: 10, chip: chip("Negative", "neutral") },
      ]),
      chips: [chip("Stage 6 of 7", "info")],
      demoNote: DEMO_NOTE,
    },
    {
      id: "life-attribution",
      section: "lifecycle",
      title: "Revenue attributed",
      value: String(lc.attribution ?? 0),
      subtitle: "Influenced, recovered, and assisted records.",
      icon: "Banknote",
      tone: "success",
      period: PERIOD_ORG,
      description: "Attribution records created at the final stage, by attribution type.",
      columns: ["Attribution type", "Records", "Share"],
      rows: lifecycleRows(lc.attribution ?? 0, [
        { label: "Direct influenced", weight: 44, chip: chip("Influenced", "success") },
        { label: "Assisted", weight: 32, chip: chip("Assisted", "info") },
        { label: "Recovered", weight: 24, chip: chip("Recovered", "success") },
      ]),
      chips: [chip("Stage 7 of 7", "info")],
      demoNote: DEMO_NOTE,
    },
  ];

  return { today, executive, lifecycle };
}
