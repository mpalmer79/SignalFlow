import type {
  ProviderStatus,
} from "@/lib/providers/provider-registry";
import type { ReadinessStatus } from "@/lib/providers/provider-readiness";
import type { FeatureFlagState } from "@/lib/feature-flags/feature-flag-types";

type Variant = "success" | "danger" | "warning" | "primary" | "muted";

export const providerStatusStyles: Record<
  ProviderStatus,
  { label: string; variant: Variant }
> = {
  mocked: { label: "Mocked", variant: "primary" },
  "future-ready": { label: "Future ready", variant: "muted" },
  disabled: { label: "Disabled", variant: "muted" },
  blocked: { label: "Blocked", variant: "danger" },
};

export const readinessStyles: Record<
  ReadinessStatus,
  { label: string; variant: Variant }
> = {
  "live-ready": { label: "Live ready", variant: "success" },
  "sandbox-ready": { label: "Sandbox ready", variant: "primary" },
  "not-ready": { label: "Not live ready", variant: "muted" },
};

export const flagStateStyles: Record<
  FeatureFlagState,
  { label: string; variant: Variant }
> = {
  allowed: { label: "Allowed", variant: "success" },
  blocked: { label: "Blocked", variant: "danger" },
  disabled: { label: "Disabled", variant: "muted" },
  "requires-configuration": { label: "Requires configuration", variant: "warning" },
  "requires-approval": { label: "Requires approval", variant: "warning" },
};
