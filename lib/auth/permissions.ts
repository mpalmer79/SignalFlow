import type { Permission } from "@/lib/types/auth";

// The full set of permissions, with human readable labels for the settings
// page and authorization explanations.
export const PERMISSION_LABELS: Record<Permission, string> = {
  VIEW_DASHBOARD: "View dashboard",
  VIEW_INTELLIGENCE: "View customer intelligence",
  VIEW_CUSTOMERS: "View customers",
  MANAGE_CUSTOMERS: "Manage customers",
  VIEW_OPPORTUNITIES: "View opportunities",
  VIEW_SIGNALS: "View signals",
  VIEW_WORKFLOWS: "View workflows and orchestration",
  VIEW_COMMUNICATIONS: "View communications",
  VIEW_REVENUE: "View revenue engine",
  VIEW_EXECUTIVE_INSIGHTS: "View executive insights",
  RUN_SIMULATION: "Run simulations and scenarios",
  VIEW_SCENARIOS: "View scenarios",
  VIEW_VERTICAL_PACKS: "View vertical packs",
  VIEW_AUDIT: "View audit trail",
  VIEW_COMPLIANCE: "View compliance and policy decisions",
  MANAGE_SETTINGS: "Manage organization settings",
  VIEW_AI_RECOMMENDATIONS: "View AI recommendations",
  REVIEW_AI_RECOMMENDATIONS: "Review AI recommendations",
};

export const ALL_PERMISSIONS = Object.keys(PERMISSION_LABELS) as Permission[];
