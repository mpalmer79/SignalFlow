import type { Channel, ConsentState } from "./consent";
import type { VerticalId } from "./vertical-pack";

export type SignalType =
  | "new-lead"
  | "missed-call"
  | "appointment-cancellation"
  | "email-engagement"
  | "recall-opportunity"
  | "estimate-request"
  | "service-due"
  | "consultation-request";

export type SignalPriority = "critical" | "high" | "medium" | "low";

export type SignalSource =
  | "web-form"
  | "phone"
  | "email"
  | "chat"
  | "third-party"
  | "scheduler";

export interface Signal {
  id: string;
  type: SignalType;
  label: string;
  customerId: string;
  customerName: string;
  vertical: VerticalId;
  source: SignalSource;
  priority: SignalPriority;
  recommendedAction: string;
  recommendedChannel: Channel;
  consentStatus: ConsentState;
  detail: string;
  receivedAt: string;
}
