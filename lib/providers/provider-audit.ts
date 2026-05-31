// Provider audit action vocabulary. These mirror the Prisma ProviderAuditEvent
// action values and the platform audit event types. Pure and framework free.

export type ProviderAuditAction =
  | "PROVIDER_SELECTED"
  | "PROVIDER_BLOCKED_BY_FLAG"
  | "PROVIDER_BLOCKED_BY_COMPLIANCE"
  | "PROVIDER_SANDBOX_RUN"
  | "PROVIDER_READINESS_CHECKED"
  | "FEATURE_FLAG_EVALUATED"
  | "FEATURE_FLAG_UPDATED";

export type ProviderAuditResult = "allowed" | "blocked" | "simulated" | "recorded";

export const PROVIDER_AUDIT_ACTION_LABELS: Record<ProviderAuditAction, string> = {
  PROVIDER_SELECTED: "Provider selected",
  PROVIDER_BLOCKED_BY_FLAG: "Provider blocked by feature flag",
  PROVIDER_BLOCKED_BY_COMPLIANCE: "Provider blocked by compliance",
  PROVIDER_SANDBOX_RUN: "Provider sandbox run",
  PROVIDER_READINESS_CHECKED: "Provider readiness checked",
  FEATURE_FLAG_EVALUATED: "Feature flag evaluated",
  FEATURE_FLAG_UPDATED: "Feature flag updated",
};
