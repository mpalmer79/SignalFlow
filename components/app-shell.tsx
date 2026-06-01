import { DemoModeBanner } from "@/components/demo-mode-banner";
import { DeviceMarker } from "@/components/device/device-provider";
import { Header, type HeaderOrg } from "@/components/header";
import { Sidebar } from "@/components/sidebar";

export function AppShell({
  children,
  org,
}: {
  children: React.ReactNode;
  org: HeaderOrg | null;
}) {
  // DeviceMarker carries the resolved data-device attribute for CSS targeting.
  // It uses display contents, so it does not change the layout. The mobile space
  // y is tightened on phones and relaxes at sm and up.
  return (
    <DeviceMarker>
      <div className="flex min-h-screen">
        <Sidebar />
        <div className="flex min-w-0 flex-1 flex-col">
          <DemoModeBanner />
          <Header org={org} />
          <main className="flex-1 space-y-6 p-4 sm:space-y-8 sm:p-6 lg:p-8">
            {children}
          </main>
        </div>
      </div>
    </DeviceMarker>
  );
}
