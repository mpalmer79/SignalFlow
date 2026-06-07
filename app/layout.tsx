import type { Metadata } from "next";
import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";
import { AuthProvider } from "@/components/auth/auth-provider";
import { DeviceProvider } from "@/components/device/device-provider";
import { ProjectAssistant } from "@/components/project-assistant/ProjectAssistant";
import { appConfig } from "@/lib/config/app";
import "./globals.css";

const siteUrl = "https://signalflow-revenue.vercel.app";
const socialImage = "/og-signalflow.png";
const socialTitle = `${appConfig.name}: ${appConfig.subtitle}`;
const socialDescription = appConfig.positioning;

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: socialTitle,
    template: `%s | ${appConfig.name}`,
  },
  description: socialDescription,
  openGraph: {
    title: socialTitle,
    description: socialDescription,
    url: siteUrl,
    siteName: appConfig.name,
    type: "website",
    images: [
      {
        url: socialImage,
        width: 1200,
        height: 630,
        alt: "SignalFlow AI-native revenue workflow platform",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: socialTitle,
    description: socialDescription,
    images: [socialImage],
  },
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
          <ProjectAssistant />
        </body>
      </html>
    </AuthProvider>
  );
}
