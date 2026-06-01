import type { Channel, ConsentState } from "@/lib/types/consent";
import type { Customer } from "@/lib/types/customer";
import type { Signal } from "@/lib/types/signal";
import type { Opportunity, OpportunityStage } from "@/lib/types/opportunity";
import type { VerticalPackConfig } from "@/lib/types/vertical-pack-config";
import { spreadTimestamp } from "@/lib/utils/deterministic-time";

// A small deterministic pseudo random generator. The same seed always produces
// the same sequence, so synthetic data is reproducible and demo safe.
export function createRng(seed: number) {
  let state = seed >>> 0;
  return function next(): number {
    // xorshift32
    state ^= state << 13;
    state ^= state >>> 17;
    state ^= state << 5;
    state >>>= 0;
    return state / 0xffffffff;
  };
}

export function hashSeed(input: string): number {
  let hash = 2166136261;
  for (let i = 0; i < input.length; i += 1) {
    hash ^= input.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}

const FIRST_NAMES = [
  "Marcus", "Denise", "Priya", "Avery", "Jordan", "Sofia", "Ethan", "Linda",
  "Carlos", "Nina", "Trevor", "Yusuf", "Hannah", "Diego", "Grace", "Omar",
  "Renee", "Felix", "Tara", "Wesley", "Camila", "Andre", "Bianca", "Hugo",
  "Maya", "Curtis", "Lena", "Russell", "Paloma", "Devin",
];

const LAST_NAMES = [
  "Holloway", "Carter", "Nair", "Thompson", "Mills", "Ramirez", "Brooks",
  "Vasquez", "Okafor", "Petrov", "Reyes", "Chen", "Donovan", "Silva", "Park",
  "Abboud", "Castillo", "Greer", "Nguyen", "Foster", "Romano", "Bauer",
  "Espinoza", "Whitaker", "Khan", "Sutton", "Marsh", "Delgado", "Frost", "Hale",
];

type IntentLevel = "high" | "medium" | "low";

export interface GenerateCustomerInput {
  pack: VerticalPackConfig;
  index: number;
  seedKey: string;
  intentLevel: IntentLevel;
  consentState: ConsentState;
  optedOut: boolean;
  hasResponse: boolean;
  signalKeys?: string[];
}

export interface GeneratedCustomer {
  customer: Customer;
  signals: Signal[];
  opportunity: Opportunity;
  hasResponse: boolean;
}

function pick<T>(rng: () => number, items: T[]): T {
  return items[Math.floor(rng() * items.length) % items.length];
}

function buildName(rng: () => number, index: number): string {
  const first = FIRST_NAMES[(Math.floor(rng() * FIRST_NAMES.length) + index) % FIRST_NAMES.length];
  const last = LAST_NAMES[(Math.floor(rng() * LAST_NAMES.length) + index * 7) % LAST_NAMES.length];
  return `${first} ${last}`;
}

// Choose how many signals and which archetypes, weighted by the pack and the
// requested intent level.
function selectArchetypes(
  pack: VerticalPackConfig,
  rng: () => number,
  intentLevel: IntentLevel,
  signalKeys?: string[],
) {
  if (signalKeys && signalKeys.length > 0) {
    const matched = pack.signalArchetypes.filter((a) =>
      signalKeys.includes(a.normalizedType),
    );
    if (matched.length > 0) return matched;
  }

  const count = intentLevel === "high" ? 3 : intentLevel === "medium" ? 2 : 1;
  const weighted: typeof pack.signalArchetypes = [];
  for (const archetype of pack.signalArchetypes) {
    for (let i = 0; i < archetype.weight; i += 1) weighted.push(archetype);
  }

  const chosen: typeof pack.signalArchetypes = [];
  const seen = new Set<string>();
  let guard = 0;
  while (chosen.length < count && guard < 50) {
    const candidate = pick(rng, weighted);
    if (!seen.has(candidate.normalizedType)) {
      seen.add(candidate.normalizedType);
      chosen.push(candidate);
    }
    guard += 1;
  }
  return chosen.length > 0 ? chosen : [pack.signalArchetypes[0]];
}

const BASE_TIME_ISO = "2026-05-30T13:00:00Z";

export function generateCustomer(input: GenerateCustomerInput): GeneratedCustomer {
  const { pack, index, seedKey, intentLevel, consentState, optedOut, hasResponse } = input;
  const rng = createRng(hashSeed(`${seedKey}:${index}`));

  const name = buildName(rng, index);
  const customerId = `sim-${pack.id}-${index}`;

  const channels: Channel[] = ["sms", "email", "voice"];
  const customerChannels = channels.map((channel) => ({
    channel,
    value: channel === "email" ? `${customerId}@example.com` : "+1 (555) 555-0100",
    consent: optedOut ? ("revoked" as ConsentState) : consentState,
  }));

  const preferredChannel = pack.workflow.primaryChannel;

  const archetypes = selectArchetypes(pack, rng, intentLevel, input.signalKeys);

  const signals: Signal[] = archetypes.map((archetype, i) => ({
    id: `${customerId}-sig-${i}`,
    type: "new-lead",
    label: archetype.label,
    customerId,
    customerName: name,
    vertical: pack.id,
    source: "web-form",
    priority: "high",
    recommendedAction: pack.recommendedActions[0],
    recommendedChannel: archetype.recommendedChannel,
    consentStatus: optedOut ? "revoked" : consentState,
    detail: archetype.detail,
    // Normalization keys off label and detail text, so embed the normalized
    // type marker in the detail to keep the engine mapping stable.
    receivedAt: spreadTimestamp(
      BASE_TIME_ISO,
      `${customerId}-sig-${i}`,
      72,
    ),
  }));

  // Attach the normalized type hint by adjusting the signal type where the
  // persisted vocabulary maps cleanly. The enricher also reads detail text.
  archetypes.forEach((archetype, i) => {
    signals[i].type = mapNormalizedToSignalType(archetype.normalizedType);
  });

  const oppType = pick(rng, pack.opportunityTypes);
  const value = Math.round(
    oppType.minValue + rng() * (oppType.maxValue - oppType.minValue),
  );
  const stage: OpportunityStage =
    intentLevel === "low" ? "dormant" : intentLevel === "high" ? "engaged" : "contact-attempted";

  const opportunity: Opportunity = {
    id: `${customerId}-opp`,
    title: oppType.title,
    customerId,
    customerName: name,
    vertical: pack.id,
    stage,
    intentScore: intentLevel === "high" ? 84 : intentLevel === "medium" ? 58 : 30,
    estimatedValue: value,
    owner: `${pack.name} desk`,
    updatedAt: spreadTimestamp(BASE_TIME_ISO, `${customerId}-opp`, 168),
  };

  const customer: Customer = {
    id: customerId,
    name,
    vertical: pack.id,
    channels: customerChannels,
    preferredChannel,
    optedOut,
    recentSignals: signals.map((s) => s.label),
    activeOpportunity: optedOut ? null : opportunity.title,
    lastAction: "Generated by simulation",
    lastActionAt: spreadTimestamp(BASE_TIME_ISO, `${customerId}-last`, 240),
    riskFlags:
      pack.complianceSensitivity === "high"
        ? [{ label: "Advice boundary review required", severity: "warning" }]
        : pack.id === "medical"
          ? [{ label: "Protected health information", severity: "critical" }]
          : [],
  };

  return { customer, signals, opportunity, hasResponse };
}

// Map the normalized vocabulary back onto the persisted signal type vocabulary
// so the existing enricher resolves the intended normalized type.
function mapNormalizedToSignalType(
  normalized: string,
): Signal["type"] {
  switch (normalized) {
    case "MISSED_CALL":
      return "missed-call";
    case "APPOINTMENT_CANCEL":
      return "appointment-cancellation";
    case "EMAIL_OPEN":
    case "EMAIL_CLICK":
      return "email-engagement";
    case "DENTAL_RECALL":
    case "RECALL_NOTICE":
      return "recall-opportunity";
    case "ESTIMATE_REQUEST":
      return "estimate-request";
    case "SERVICE_DUE":
      return "service-due";
    case "CONSULTATION_REQUEST":
      return "consultation-request";
    case "TRADE_REQUEST":
    case "VEHICLE_VIEW":
    case "NEW_LEAD":
    default:
      return "new-lead";
  }
}
