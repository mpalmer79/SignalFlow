// Voice plan reads and writes. The voice repository keeps all voice persistence
// in one place so the plan, compliance decision, call, transcript, and outcome
// are written together. These focused exports document the plan surface.
export {
  persistVoicePlan,
  findAllVoicePlans,
  findVoicePlansNeedingReview,
  aggregateVoice,
  type PersistVoicePlanInput,
  type VoiceAggregate,
} from "./voice-repository";
