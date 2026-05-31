// Authorization domain types. These are pure and framework free. They are kept
// separate from Prisma so engines and the authorization core never import the
// database client.

export type Role =
  | "OWNER"
  | "ADMIN"
  | "MANAGER"
  | "SALES_USER"
  | "SERVICE_USER"
  | "MARKETING_USER"
  | "COMPLIANCE_REVIEWER"
  | "VIEWER";

export type MembershipStatus = "ACTIVE" | "INVITED" | "SUSPENDED";

export type Permission =
  | "VIEW_DASHBOARD"
  | "VIEW_INTELLIGENCE"
  | "VIEW_CUSTOMERS"
  | "MANAGE_CUSTOMERS"
  | "VIEW_OPPORTUNITIES"
  | "VIEW_SIGNALS"
  | "VIEW_WORKFLOWS"
  | "VIEW_COMMUNICATIONS"
  | "VIEW_REVENUE"
  | "VIEW_EXECUTIVE_INSIGHTS"
  | "RUN_SIMULATION"
  | "VIEW_SCENARIOS"
  | "VIEW_VERTICAL_PACKS"
  | "VIEW_AUDIT"
  | "VIEW_COMPLIANCE"
  | "MANAGE_SETTINGS"
  | "VIEW_AI_RECOMMENDATIONS"
  | "REVIEW_AI_RECOMMENDATIONS"
  | "VIEW_VOICE";

// The request context every server-side service call receives. It identifies
// the authenticated user, their organization, and their role, plus whether it
// was resolved from a real Clerk session or the demo fallback.
export interface RequestContext {
  userId: string;
  userName: string;
  userEmail: string;
  organizationId: string;
  organizationName: string;
  role: Role;
  source: "clerk" | "demo";
}
