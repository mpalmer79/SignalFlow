import type { Permission, Role } from "@/lib/types/auth";
import { ALL_PERMISSIONS } from "./permissions";

export const ROLE_LABELS: Record<Role, string> = {
  OWNER: "Owner",
  ADMIN: "Admin",
  MANAGER: "Manager",
  SALES_USER: "Sales user",
  SERVICE_USER: "Service user",
  MARKETING_USER: "Marketing user",
  COMPLIANCE_REVIEWER: "Compliance reviewer",
  VIEWER: "Viewer",
};

export const ALL_ROLES = Object.keys(ROLE_LABELS) as Role[];

// Owner only actions are reserved for the organization owner. Admin gets every
// other permission.
const OWNER_ONLY: Permission[] = ["MANAGE_SETTINGS"];

const READ_ONLY: Permission[] = [
  "VIEW_DASHBOARD",
  "VIEW_INTELLIGENCE",
  "VIEW_CUSTOMERS",
  "VIEW_OPPORTUNITIES",
  "VIEW_SIGNALS",
  "VIEW_WORKFLOWS",
  "VIEW_REVENUE",
  "VIEW_VERTICAL_PACKS",
  "VIEW_AI_RECOMMENDATIONS",
  "VIEW_VOICE",
];

// Deterministic role to permission mapping. The authorization core reads from
// this map only, so access decisions are predictable and testable.
export const ROLE_PERMISSIONS: Record<Role, Permission[]> = {
  OWNER: ALL_PERMISSIONS,
  ADMIN: ALL_PERMISSIONS.filter((permission) => !OWNER_ONLY.includes(permission)),
  MANAGER: [
    "VIEW_DASHBOARD",
    "VIEW_INTELLIGENCE",
    "VIEW_CUSTOMERS",
    "MANAGE_CUSTOMERS",
    "VIEW_OPPORTUNITIES",
    "VIEW_SIGNALS",
    "VIEW_WORKFLOWS",
    "VIEW_COMMUNICATIONS",
    "VIEW_REVENUE",
    "VIEW_EXECUTIVE_INSIGHTS",
    "RUN_SIMULATION",
    "VIEW_SCENARIOS",
    "VIEW_VERTICAL_PACKS",
    "VIEW_AI_RECOMMENDATIONS",
    "REVIEW_AI_RECOMMENDATIONS",
    "VIEW_VOICE",
  ],
  SALES_USER: [
    "VIEW_DASHBOARD",
    "VIEW_INTELLIGENCE",
    "VIEW_CUSTOMERS",
    "MANAGE_CUSTOMERS",
    "VIEW_OPPORTUNITIES",
    "VIEW_SIGNALS",
    "VIEW_COMMUNICATIONS",
    "VIEW_WORKFLOWS",
    "VIEW_AI_RECOMMENDATIONS",
    "VIEW_VOICE",
  ],
  SERVICE_USER: [
    "VIEW_DASHBOARD",
    "VIEW_INTELLIGENCE",
    "VIEW_CUSTOMERS",
    "MANAGE_CUSTOMERS",
    "VIEW_OPPORTUNITIES",
    "VIEW_SIGNALS",
    "VIEW_COMMUNICATIONS",
    "VIEW_AI_RECOMMENDATIONS",
    "VIEW_VOICE",
  ],
  MARKETING_USER: [
    "VIEW_DASHBOARD",
    "VIEW_INTELLIGENCE",
    "VIEW_SCENARIOS",
    "RUN_SIMULATION",
    "VIEW_EXECUTIVE_INSIGHTS",
    "VIEW_REVENUE",
    "VIEW_VERTICAL_PACKS",
    "VIEW_AI_RECOMMENDATIONS",
  ],
  COMPLIANCE_REVIEWER: [
    "VIEW_DASHBOARD",
    "VIEW_AUDIT",
    "VIEW_COMPLIANCE",
    "VIEW_COMMUNICATIONS",
    "VIEW_CUSTOMERS",
    "VIEW_AI_RECOMMENDATIONS",
    "REVIEW_AI_RECOMMENDATIONS",
    "VIEW_VOICE",
  ],
  VIEWER: READ_ONLY,
};
