import type { VerticalPack } from "@/lib/types/vertical-pack";

export const verticalPacks: VerticalPack[] = [
  {
    id: "automotive",
    name: "Automotive",
    summary:
      "Dealership sales and service revenue, from new vehicle inquiries to overdue maintenance recovery.",
    keySignals: [
      "New vehicle lead",
      "Trade-in interest",
      "Missed sales call",
      "Service due reminder",
      "Declined service follow-up",
    ],
    keyActions: [
      "Instant lead response",
      "Test drive scheduling",
      "Service appointment booking",
      "Maintenance recovery outreach",
    ],
    complianceSensitivity: "standard",
    phaseStatus: "mvp-focus",
  },
  {
    id: "dental",
    name: "Dental",
    summary:
      "Patient recall, reactivation, and treatment plan follow-up for general and specialty practices.",
    keySignals: [
      "Overdue cleaning recall",
      "Unscheduled treatment plan",
      "Cancelled appointment",
      "New patient inquiry",
    ],
    keyActions: [
      "Recall reminder",
      "Reactivation outreach",
      "Appointment rebooking",
      "Treatment plan follow-up",
    ],
    complianceSensitivity: "elevated",
    phaseStatus: "planned",
  },
  {
    id: "medical",
    name: "Medical",
    summary:
      "Specialty and primary care scheduling support with strict handling of protected health information.",
    keySignals: [
      "Referral received",
      "Appointment cancellation",
      "No-show recovery",
      "Annual visit due",
    ],
    keyActions: [
      "Scheduling assistance",
      "No-show recovery",
      "Visit reminders",
      "Human handoff for clinical questions",
    ],
    complianceSensitivity: "high",
    phaseStatus: "research",
  },
  {
    id: "home-services",
    name: "Home Services",
    summary:
      "HVAC, plumbing, and electrical contractors capturing estimate requests and seasonal demand.",
    keySignals: [
      "Estimate request",
      "Seasonal maintenance due",
      "Emergency service inquiry",
      "Quote not yet accepted",
    ],
    keyActions: [
      "Estimate scheduling",
      "Quote follow-up",
      "Seasonal tune-up offer",
      "Dispatch coordination",
    ],
    complianceSensitivity: "standard",
    phaseStatus: "planned",
  },
  {
    id: "legal-intake",
    name: "Legal Intake",
    summary:
      "Consultation intake and qualification for consumer law practices, with careful advice boundaries.",
    keySignals: [
      "Consultation request",
      "Case inquiry form",
      "Referral from partner",
      "Unreturned intake call",
    ],
    keyActions: [
      "Intake qualification",
      "Consultation scheduling",
      "Document request",
      "Attorney handoff",
    ],
    complianceSensitivity: "high",
    phaseStatus: "in-design",
  },
  {
    id: "insurance",
    name: "Insurance",
    summary:
      "Agency lead response and policy review prompts across personal and commercial lines.",
    keySignals: [
      "Quote request",
      "Policy renewal due",
      "Coverage gap detected",
      "Missed agent call",
    ],
    keyActions: [
      "Quote follow-up",
      "Renewal reminder",
      "Coverage review scheduling",
      "Agent handoff",
    ],
    complianceSensitivity: "elevated",
    phaseStatus: "research",
  },
];

export function getVerticalPack(id: string): VerticalPack | undefined {
  return verticalPacks.find((pack) => pack.id === id);
}
