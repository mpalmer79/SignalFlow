import type { Channel } from "./consent";

export type CommunicationStatus =
  | "drafted"
  | "queued"
  | "sent"
  | "delivered"
  | "replied"
  | "failed"
  | "blocked"
  | "escalated";

export interface Communication {
  id: string;
  channel: Channel;
  customerId: string;
  customerName: string;
  subject: string;
  preview: string;
  status: CommunicationStatus;
  simulated: true;
  relatedSignalId: string | null;
  createdAt: string;
}
