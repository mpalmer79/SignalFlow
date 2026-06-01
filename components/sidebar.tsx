"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Radio } from "lucide-react";
import { appConfig } from "@/lib/config/app";
import { primaryNav } from "@/lib/config/navigation";
import { cn } from "@/lib/utils";

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden w-64 shrink-0 flex-col border-r border-border bg-card/40 lg:flex">
      <Link
        href="/"
        aria-label="Go to SignalFlow home"
        className="flex h-16 items-center gap-2.5 border-b border-border px-5 transition-colors hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring"
      >
        <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/15 text-primary">
          <Radio className="h-5 w-5" />
        </span>
        <div className="leading-tight">
          <p className="text-sm font-semibold">{appConfig.name}</p>
          <p className="text-[11px] text-muted-foreground">Revenue OS</p>
        </div>
      </Link>

      <nav className="flex-1 space-y-1 overflow-y-auto p-3">
        {primaryNav.map((item) => {
          const active =
            pathname === item.href || pathname.startsWith(`${item.href}/`);
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                active
                  ? "bg-primary/15 text-primary"
                  : "text-muted-foreground hover:bg-accent hover:text-foreground",
              )}
            >
              <Icon className="h-4 w-4 shrink-0" />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-border p-4">
        <p className="text-[11px] leading-relaxed text-muted-foreground">
          Phase 0 foundation. Typed mock data and mock provider boundaries only.
        </p>
      </div>
    </aside>
  );
}
