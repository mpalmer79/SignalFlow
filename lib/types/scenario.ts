import type { VerticalId } from "./vertical-pack";
import type { Customer } from "./customer";
import type { Signal } from "./signal";
import type { Opportunity } from "./opportunity";
import type { CustomerIntelligenceProfile } from "./intelligence";
import type { WorkflowPlan } from "./orchestrator";
import type { OutcomeAssessment } from "./outcome";

// A scenario archetype that a reviewer can launch. Each one configures the
// deterministic generator that produces a believable customer and signal mix.
export interface ScenarioDefinition {
  id: string;
  title: string;
  vertical: VerticalId;
  summary: string;
  // Drives the deterministic generator.
  intentLevel: "high" | "medium" | "low";
  consentState: "granted" | "denied" | "unknown" | "revoked";
  optedOut: boolean;
  hasResponse: boolean;
  signalKeys: string[];
}

export type ScenarioTimelineStage =
  | "signal-created"
  | "signal-classified"
  | "opportunity-created"
  | "workflow-generated"
  | "actions-executed"
  | "outcome-generated"
  | "revenue-attributed";

export interface ScenarioTimelineStep {
  stage: ScenarioTimelineStage;
  title: string;
  detail: string;
}

// The full deterministic result of running one scenario through the engines.
export interface ScenarioResult {
  definition: ScenarioDefinition;
  customer: Customer;
  signals: Signal[];
  opportunity: Opportunity;
  profile: CustomerIntelligenceProfile;
  workflow: WorkflowPlan;
  assessment: OutcomeAssessment;
  timeline: ScenarioTimelineStep[];
}
