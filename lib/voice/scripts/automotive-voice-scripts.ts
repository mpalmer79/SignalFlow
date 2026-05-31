import type { VoiceScript } from "@/lib/types/voice";

// Automotive voice scripts. Short, professional, and free of financial advice.
// Data only. Never sent to any provider.
export const automotiveVoiceScripts: VoiceScript[] = [
  {
    scriptType: "AUTOMOTIVE_TRADE",
    vertical: "automotive",
    title: "Automotive trade and inquiry follow-up",
    opening:
      "Hi, this is the demo automotive team following up on your recent inquiry.",
    reasonForCall:
      "Following up on your vehicle inquiry and trade request to share next steps.",
    primaryQuestion:
      "Would you like a product specialist to confirm current availability and your trade options?",
    fallbackQuestion:
      "Is there a better time for a specialist to reach you this week?",
    humanHandoff:
      "I can have a product specialist follow up directly with availability and trade next steps.",
    close:
      "Thank you for your time. A specialist will follow up with the details you asked about.",
  },
  {
    scriptType: "AUTOMOTIVE_FOLLOW_UP",
    vertical: "automotive",
    title: "Automotive reactivation follow-up",
    opening:
      "Hi, this is the demo automotive team reaching out about your earlier interest.",
    reasonForCall:
      "Checking in to see whether you are still considering a vehicle and how we can help.",
    primaryQuestion:
      "Are you still in the market, and would current options be helpful to review?",
    fallbackQuestion:
      "Would you prefer we follow up by your preferred channel instead?",
    humanHandoff:
      "I can connect you with a specialist who can walk through current options.",
    close: "Thanks for your time today. We are here whenever you are ready.",
  },
];
