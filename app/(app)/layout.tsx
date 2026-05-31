import { AppShell } from "@/components/app-shell";
import { resolveRequestContext } from "@/lib/auth/auth-context";
import { ROLE_LABELS } from "@/lib/auth/roles";

export const dynamic = "force-dynamic";

export default async function AppGroupLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const context = await resolveRequestContext();

  const org = context
    ? {
        organizationName: context.organizationName,
        roleLabel: ROLE_LABELS[context.role],
        isDemo: context.source === "demo",
      }
    : null;

  return <AppShell org={org}>{children}</AppShell>;
}
