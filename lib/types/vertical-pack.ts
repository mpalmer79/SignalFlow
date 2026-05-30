export type VerticalId =
  | "automotive"
  | "dental"
  | "medical"
  | "home-services"
  | "legal-intake"
  | "insurance";

export type ComplianceSensitivity = "standard" | "elevated" | "high";

export type PackPhaseStatus =
  | "mvp-focus"
  | "planned"
  | "in-design"
  | "research";

export interface VerticalPack {
  id: VerticalId;
  name: string;
  summary: string;
  keySignals: string[];
  keyActions: string[];
  complianceSensitivity: ComplianceSensitivity;
  phaseStatus: PackPhaseStatus;
}
