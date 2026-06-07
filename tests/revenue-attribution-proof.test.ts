import { describe, it, expect } from "vitest";
import { classifyOutcomes } from "@/lib/outcomes/outcome-classifier";
import { attributeRevenue } from "@/lib/attribution/revenue-attribution-engine";
import type { OutcomeContext } from "@/lib/types/outcome";

// Revenue attribution proof. A simulated workflow outcome maps to the expected
// attribution category through the deterministic classifier and attribution
// engine. These tests pin the business rules that connect a simulated action to
// a revenue category, not arbitrary numbers.

function outcomeContext(overrides: Partial<OutcomeContext> = {}): OutcomeContext {
  return {
    customerId: "cust-1",
    customerName: "Test Customer",
    vertical: "automotive",
    optedOut: false,
    intentScore: 60,
    opportunityScore: 60,
    engagementScore: 40,
    consentSummary: "allowed",
    hasCriticalRisk: false,
    hasRecentResponse: false,
    workflowOutcome: "completed",
    actionsExecuted: 1,
    actionsBlocked: 0,
    actionsEscalated: 0,
    executedActionTypes: [],
    blockedActionTypes: [],
    opportunity: {
      id: "opp-1",
      title: "Test Opportunity",
      stage: "engaged",
      estimatedValue: 30000,
      ...(overrides.opportunity ?? {}),
    },
    ...overrides,
  };
}

describe("revenue attribution", () => {
  it("attributes nothing when the customer opted out", () => {
    const context = outcomeContext({ optedOut: true });
    const outcomes = classifyOutcomes(context);
    expect(outcomes.map((o) => o.outcomeType)).toContain("COMPLIANCE_STOP");

    const attribution = attributeRevenue(context, outcomes, null);
    expect(attribution).toBeNull();
  });

  it("maps a booked appointment to recovered revenue", () => {
    const context = outcomeContext({
      intentScore: 85,
      opportunityScore: 80,
      executedActionTypes: ["BOOK_APPOINTMENT"],
    });
    const outcomes = classifyOutcomes(context);
    expect(outcomes.map((o) => o.outcomeType)).toContain(
      "APPOINTMENT_SCHEDULED",
    );

    const attribution = attributeRevenue(context, outcomes, null);
    expect(attribution?.attributionType).toBe("RECOVERED");
    expect(attribution?.attributedAmount).toBeGreaterThan(0);
    expect(attribution?.attributedAmount).toBeLessThanOrEqual(30000);
  });

  it("maps a high value human handoff to a prevented loss", () => {
    const context = outcomeContext({
      intentScore: 60,
      opportunityScore: 80,
      executedActionTypes: ["CREATE_TASK"],
    });
    const outcomes = classifyOutcomes(context);
    expect(outcomes.map((o) => o.outcomeType)).toContain("HUMAN_TASK_CREATED");

    const attribution = attributeRevenue(context, outcomes, null);
    expect(attribution?.attributionType).toBe("PREVENTED_LOSS");
  });

  it("maps executed outreach with no movement to assisted contact", () => {
    const context = outcomeContext({
      intentScore: 50,
      opportunityScore: 50,
      engagementScore: 30,
      executedActionTypes: ["SEND_SMS"],
    });
    const outcomes = classifyOutcomes(context);
    const attribution = attributeRevenue(context, outcomes, null);
    expect(attribution?.attributionType).toBe("ASSISTED");
  });

  it("is deterministic for identical input", () => {
    const context = outcomeContext({
      intentScore: 85,
      opportunityScore: 80,
      executedActionTypes: ["BOOK_APPOINTMENT"],
    });
    const first = attributeRevenue(context, classifyOutcomes(context), null);
    const second = attributeRevenue(context, classifyOutcomes(context), null);
    expect(first).toEqual(second);
  });
});
