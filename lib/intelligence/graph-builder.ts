import type { Customer } from "@/lib/types/customer";
import type { Opportunity } from "@/lib/types/opportunity";
import type { Communication } from "@/lib/types/communication";
import type {
  CustomerGraph,
  CustomerGraphEdge,
  CustomerGraphNode,
  IntelligenceRiskFlag,
  NormalizedSignal,
} from "@/lib/types/intelligence";

export interface GraphBuilderInput {
  customer: Customer;
  signals: NormalizedSignal[];
  opportunities: Opportunity[];
  communications: Communication[];
  riskFlags: IntelligenceRiskFlag[];
}

// Build an in-memory customer graph from TypeScript objects. The graph models
// relationships between the customer and their signals, opportunities,
// communications, and risk flags. No graph database is involved.
export function buildCustomerGraph(
  input: GraphBuilderInput,
): CustomerGraph {
  const { customer, signals, opportunities, communications, riskFlags } = input;

  const nodes: CustomerGraphNode[] = [];
  const edges: CustomerGraphEdge[] = [];

  const customerNode = `customer:${customer.id}`;
  nodes.push({ id: customerNode, type: "customer", label: customer.name });

  for (const signal of signals) {
    const id = `signal:${signal.signalId}`;
    nodes.push({ id, type: "signal", label: signal.normalizedType });
    edges.push({ from: customerNode, to: id, relation: "submitted" });
  }

  for (const opp of opportunities) {
    const id = `opportunity:${opp.id}`;
    nodes.push({ id, type: "opportunity", label: opp.title });
    edges.push({ from: customerNode, to: id, relation: "associated-with" });
  }

  for (const comm of communications) {
    const id = `communication:${comm.id}`;
    nodes.push({ id, type: "communication", label: comm.subject });
    edges.push({ from: customerNode, to: id, relation: "received" });
  }

  riskFlags.forEach((flag, index) => {
    const id = `risk:${customer.id}:${index}`;
    nodes.push({ id, type: "risk", label: flag.label });
    edges.push({ from: customerNode, to: id, relation: "flagged-with" });
  });

  return {
    customerId: customer.id,
    customerName: customer.name,
    nodes,
    edges,
  };
}
