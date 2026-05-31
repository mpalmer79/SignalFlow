import { DemoModeBanner } from "@/components/demo-mode-banner";
import { Header, type HeaderOrg } from "@/components/header";
import { Sidebar } from "@/components/sidebar";

export function AppShell({
  children,
  org,
}: {
  children: React.ReactNode;
  org: HeaderOrg | null;
}) {
  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <div className="flex min-w-0 flex-1 flex-col">
        <DemoModeBanner />
        <Header org={org} />
        <main className="flex-1 space-y-8 p-4 sm:p-6 lg:p-8">{children}</main>
      </div>
    </div>
  );
}
