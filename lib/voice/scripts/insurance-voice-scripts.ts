import type { VoiceScript } from "@/lib/types/voice";

// Insurance voice scripts. Quote and renewal follow-up only. No financial
// advice. Data only. Never sent to any provider.
export const insuranceVoiceScripts: VoiceScript[] = [
  {
    scriptType: "INSURANCE_RENEWAL",
    vertical: "insurance",
    title: "Insurance quote and renewal follow-up",
    opening:
      "Hi, this is the demo insurance team following up on your account.",
    reasonForCall:
      "Following up on your quote or renewal request to help you complete it.",
    primaryQuestion:
      "Would you like to review your quote or renewal options with a licensed agent?",
    fallbackQuestion:
      "Is there a better time for a licensed agent to reach you?",
    humanHandoff:
      "I can have a licensed agent follow up to review your options in detail.",
    close:
      "Thank you. A licensed agent will follow up to review your options.",
  },
];
