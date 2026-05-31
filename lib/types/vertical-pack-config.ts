import type { Channel } from "./consent";
import type { NormalizedSignalType } from "./intelligence";
import type { VerticalId } from "./vertical-pack";

// A formal, deterministic vertical pack configuration. Packs own their signal
// archetypes, opportunity types, scoring modifiers, workflow assumptions, and
// revenue assumptions. They drive the scenario and simulation engines.

export interface VerticalSignalArchetype {
  normalizedType: NormalizedSignalType;
  label: string;
  detail: string;
  recommendedChannel: Channel;
  // Relative weight used when composing a customer signal mix.
  weight: number;
}

export interface VerticalOpportunityType {
  key: string;
  title: string;
  // Deterministic value band, in whole dollars.
  minValue: number;
  maxValue: number;
}

export interface VerticalScoringModifiers {
  intentBias: number;
  opportunityBias: number;
  engagementBias: number;
}

export interface VerticalWorkflowAssumptions {
  primaryChannel: Channel;
  fallbackChannel: Channel;
  escalateHighValue: boolean;
}

export interface VerticalRevenueAssumptions {
  averageDealValue: number;
  recoveryRate: number;
  missRate: number;
}

export interface VerticalPackConfig {
  id: VerticalId;
  name: string;
  tagline: string;
  objects: string[];
  signalArchetypes: VerticalSignalArchetype[];
  opportunityTypes: VerticalOpportunityType[];
  outcomes: string[];
  recommendedActions: string[];
  scoring: VerticalScoringModifiers;
  workflow: VerticalWorkflowAssumptions;
  revenue: VerticalRevenueAssumptions;
  complianceSensitivity: "standard" | "elevated" | "high";
}
