// Route-aware context for the project assistant. The current pathname is used
// only to improve answer relevance. It never affects authorization, provider
// selection, compliance, workflow execution, AI behavior, or any business
// logic. Unknown routes simply contribute no boost.

// Map a route to the knowledge entry ids that are most relevant there. Used to
// break ties and surface route-relevant knowledge for vague questions.
export const ROUTE_BOOSTS: Record<string, string[]> = {
  "/provider-management": ["provider-governance", "guard-live-provider", "crm", "demo-safe-meaning"],
  "/provider-sandbox": ["provider-governance", "guard-live-provider", "simulated"],
  "/voice-command-center": ["channels", "guard-real-message", "governance"],
  "/voice-replay": ["channels", "simulated", "governance"],
  "/revenue-command-center": ["kpi-drilldown", "revenue", "kpi-implementation"],
  "/ai-center": ["governance", "intelligence", "simulated"],
  "/review-queue": ["governance", "staff-level"],
  "/demo": ["demo", "governance", "simulated"],
  "/scenarios": ["verticals", "purpose", "business-problem"],
  "/executive-insights": ["revenue", "governance", "kpi-drilldown"],
};

// Resolve the boosted entry ids for a pathname. Matching is by longest route
// prefix so nested routes such as /scenarios/automotive-high-intent inherit the
// /scenarios boosts. Returns an empty list for unknown or missing routes.
export function routeBoostIds(route: string | null | undefined): string[] {
  if (!route) return [];
  const normalized = route.toLowerCase();
  const keys = Object.keys(ROUTE_BOOSTS).sort((a, b) => b.length - a.length);
  for (const key of keys) {
    if (normalized === key || normalized.startsWith(`${key}/`)) {
      return ROUTE_BOOSTS[key];
    }
  }
  return [];
}
