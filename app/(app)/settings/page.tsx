import type { Metadata } from "next";
import {
  Building2,
  MessageSquareDashed,
  Package,
  Plug,
  ShieldCheck,
  TestTube2,
} from "lucide-react";
import { SectionHeading } from "@/components/section-heading";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { LucideIcon } from "lucide-react";

export const metadata: Metadata = { title: "Settings" };

interface SettingsSection {
  title: string;
  description: string;
  icon: LucideIcon;
  fields: string[];
}

const sections: SettingsSection[] = [
  {
    title: "Organization",
    description: "Workspace name, time zone, and team membership.",
    icon: Building2,
    fields: ["Workspace name", "Default time zone", "Team members"],
  },
  {
    title: "Vertical pack",
    description: "Select the active industry pack for signals and actions.",
    icon: Package,
    fields: ["Active pack", "Pack-specific signals", "Pack-specific actions"],
  },
  {
    title: "Communication limits",
    description: "Daily send caps and per-channel rate limits.",
    icon: MessageSquareDashed,
    fields: ["Daily SMS cap", "Daily email cap", "Voice call window"],
  },
  {
    title: "Consent rules",
    description: "Quiet hours and opt-out handling defaults.",
    icon: ShieldCheck,
    fields: ["Quiet hours window", "Opt-out keywords", "Re-consent policy"],
  },
  {
    title: "Provider configuration",
    description: "Provider keys for later phases. Mocked in Phase 0.",
    icon: Plug,
    fields: ["AI provider", "SMS provider", "Email provider", "Voice provider"],
  },
  {
    title: "Demo mode",
    description: "Phase 0 runs in demo mode with no live outbound communication.",
    icon: TestTube2,
    fields: ["Demo mode enabled", "Mock providers only", "No real customer data"],
  },
];

export default function SettingsPage() {
  return (
    <>
      <SectionHeading
        title="Settings"
        description="Placeholder configuration for Phase 0. No settings are functional yet."
        actions={<Badge variant="warning">Demo mode locked on</Badge>}
      />
      <div className="grid gap-4 lg:grid-cols-2">
        {sections.map((section) => {
          const Icon = section.icon;
          return (
            <Card key={section.title}>
              <CardHeader>
                <div className="flex items-center gap-3">
                  <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <Icon className="h-5 w-5" />
                  </span>
                  <div>
                    <CardTitle>{section.title}</CardTitle>
                    <p className="text-xs text-muted-foreground">
                      {section.description}
                    </p>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-2">
                {section.fields.map((field) => (
                  <div
                    key={field}
                    className="flex items-center justify-between rounded-md border border-border bg-secondary/30 px-3 py-2"
                  >
                    <span className="text-sm text-muted-foreground">
                      {field}
                    </span>
                    <Badge variant="muted">Coming soon</Badge>
                  </div>
                ))}
              </CardContent>
            </Card>
          );
        })}
      </div>
    </>
  );
}
