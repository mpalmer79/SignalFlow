export type Channel = "sms" | "email" | "voice" | "human";

export type ConsentState = "granted" | "denied" | "unknown" | "revoked";

export interface ChannelConsent {
  channel: Channel;
  state: ConsentState;
  capturedAt: string | null;
  source: string;
}

export interface ConsentProfile {
  customerId: string;
  channels: ChannelConsent[];
  optedOut: boolean;
  quietHours: {
    start: string;
    end: string;
    timezone: string;
  };
}
