import type { VerticalId } from "./vertical-pack";

export type OpportunityStage =
  | "new"
  | "contact-attempted"
  | "engaged"
  | "appointment-set"
  | "needs-human-review"
  | "won"
  | "lost"
  | "dormant"
  | "reactivated";

export interface Opportunity {
  id: string;
  title: string;
  customerId: string;
  customerName: string;
  vertical: VerticalId;
  stage: OpportunityStage;
  intentScore: number;
  estimatedValue: number;
  owner: string;
  updatedAt: string;
}
