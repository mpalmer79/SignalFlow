import type { VoiceScript } from "@/lib/types/voice";

// Legal intake voice scripts. Scheduling only. These scripts explicitly do not
// provide legal advice. Data only. Never sent to any provider.
export const legalVoiceScripts: VoiceScript[] = [
  {
    scriptType: "LEGAL_CONSULTATION",
    vertical: "legal-intake",
    title: "Legal consultation scheduling",
    opening:
      "Hi, this is the demo legal intake team returning your inquiry.",
    reasonForCall:
      "Calling to schedule a consultation, not to provide legal advice.",
    primaryQuestion:
      "Would you like to schedule an initial consultation with an attorney?",
    fallbackQuestion:
      "Is there a better time for the intake team to reach you?",
    humanHandoff:
      "I will have an intake coordinator confirm a consultation time with an attorney.",
    close:
      "Thank you. An intake coordinator will follow up to confirm your consultation.",
  },
];
