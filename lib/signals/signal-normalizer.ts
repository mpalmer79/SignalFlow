import type { Signal, SignalType } from "@/lib/types/signal";
import type { NormalizedSignalType } from "@/lib/types/intelligence";

// Maps the persisted signal vocabulary onto the normalized Signal Engine
// vocabulary. The persisted types are coarse, so detail text is used to
// resolve finer categories (for example a vehicle view versus a trade request).

const DIRECT_TYPE_MAP: Record<SignalType, NormalizedSignalType> = {
  "new-lead": "NEW_LEAD",
  "missed-call": "MISSED_CALL",
  "appointment-cancellation": "APPOINTMENT_CANCEL",
  "email-engagement": "EMAIL_OPEN",
  "recall-opportunity": "DENTAL_RECALL",
  "estimate-request": "ESTIMATE_REQUEST",
  "service-due": "SERVICE_DUE",
  "consultation-request": "CONSULTATION_REQUEST",
};

// Keyword rules let raw, free-form event text normalize into a stable type.
// Order matters: the first match wins.
const KEYWORD_RULES: { keywords: string[]; type: NormalizedSignalType }[] = [
  { keywords: ["trade", "appraisal", "trade-in"], type: "TRADE_REQUEST" },
  { keywords: ["test drive", "vehicle detail", "inventory", "silverado", "viewed"], type: "VEHICLE_VIEW" },
  { keywords: ["clicked", "scheduling link", "link"], type: "EMAIL_CLICK" },
  { keywords: ["opened", "open"], type: "EMAIL_OPEN" },
  { keywords: ["replied", "reply", "responded"], type: "SMS_REPLY" },
  { keywords: ["appointment", "reschedule", "book"], type: "APPOINTMENT_REQUEST" },
  { keywords: ["recall"], type: "RECALL_NOTICE" },
  { keywords: ["estimate", "quote"], type: "ESTIMATE_REQUEST" },
  { keywords: ["consultation", "intake"], type: "CONSULTATION_REQUEST" },
  { keywords: ["maintenance", "service due", "overdue"], type: "SERVICE_DUE" },
];

// Resolve a normalized type from free-form text only. Useful for the Signal
// Explorer, which demonstrates normalization of raw event strings.
export function normalizeRawEvent(text: string): NormalizedSignalType | null {
  const haystack = text.toLowerCase();
  for (const rule of KEYWORD_RULES) {
    if (rule.keywords.some((keyword) => haystack.includes(keyword))) {
      return rule.type;
    }
  }
  return null;
}

export function normalizeSignalType(signal: Signal): NormalizedSignalType {
  const fromText = normalizeRawEvent(`${signal.label} ${signal.detail}`);

  // For dental recalls the detail often mentions cleaning, so prefer the
  // vertical-aware direct mapping when the persisted type is unambiguous.
  if (signal.type === "recall-opportunity") {
    return signal.vertical === "dental" ? "DENTAL_RECALL" : "RECALL_NOTICE";
  }

  if (signal.type === "email-engagement" && fromText) {
    return fromText === "EMAIL_CLICK" || fromText === "EMAIL_OPEN"
      ? fromText
      : "EMAIL_OPEN";
  }

  // A new lead that mentions a trade is stronger than a generic lead.
  if (signal.type === "new-lead" && fromText === "TRADE_REQUEST") {
    return "TRADE_REQUEST";
  }

  return DIRECT_TYPE_MAP[signal.type];
}
