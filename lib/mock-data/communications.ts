import type { Communication } from "@/lib/types/communication";

export const communications: Communication[] = [
  {
    id: "comm-001",
    channel: "sms",
    customerId: "cust-marcus-holloway",
    customerName: "Marcus Holloway",
    subject: "Silverado lead response",
    preview:
      "Hi Marcus, thanks for your interest in the Silverado 1500 LT. Want to set up a test drive this week?",
    status: "delivered",
    simulated: true,
    relatedSignalId: "sig-001",
    createdAt: "2026-05-30T13:10:00Z",
  },
  {
    id: "comm-002",
    channel: "email",
    customerId: "cust-priya-nair",
    customerName: "Priya Nair",
    subject: "Your cleaning is overdue",
    preview:
      "Hi Priya, it has been a while since your last cleaning. Here is a link to book the next open slot.",
    status: "sent",
    simulated: true,
    relatedSignalId: "sig-005",
    createdAt: "2026-05-30T11:20:00Z",
  },
  {
    id: "comm-003",
    channel: "voice",
    customerId: "cust-denise-carter",
    customerName: "Denise Carter",
    subject: "Maintenance recovery call",
    preview:
      "Simulated voice follow-up offering a service appointment with a loyalty coupon.",
    status: "queued",
    simulated: true,
    relatedSignalId: "sig-007",
    createdAt: "2026-05-30T12:45:00Z",
  },
  {
    id: "comm-004",
    channel: "sms",
    customerId: "cust-avery-thompson",
    customerName: "Avery Thompson",
    subject: "AC estimate scheduling",
    preview:
      "Hi Avery, we can send a technician for your AC estimate today. Does 3pm or 5pm work better?",
    status: "drafted",
    simulated: true,
    relatedSignalId: "sig-006",
    createdAt: "2026-05-30T13:25:00Z",
  },
  {
    id: "comm-005",
    channel: "human",
    customerId: "cust-jordan-mills",
    customerName: "Jordan Mills",
    subject: "Intake qualification task",
    preview:
      "Human task created for intake specialist to qualify the consultation request.",
    status: "escalated",
    simulated: true,
    relatedSignalId: "sig-008",
    createdAt: "2026-05-30T10:05:00Z",
  },
  {
    id: "comm-006",
    channel: "sms",
    customerId: "cust-ethan-brooks",
    customerName: "Ethan Brooks",
    subject: "Sales follow-up",
    preview: "Outreach blocked. Customer opted out of SMS.",
    status: "blocked",
    simulated: true,
    relatedSignalId: "sig-002",
    createdAt: "2026-05-30T12:55:00Z",
  },
  {
    id: "comm-007",
    channel: "voice",
    customerId: "cust-linda-vasquez",
    customerName: "Linda Vasquez",
    subject: "Reschedule outreach",
    preview:
      "Held for human review. Medical sensitive content cannot be sent automatically.",
    status: "escalated",
    simulated: true,
    relatedSignalId: "sig-003",
    createdAt: "2026-05-30T08:30:00Z",
  },
  {
    id: "comm-008",
    channel: "email",
    customerId: "cust-sofia-ramirez",
    customerName: "Sofia Ramirez",
    subject: "Renewal fallback",
    preview:
      "Hi Sofia, following up on your auto policy renewal. Reply here to schedule a quick review.",
    status: "replied",
    simulated: true,
    relatedSignalId: null,
    createdAt: "2026-05-29T16:55:00Z",
  },
  {
    id: "comm-009",
    channel: "sms",
    customerId: "cust-sofia-ramirez",
    customerName: "Sofia Ramirez",
    subject: "Renewal reminder",
    preview: "Delivery failed. Carrier returned a temporary error.",
    status: "failed",
    simulated: true,
    relatedSignalId: null,
    createdAt: "2026-05-29T16:40:00Z",
  },
];

export function getCommunication(id: string): Communication | undefined {
  return communications.find((communication) => communication.id === id);
}
