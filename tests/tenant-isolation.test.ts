import { describe, it, expect } from "vitest";
import { requireOrganizationId } from "@/lib/auth/require-organization";
import type { RequestContext } from "@/lib/types/auth";

// Cross-tenant safety proof. Services never take the organization id from the
// client. They resolve a server side RequestContext and pass it through
// requireOrganizationId, which makes the tenant requirement explicit. These
// tests prove that the organization context is required and preserved, and that
// a missing organization is a hard failure rather than a silent global query.

function context(overrides: Partial<RequestContext> = {}): RequestContext {
  return {
    userId: "user-1",
    userName: "Test User",
    userEmail: "user@example.com",
    organizationId: "org-1",
    organizationName: "Test Org",
    role: "OWNER",
    source: "demo",
    ...overrides,
  };
}

describe("tenant isolation", () => {
  it("preserves the organization id from the resolved server context", () => {
    expect(requireOrganizationId(context({ organizationId: "org-42" }))).toBe(
      "org-42",
    );
  });

  it("throws when the context carries no organization", () => {
    // Model a context that lost its organization. The cast localizes the unsafe
    // shape to this negative test only.
    const missing = context({ organizationId: "" }) as RequestContext;
    expect(() => requireOrganizationId(missing)).toThrow(/organization/i);
  });

  it("does not fall back to a default or shared organization", () => {
    // Two different tenants must resolve to two different ids. There is no
    // shared bucket that would let one tenant read another tenant's data.
    const a = requireOrganizationId(context({ organizationId: "org-a" }));
    const b = requireOrganizationId(context({ organizationId: "org-b" }));
    expect(a).not.toBe(b);
  });
});
