import type { VoiceScript } from "@/lib/types/voice";

// Home services voice scripts. Estimate follow-up only. Data only. Never sent
// to any provider.
export const homeServicesVoiceScripts: VoiceScript[] = [
  {
    scriptType: "HOME_SERVICES_ESTIMATE",
    vertical: "home-services",
    title: "Home services estimate follow-up",
    opening:
      "Hi, this is the demo home services team following up on your estimate request.",
    reasonForCall:
      "Following up on your HVAC estimate request to answer any questions.",
    primaryQuestion:
      "Would you like to schedule a time for the estimate or service visit?",
    fallbackQuestion:
      "Do you have any questions about the estimate before we schedule?",
    humanHandoff:
      "I can have a service coordinator confirm a visit window that works for you.",
    close:
      "Thank you. A coordinator will follow up to confirm your visit window.",
  },
];
