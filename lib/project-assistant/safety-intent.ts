import type { SafetyIntent } from "./types";

// Deterministic safety-intent detection. This flags questions that imply false
// live behavior so the assistant can correct the assumption honestly. It is
// pure string matching: no model, no network, no randomness.

const PROVIDER_NAMES = [
  "openai",
  "anthropic",
  "claude",
  "gemini",
  "azure",
  "elevenlabs",
  "twilio",
  "retell",
  "vapi",
  "sendgrid",
  "realtime",
];

// Future framing means the question is about later production work, not a claim
// that something is live today. These must not be treated as false premises.
const FUTURE_FRAMING = [
  "would",
  "later",
  "future",
  "roadmap",
  "eventually",
  "plan to",
  "going to",
  "before production",
  "in production",
  "how to add",
  "how would you",
];

// Live framing implies the question assumes a real integration exists now.
const LIVE_FRAMING = [
  "does it",
  "do you",
  "is it",
  "are you",
  "did you",
  "actually",
  "really",
  "connected",
  "connect",
  "integrate",
  "integrated",
  "using",
  "use ",
  "uses",
  "call",
  "send",
];

function hasAny(text: string, needles: string[]): boolean {
  return needles.some((needle) => text.includes(needle));
}

// Detect the safety intent of a normalized query. Returns null when the query
// carries no false-premise signal. Order matters: more specific corrections are
// checked first.
export function detectSafetyIntent(normalized: string): SafetyIntent | null {
  if (normalized.length === 0) return null;

  const futureFramed = hasAny(normalized, FUTURE_FRAMING);

  // Secret or credential requests, for example "where is the api key".
  if (
    hasAny(normalized, [
      "api key",
      "api keys",
      "secret",
      "secrets",
      "credential",
      "credentials",
      "access token",
      "auth token",
    ]) ||
    (normalized.includes("key") && hasAny(normalized, ["where", "put", "store", "enter", "set"]))
  ) {
    if (!futureFramed) return "secret_request";
  }

  // Requests to use real customer data or connect a real system.
  if (
    hasAny(normalized, [
      "real customer data",
      "real customers",
      "real customer",
      "real data",
      "real lead",
      "real leads",
      "real crm",
      "my crm",
      "dealership crm",
      "real records",
      "store real",
      "enter my",
      "connect my",
      "connect this to my",
      "use my own data",
    ])
  ) {
    return "real_customer_data_request";
  }

  // Requests to contact a real person by call, text, or email.
  if (
    hasAny(normalized, [
      "call a real",
      "call real",
      "call customers",
      "call my",
      "call a patient",
      "call a person",
      "text real",
      "text my",
      "text a real",
      "email patients",
      "email a real",
      "email real",
      "send the sms",
      "send a real",
      "reach a real",
      "contact a real",
      "dial a real",
    ])
  ) {
    return "real_message_request";
  }

  // Assumptions that a live provider is wired in now. Provider name plus live
  // framing, and not framed as future work.
  if (hasAny(normalized, PROVIDER_NAMES) && hasAny(normalized, LIVE_FRAMING) && !futureFramed) {
    return "live_provider_assumption";
  }

  // Production readiness questions are honest questions, not false premises.
  if (
    hasAny(normalized, [
      "production ready",
      "production-ready",
      "ready for production",
      "is it production",
      "is this production",
      "production readiness",
    ])
  ) {
    return "production_readiness_question";
  }

  return null;
}

// Map a corrective safety intent to the knowledge entry that holds the honest
// answer. Production and out-of-scope intents are handled by normal ranking and
// the fallback, so they are not mapped here.
export const SAFETY_INTENT_ENTRY: Partial<Record<SafetyIntent, string>> = {
  live_provider_assumption: "guard-live-provider",
  secret_request: "guard-secret",
  real_customer_data_request: "guard-real-data",
  real_message_request: "guard-real-message",
  production_readiness_question: "production-ready",
};
