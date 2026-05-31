import type { VerticalPackConfig } from "@/lib/types/vertical-pack-config";

export const homeServicesPack: VerticalPackConfig = {
  id: "home-services",
  name: "Home Services",
  tagline:
    "HVAC, plumbing, and electrical contractors capturing estimate requests and seasonal demand.",
  objects: [
    "Estimate Request",
    "Service Plan",
    "Property",
    "Maintenance Opportunity",
  ],
  signalArchetypes: [
    {
      normalizedType: "ESTIMATE_REQUEST",
      label: "Estimate submitted",
      detail: "Homeowner requested an estimate for a central air replacement.",
      recommendedChannel: "sms",
      weight: 4,
    },
    {
      normalizedType: "MISSED_CALL",
      label: "Missed call",
      detail: "Homeowner called about an urgent service need and was not reached.",
      recommendedChannel: "voice",
      weight: 2,
    },
    {
      normalizedType: "SERVICE_DUE",
      label: "Seasonal reminder",
      detail: "Seasonal maintenance is due before peak demand.",
      recommendedChannel: "email",
      weight: 3,
    },
    {
      normalizedType: "RECALL_NOTICE",
      label: "Warranty expiring",
      detail: "An equipment warranty is approaching expiration.",
      recommendedChannel: "email",
      weight: 1,
    },
  ],
  opportunityTypes: [
    { key: "system-replacement", title: "System replacement", minValue: 6500, maxValue: 14500 },
    { key: "seasonal-tuneup", title: "Seasonal tune-up", minValue: 180, maxValue: 480 },
  ],
  outcomes: [
    "Estimate Scheduled",
    "Job Won",
    "Maintenance Booked",
    "Lost Lead",
  ],
  recommendedActions: [
    "Estimate scheduling",
    "Quote follow-up",
    "Seasonal tune-up offer",
    "Dispatch coordination",
  ],
  scoring: { intentBias: 5, opportunityBias: 6, engagementBias: 2 },
  workflow: { primaryChannel: "sms", fallbackChannel: "email", escalateHighValue: true },
  revenue: { averageDealValue: 9800, recoveryRate: 0.5, missRate: 0.22 },
  complianceSensitivity: "standard",
};
