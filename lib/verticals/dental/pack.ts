import type { VerticalPackConfig } from "@/lib/types/vertical-pack-config";

export const dentalPack: VerticalPackConfig = {
  id: "dental",
  name: "Dental",
  tagline:
    "Patient recall, reactivation, and treatment plan follow-up for general and specialty practices.",
  objects: ["Patient", "Cleaning Recall", "Treatment Plan", "Insurance Review"],
  signalArchetypes: [
    {
      normalizedType: "DENTAL_RECALL",
      label: "Overdue cleaning",
      detail: "Patient is overdue for a recall cleaning by several months.",
      recommendedChannel: "email",
      weight: 4,
    },
    {
      normalizedType: "APPOINTMENT_CANCEL",
      label: "Missed appointment",
      detail: "Patient missed a scheduled hygiene appointment.",
      recommendedChannel: "sms",
      weight: 2,
    },
    {
      normalizedType: "ESTIMATE_REQUEST",
      label: "Treatment plan pending",
      detail: "An accepted treatment plan has not yet been scheduled.",
      recommendedChannel: "email",
      weight: 3,
    },
    {
      normalizedType: "EMAIL_CLICK",
      label: "Insurance verification",
      detail: "Patient opened and clicked an insurance verification reminder.",
      recommendedChannel: "email",
      weight: 2,
    },
  ],
  opportunityTypes: [
    { key: "recall-cleaning", title: "Recall cleaning and exam", minValue: 180, maxValue: 420 },
    { key: "treatment-plan", title: "Treatment plan acceptance", minValue: 900, maxValue: 4200 },
  ],
  outcomes: [
    "Appointment Scheduled",
    "Patient Reactivated",
    "Treatment Accepted",
    "No Response",
  ],
  recommendedActions: [
    "Recall reminder",
    "Reactivation outreach",
    "Appointment rebooking",
    "Treatment plan follow-up",
  ],
  scoring: { intentBias: 2, opportunityBias: -2, engagementBias: 3 },
  workflow: { primaryChannel: "email", fallbackChannel: "sms", escalateHighValue: false },
  revenue: { averageDealValue: 600, recoveryRate: 0.45, missRate: 0.3 },
  complianceSensitivity: "elevated",
};
