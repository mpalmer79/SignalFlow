import type { VerticalPackConfig } from "@/lib/types/vertical-pack-config";

export const automotivePack: VerticalPackConfig = {
  id: "automotive",
  name: "Automotive",
  tagline:
    "Dealership sales and service revenue, from new vehicle inquiries to overdue maintenance recovery.",
  objects: [
    "Sales Lead",
    "Vehicle",
    "Trade Appraisal",
    "Service Opportunity",
    "Recall Opportunity",
    "Lease Maturity",
    "Equity Opportunity",
  ],
  signalArchetypes: [
    {
      normalizedType: "TRADE_REQUEST",
      label: "Trade appraisal submitted",
      detail: "Customer submitted a trade-in for appraisal on a current vehicle.",
      recommendedChannel: "sms",
      weight: 3,
    },
    {
      normalizedType: "VEHICLE_VIEW",
      label: "Vehicle detail viewed",
      detail: "Customer viewed a Silverado inventory page and used the payment calculator.",
      recommendedChannel: "sms",
      weight: 4,
    },
    {
      normalizedType: "NEW_LEAD",
      label: "Lead form submitted",
      detail: "Customer submitted a new vehicle lead form from the website.",
      recommendedChannel: "sms",
      weight: 4,
    },
    {
      normalizedType: "MISSED_CALL",
      label: "Missed sales call",
      detail: "Inbound sales call missed after hours.",
      recommendedChannel: "voice",
      weight: 2,
    },
    {
      normalizedType: "SERVICE_DUE",
      label: "Service due",
      detail: "Vehicle is overdue for scheduled maintenance.",
      recommendedChannel: "email",
      weight: 3,
    },
    {
      normalizedType: "RECALL_NOTICE",
      label: "Recall notice",
      detail: "An open safety recall applies to the customer vehicle.",
      recommendedChannel: "email",
      weight: 1,
    },
  ],
  opportunityTypes: [
    { key: "vehicle-purchase", title: "Vehicle purchase", minValue: 28000, maxValue: 62000 },
    { key: "service-revenue", title: "Service revenue", minValue: 250, maxValue: 1800 },
    { key: "trade-equity", title: "Trade equity", minValue: 15000, maxValue: 34000 },
  ],
  outcomes: [
    "Test Drive Scheduled",
    "Appointment Booked",
    "Vehicle Sold",
    "Service Appointment",
    "Lost Opportunity",
  ],
  recommendedActions: [
    "Instant lead response",
    "Test drive scheduling",
    "Service appointment booking",
    "Maintenance recovery outreach",
  ],
  scoring: { intentBias: 6, opportunityBias: 4, engagementBias: 2 },
  workflow: { primaryChannel: "sms", fallbackChannel: "email", escalateHighValue: true },
  revenue: { averageDealValue: 38000, recoveryRate: 0.5, missRate: 0.2 },
  complianceSensitivity: "standard",
};
