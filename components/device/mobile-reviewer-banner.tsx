"use client";

import Link from "next/link";
import { ArrowRight, Smartphone, TabletSmartphone } from "lucide-react";
import { useDevice } from "@/components/device/device-provider";

// A subtle, confident reviewer banner shown only on small and medium screens.
// It frames the experience for someone arriving from a phone or tablet and
// points them at the flagship path. It is not apologetic and it hides itself on
// desktop and when the device is unknown, so it never adds noise where the full
// layout is available. Place it only on a few high value pages.
export function MobileReviewerBanner({
  cta = { href: "/revenue-command-center", label: "Open Revenue Command Center" },
}: {
  cta?: { href: string; label: string };
}) {
  const device = useDevice();

  if (!device.isMobile && !device.isTablet) {
    return null;
  }

  const Icon = device.isTablet ? TabletSmartphone : Smartphone;
  const surface = device.isTablet ? "tablet" : "phone";

  return (
    <div className="rounded-lg border border-primary/30 bg-primary/5 p-3">
      <div className="flex items-start gap-3">
        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-primary/15 text-primary">
          <Icon className="h-4 w-4" />
        </span>
        <div className="min-w-0 space-y-1.5">
          <p className="text-sm font-medium">
            Optimized for quick review on your {surface}
          </p>
          <p className="text-xs text-muted-foreground">
            SignalFlow is a deterministic, demo safe revenue platform. This view
            is tuned for fast review. The full command center layout opens on a
            larger screen.
          </p>
          <Link
            href={cta.href}
            className="inline-flex min-h-[40px] items-center gap-1 text-xs font-medium text-primary hover:underline"
          >
            {cta.label}
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      </div>
    </div>
  );
}
