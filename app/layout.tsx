import type { Metadata } from "next";
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
  return (
    <html lang="en" className="dark">
      <body className="min-h-screen bg-background font-sans text-foreground">
        {children}
      </body>
    </html>
  );
}
