import type { VoiceScript, VoiceScriptType } from "@/lib/types/voice";
import { automotiveVoiceScripts } from "./scripts/automotive-voice-scripts";
import { dentalVoiceScripts } from "./scripts/dental-voice-scripts";
import { homeServicesVoiceScripts } from "./scripts/home-services-voice-scripts";
import { legalVoiceScripts } from "./scripts/legal-voice-scripts";
import { insuranceVoiceScripts } from "./scripts/insurance-voice-scripts";

// All structured voice scripts, aggregated for lookup. Scripts are data only
// and are never sent to any provider in Phase 9.
export const allVoiceScripts: VoiceScript[] = [
  ...automotiveVoiceScripts,
  ...dentalVoiceScripts,
  ...homeServicesVoiceScripts,
  ...legalVoiceScripts,
  ...insuranceVoiceScripts,
];

const genericScript: VoiceScript = {
  scriptType: "GENERIC_FOLLOW_UP",
  vertical: "automotive",
  title: "General follow-up",
  opening: "Hi, this is the demo team following up on your recent inquiry.",
  reasonForCall: "Following up to see how we can help with your request.",
  primaryQuestion: "Would it help to have a specialist follow up with details?",
  fallbackQuestion: "Is there a better time for a specialist to reach you?",
  humanHandoff: "I can connect you with a specialist who can help further.",
  close: "Thank you for your time. A specialist will follow up shortly.",
};

// Return the structured script for a script type, falling back to a generic
// professional script when a vertical has no specific entry.
export function getVoiceScript(scriptType: VoiceScriptType): VoiceScript {
  return (
    allVoiceScripts.find((script) => script.scriptType === scriptType) ??
    genericScript
  );
}
