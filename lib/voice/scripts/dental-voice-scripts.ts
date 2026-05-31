import type { VoiceScript } from "@/lib/types/voice";

// Dental voice scripts. No medical advice. Recall and scheduling only. Data
// only. Never sent to any provider.
export const dentalVoiceScripts: VoiceScript[] = [
  {
    scriptType: "DENTAL_RECALL",
    vertical: "dental",
    title: "Dental recall and scheduling",
    opening:
      "Hi, this is the demo dental office calling about your account.",
    reasonForCall:
      "Calling about an overdue cleaning recall to help you get back on schedule.",
    primaryQuestion:
      "Would you like to schedule your next cleaning appointment?",
    fallbackQuestion:
      "Is there a day next week that tends to work best for you?",
    humanHandoff:
      "I can have a scheduling coordinator confirm an available time that fits your calendar.",
    close:
      "Thank you. A coordinator will follow up to confirm your appointment time.",
  },
];
