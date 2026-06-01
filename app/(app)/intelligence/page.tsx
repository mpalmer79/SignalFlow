import type { Metadata } from "next";
import Link from "next/link";
import { AlertTriangle, Sparkles, Target, TrendingUp } from "lucide-react";
import { SectionHeading } from "@/components/section-heading";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { IntelligenceTable } from "@/components/intelligence/intelligence-table";
import { getIntelligenceOverview } from "@/lib/services/intelligence-service";
import { guardPage } from "@/lib/auth/guard-page";
import { readParam } from "@/lib/lists/list-helpers";
import { cn } from "@/lib/utils";

export const metadata: Metadata = { title: "Intelligence" };
export const dynamic = "force-dynamic";

const TABS = [
  { key: "top", label: "Top intelligence" },
  { key: "all", label: "All customers" },
] as const;

export default async function IntelligencePage({
  searchParams,
}: {
  searchParams: Record<string, string | string[] | undefined>;
}) {
  const { context, denied } = await guardPage("VIEW_INTELLIGENCE");
  if (denied) return denied;

  const overview = await getIntelligenceOverview(context);
  const tabRaw = readParam(searchParams.tab) ?? "top";
  const tab = (TABS as readonly { key: string }[]).some((t) => t.key === tabRaw)
    ? tabRaw
    : "top";

  return (
    <>
      <SectionHeading
        title="Customer intelligence"
        description="Deterministic intent, opportunity, and engagement scoring across every customer. Recommendations are computed locally with no external model calls."
      />

      <nav
        aria-label="Intelligence view"
        className="flex flex-wrap gap-2 border-b border-border pb-2"
      >
        {TABS.map((t) => {
          const isActive = t.key === tab;
          return (
            <Link
              key={t.key}
              href={t.key === "top" ? "/intelligence" : `/intelligence?tab=${t.key}`}
              aria-current={isActive ? "true" : undefined}
              className={cn(
                "inline-flex min-h-[36px] items-center rounded-md px-3 py-1.5 text-sm",
                isActive
                  ? "bg-primary/15 text-primary"
                  : "text-muted-foreground hover:bg-accent hover:text-foreground",
              )}
            >
              {t.label}
            </Link>
          );
        })}
        <span className="ml-auto text-xs text-muted-foreground">
          Looking for raw signals?{" "}
          <Link href="/signals" className="text-primary hover:underline">
            Open the Signal Explorer
          </Link>
        </span>
      </nav>

      {tab === "top" ? (
        <>
          <div className="grid gap-4 lg:grid-cols-2">
            <RankCard
              title="Top intent customers"
              icon={<TrendingUp className="h-4 w-4 text-primary" />}
              rows={overview.topIntent.map((s) => ({
                id: s.customerId,
                name: s.customerName,
                value: `${s.intentScore} intent`,
              }))}
            />
            <RankCard
              title="Top revenue opportunities"
              icon={<Target className="h-4 w-4 text-success" />}
              rows={overview.topOpportunities.map((s) => ({
                id: s.customerId,
                name: s.customerName,
                value: `${s.opportunityScore} opportunity`,
              }))}
            />
          </div>

          <div className="grid gap-4 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-success" />
                  Recently detected opportunities
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {overview.detectedOpportunities.slice(0, 5).map((opp) => (
                  <Link
                    key={`${opp.customerId}-${opp.type}-${opp.sourceSignalId}`}
                    href={`/customers/${opp.customerId}`}
                    className="block rounded-md border border-border bg-secondary/30 p-3 transition-colors hover:border-primary/40"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-sm font-medium">{opp.type}</p>
                      <Badge variant="success">{opp.confidence}%</Badge>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {opp.customerName}: {opp.reason}
                    </p>
                  </Link>
                ))}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4 text-warning" />
                  Customers requiring attention
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {overview.needingAttention.length > 0 ? (
                  overview.needingAttention.slice(0, 5).map((s) => (
                    <Link
                      key={s.customerId}
                      href={`/customers/${s.customerId}`}
                      className="flex items-center justify-between gap-2 rounded-md border border-border bg-secondary/30 p-3 transition-colors hover:border-primary/40"
                    >
                      <span className="text-sm font-medium">{s.customerName}</span>
                      <Badge variant={s.hasCriticalRisk ? "danger" : "warning"}>
                        {s.intentLevel}
                      </Badge>
                    </Link>
                  ))
                ) : (
                  <p className="rounded-md border border-dashed border-border p-4 text-center text-xs text-muted-foreground">
                    No customers currently require attention.
                  </p>
                )}
              </CardContent>
            </Card>
          </div>
        </>
      ) : (
        <div className="space-y-4">
          <h2 className="text-sm font-semibold">All customers by intelligence</h2>
          <IntelligenceTable summaries={overview.summaries} />
        </div>
      )}
    </>
  );
}

interface RankRow {
  id: string;
  name: string;
  value: string;
}

function RankCard({
  title,
  icon,
  rows,
}: {
  title: string;
  icon: React.ReactNode;
  rows: RankRow[];
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          {icon}
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        {rows.map((row, index) => (
          <Link
            key={row.id}
            href={`/customers/${row.id}`}
            className="flex items-center justify-between gap-2 rounded-md px-2 py-1.5 transition-colors hover:bg-accent"
          >
            <span className="flex items-center gap-2 text-sm">
              <span className="font-mono text-xs text-muted-foreground">
                {index + 1}
              </span>
              {row.name}
            </span>
            <span className="text-xs font-medium text-muted-foreground">
              {row.value}
            </span>
          </Link>
        ))}
      </CardContent>
    </Card>
  );
}
