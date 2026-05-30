import type { Channel } from "./consent";
import type { VerticalId } from "./vertical-pack";

export interface CustomerChannelInfo {
  channel: Channel;
  value: string;
  consent: "granted" | "denied" | "unknown" | "revoked";
}

export interface CustomerRiskFlag {
  label: string;
  severity: "info" | "warning" | "critical";
}

export interface Customer {
  id: string;
  name: string;
  vertical: VerticalId;
  channels: CustomerChannelInfo[];
  preferredChannel: Channel;
  optedOut: boolean;
  recentSignals: string[];
  activeOpportunity: string | null;
  lastAction: string;
  lastActionAt: string;
  riskFlags: CustomerRiskFlag[];
}
