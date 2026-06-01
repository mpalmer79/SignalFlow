/* SignalFlow demo data, deterministic, fictional. No real customer data. */
window.SF_DATA = {
  org: { name: "Northeast Auto Group", role: "Revenue manager" },

  metrics: [
    { label: "Revenue influenced", value: "$1.24M", hint: "Gross influence estimate", icon: "banknote", tone: "green" },
    { label: "High-intent opportunities", value: "38", hint: "Intent score 60 and above", icon: "target", tone: "blue" },
    { label: "Consent blocked actions", value: "12", hint: "Held by the policy layer", icon: "shield-alert", tone: "amber" },
    { label: "Pending review", value: "7", hint: "Awaiting a human decision", icon: "clipboard-check", tone: "blue" },
  ],

  pipeline: [
    { name: "Signal", meta: "1,284 captured", icon: "bell", color: "#0EA5E9" },
    { name: "Intelligence", meta: "graph updated", icon: "brain-circuit", color: "#6366F1" },
    { name: "AI", meta: "412 recs", icon: "sparkles", color: "#2563EB" },
    { name: "Review", meta: "7 pending", icon: "clipboard-check", color: "#D97706" },
    { name: "Workflow", meta: "simulated", icon: "workflow", color: "#0891B2" },
    { name: "Revenue", meta: "$1.24M", icon: "banknote", color: "#16A34A" },
  ],

  topIntent: [
    { rank: 1, name: "Maria Alvarez", score: 92 },
    { rank: 2, name: "Devon Pratt", score: 88 },
    { rank: 3, name: "Lena Whitfield", score: 84 },
    { rank: 4, name: "Carlos Iniesta", score: 81 },
    { rank: 5, name: "Priya Raman", score: 77 },
  ],

  detected: [
    { type: "Service recall opportunity", who: "Maria Alvarez", conf: 94 },
    { type: "Lease maturity follow-up", who: "Devon Pratt", conf: 88 },
    { type: "Reactivation: dormant 90d", who: "Lena Whitfield", conf: 73 },
  ],

  attention: [
    { name: "Carlos Iniesta", intent: "Purchase Intent", priority: "high" },
    { name: "Priya Raman", intent: "Appointment Intent", priority: "high" },
    { name: "Sam Okafor", intent: "Reactivation Opportunity", priority: "medium" },
  ],

  workflow: [
    { label: "Workflow runs", value: "146", hint: "Persisted simulations", icon: "workflow", tone: "blue" },
    { label: "Actions executed", value: "892", hint: "Simulated, nothing sent", icon: "zap", tone: "green" },
    { label: "Policy blocks", value: "37", hint: "Actions held by policy", icon: "shield-alert", tone: "amber" },
    { label: "Completion rate", value: "81%", hint: "9 escalations", icon: "check-circle-2", tone: "green" },
  ],

  ai: [
    { label: "Recommendations", value: "412", hint: "Deterministic, provider-free", icon: "brain-circuit", tone: "blue" },
    { label: "Pending review", value: "7", hint: "Awaiting a human decision", icon: "shield-question", tone: "amber" },
    { label: "Avg confidence", value: "84", hint: "0 to 100", icon: "gauge", tone: "blue" },
    { label: "Approved", value: "318", hint: "Cleared by human review", icon: "check-circle-2", tone: "green" },
  ],

  industries: [
    { name: "Automotive", rev: 612, rate: 84 },
    { name: "Insurance", rev: 318, rate: 71 },
    { name: "Healthcare", rev: 214, rate: 66 },
    { name: "Home svc", rev: 96, rate: 58 },
  ],

  // Revenue Command Center, one customer story
  replay: {
    customer: "Maria Alvarez",
    vertical: "Automotive",
    summary: "A service-recall signal became a booked appointment and $4,200 of influenced revenue, fully simulated.",
    scores: [
      { label: "Intent", score: 92, tone: "#2563EB" },
      { label: "Opportunity", score: 78, tone: "#16A34A" },
      { label: "Engagement", score: 64, tone: "#D97706" },
    ],
    steps: [
      { time: "09:02", title: "Signal received", text: "Open safety recall matched to Maria's VIN; captured as a structured signal.", state: "done" },
      { time: "09:02", title: "Intelligence updated", text: "Customer graph refreshed: SMS consent allowed, prefers SMS, no quiet-hours conflict.", state: "done" },
      { time: "09:03", title: "AI recommendation", text: "Send service-recall follow-up via SMS. Confidence 87. Rationale attached.", state: "done" },
      { time: "09:04", title: "Human review", text: "Approved by review queue. Recall messaging is policy-sensitive, so it required a person.", state: "done" },
      { time: "09:04", title: "Workflow simulated", text: "SMS drafted and queued in the simulator. Nothing was sent.", state: "active" },
      { time: ", ", title: "Outcome & revenue", text: "Simulated reply books a service appointment. $4,200 influenced revenue attributed.", state: "pending" },
    ],
  },

  // Review queue items
  reviews: [
    {
      id: "rec_8f21a", label: "Send service-recall follow-up", who: "Maria Alvarez", vertical: "automotive",
      channel: "SMS", confidence: 87, tier: "High confidence",
      rationale: [
        "Open safety recall matched to the customer's vehicle.",
        "SMS consent is allowed and SMS is the preferred channel.",
        "No quiet-hours or vertical-sensitivity conflict detected.",
      ],
    },
    {
      id: "rec_3c7b2", label: "Lease maturity outreach", who: "Devon Pratt", vertical: "automotive",
      channel: "Email", confidence: 79, tier: "Medium confidence",
      rationale: [
        "Lease matures in 48 days, inside the renewal window.",
        "Email consent allowed; SMS consent not granted.",
        "Prior positive engagement on two email touches.",
      ],
    },
    {
      id: "rec_5d9e4", label: "Voice reactivation plan", who: "Lena Whitfield", vertical: "automotive",
      channel: "Voice", confidence: 62, tier: "Needs review",
      rationale: [
        "Dormant 92 days; reactivation opportunity detected.",
        "Voice is policy-sensitive and always requires human review.",
        "Confidence below 70, flagged for a careful decision.",
      ],
    },
  ],

  // AI Center recommendations grid
  aiRecs: [
    { label: "Send service-recall follow-up", who: "Maria Alvarez", confidence: 87, state: "Pending review", tier: "High confidence" },
    { label: "Lease maturity outreach", who: "Devon Pratt", confidence: 79, state: "Pending review", tier: "Medium" },
    { label: "Recommend winter service", who: "Carlos Iniesta", confidence: 91, state: "Approved", tier: "High confidence" },
    { label: "Reactivation: dormant 90d", who: "Lena Whitfield", confidence: 62, state: "Needs review", tier: "Low" },
    { label: "Trade-in appraisal nudge", who: "Priya Raman", confidence: 83, state: "Approved", tier: "High confidence" },
    { label: "Policy renewal reminder", who: "Sam Okafor", confidence: 74, state: "Rejected", tier: "Medium" },
  ],

  audit: [
    { who: "Maria Alvarez", action: "Recommendation approved", time: "2m ago", icon: "clipboard-check" },
    { who: "Devon Pratt", action: "Signal captured: lease maturity", time: "11m ago", icon: "bell" },
    { who: "Lena Whitfield", action: "Voice plan held by compliance", time: "18m ago", icon: "shield-alert" },
    { who: "Carlos Iniesta", action: "Workflow simulated to completion", time: "25m ago", icon: "workflow" },
  ],

  nav: [
    { id: "dashboard", label: "Dashboard", icon: "layout-dashboard", desc: "Revenue command center overview" },
    { id: "command", label: "Revenue Command Center", icon: "radar", desc: "Signal to revenue, one story" },
    { id: "ai", label: "AI Center", icon: "sparkles", desc: "Explainable, governed AI recommendations" },
    { id: "review", label: "Review Queue", icon: "clipboard-check", desc: "Human review of AI recommendations" },
  ],
  navSecondary: [
    { id: "intelligence", label: "Intelligence", icon: "brain-circuit" },
    { id: "signals", label: "Signals", icon: "bell" },
    { id: "customers", label: "Customers", icon: "users" },
    { id: "voice", label: "Voice Command Center", icon: "phone-call" },
    { id: "providers", label: "Provider Management", icon: "plug" },
    { id: "executive", label: "Executive Insights", icon: "gauge" },
  ],
};
