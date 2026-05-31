import type { Metadata } from "next";
import { Building2, KeyRound, ShieldCheck, TestTube2, Users } from "lucide-react";
import { SectionHeading } from "@/components/section-heading";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { guardPage } from "@/lib/auth/guard-page";
import { getSettingsView } from "@/lib/services/settings-service";
import { ROLE_LABELS } from "@/lib/auth/roles";
import { PERMISSION_LABELS } from "@/lib/auth/permissions";
import type { Role } from "@/lib/types/auth";

export const metadata: Metadata = { title: "Settings" };
export const dynamic = "force-dynamic";

export default async function SettingsPage() {
  const { context, denied } = await guardPage("VIEW_DASHBOARD");
  if (denied) return denied;

  const settings = await getSettingsView(context);

  return (
    <>
      <SectionHeading
        title="Settings"
        description="Organization profile, current auth context, roles and permissions, and security boundaries. Management actions require the owner role and are not enabled in this phase."
        actions={
          settings.isDemo ? (
            <Badge variant="warning">Demo auth context</Badge>
          ) : (
            <Badge variant="success">Clerk session</Badge>
          )
        }
      />

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="h-4 w-4 text-primary" />
              Organization profile
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <Row label="Name" value={settings.organizationName} />
            <Row label="Organization id" value={settings.organizationId} />
            <Row label="Your role" value={ROLE_LABELS[settings.role]} />
            <Row
              label="Manage settings"
              value={settings.canManageSettings ? "Permitted" : "Restricted to owner"}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 text-primary" />
              Current auth context
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <Row
              label="Auth source"
              value={settings.isDemo ? "Demo fallback context" : "Clerk session"}
            />
            <Row
              label="Clerk"
              value={settings.clerkConfigured ? "Configured" : "Not configured"}
            />
            <Row label="Role" value={ROLE_LABELS[settings.role]} />
            <Row
              label="Production auth"
              value={settings.isDemo ? "No, demo context" : "Yes"}
            />
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TestTube2 className="h-4 w-4 text-warning" />
            Provider status
          </CardTitle>
        </CardHeader>
        <CardContent className="grid gap-2 text-sm sm:grid-cols-2">
          <Row label="AI providers" value="Mocked, no calls" />
          <Row label="SMS, email, voice" value="Disabled, simulation only" />
          <Row label="Outbound communication" value="Disabled" />
          <Row label="Demo mode" value="Enabled" />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-4 w-4 text-primary" />
            Members
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {settings.members.length > 0 ? (
            settings.members.map((member) => (
              <div
                key={member.userId}
                className="flex items-center justify-between gap-3 rounded-md border border-border bg-secondary/30 p-3"
              >
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium">
                    {member.userName}
                  </p>
                  <p className="truncate text-xs text-muted-foreground">
                    {member.userEmail}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="muted">{ROLE_LABELS[member.role]}</Badge>
                  <Badge
                    variant={member.status === "ACTIVE" ? "success" : "muted"}
                  >
                    {member.status}
                  </Badge>
                </div>
              </div>
            ))
          ) : (
            <p className="rounded-md border border-dashed border-border p-4 text-center text-xs text-muted-foreground">
              No members found. Invitation flows arrive in a later phase.
            </p>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <KeyRound className="h-4 w-4 text-primary" />
            Roles and permissions
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex flex-wrap gap-2">
            {(Object.keys(ROLE_LABELS) as Role[]).map((role) => (
              <Badge
                key={role}
                variant={role === settings.role ? "primary" : "muted"}
              >
                {ROLE_LABELS[role]}
              </Badge>
            ))}
          </div>
          <div>
            <p className="mb-1 text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Permissions for your role ({ROLE_LABELS[settings.role]})
            </p>
            <div className="flex flex-wrap gap-2">
              {settings.rolePermissions.map((permission) => (
                <Badge key={permission} variant="outline">
                  {PERMISSION_LABELS[permission]}
                </Badge>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ShieldCheck className="h-4 w-4 text-success" />
            Security boundaries
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-1.5 text-sm text-muted-foreground">
          <p>Authorization is enforced server-side on every protected page.</p>
          <p>
            The organization id comes from the resolved server context, never
            from the client.
          </p>
          <p>Every business repository query is scoped to the active organization.</p>
          <p>
            The demo auth context is clearly labeled and is not production
            authentication.
          </p>
          <p>No secrets are committed and no provider calls are made.</p>
        </CardContent>
      </Card>
    </>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <span className="text-muted-foreground">{label}</span>
      <span className="truncate font-medium">{value}</span>
    </div>
  );
}
