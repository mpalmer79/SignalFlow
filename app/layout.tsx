import type { Metadata } from "next";
import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";
import { AuthProvider } from "@/components/auth/auth-provider";
import { DeviceProvider } from "@/components/device/device-provider";
import { appConfig } from "@/lib/config/app";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: `${appConfig.name}: ${appConfig.subtitle}`,
    template: `%s | ${appConfig.name}`,
  },
  description: appConfig.positioning,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // The body starts with an unknown device marker so the server and the first
  // client paint agree, avoiding a hydration mismatch. The DeviceProvider
  // refines the profile after mount, and DeviceMarker inside the client tree
  // updates the data-device attribute for CSS targeting. AuthProvider stays the
  // outermost wrapper, unchanged.
  return (
    <AuthProvider>
      <html
        lang="en"
        className={`${GeistSans.variable} ${GeistMono.variable}`}
      >
        <body
          data-device="unknown"
          className="min-h-screen bg-background font-sans text-foreground"
        >
          <DeviceProvider>{children}</DeviceProvider>
        </body>
      </html>
    </AuthProvider>
  );
}
