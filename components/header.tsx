"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Radio } from "lucide-react";
import { appConfig } from "@/lib/config/app";
import { primaryNav } from "@/lib/config/navigation";

function currentTitle(pathname: string): string {
  const match = primaryNav.find(
    (item) => pathname === item.href || pathname.startsWith(`${item.href}/`),
  );
  return match?.label ?? appConfig.name;
}

function currentDescription(pathname: string): string {
  const match = primaryNav.find(
    (item) => pathname === item.href || pathname.startsWith(`${item.href}/`),
  );
  return match?.description ?? appConfig.positioning;
}

export interface HeaderOrg {
  organizationName: string;
  roleLabel: string;
  isDemo: boolean;
}

export function Header({ org }: { org: HeaderOrg | null }) {
  const pathname = usePathname();

  const initials = org
    ? org.organizationName
        .split(" ")
        .map((word) => word[0])
        .slice(0, 2)
        .join("")
        .toUpperCase()
    : "SF";

  return (
    <header className="flex h-16 items-center justify-between gap-4 border-b border-border bg-background/80 px-4 backdrop-blur sm:px-6">
      <div className="flex items-center gap-2 lg:hidden">
        <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/15 text-primary">
          <Radio className="h-4 w-4" />
        </span>
        <span className="text-sm font-semibold">{appConfig.name}</span>
      </div>

      <div className="hidden min-w-0 lg:block">
        <p className="truncate text-sm font-semibold">
          {currentTitle(pathname)}
        </p>
        <p className="truncate text-xs text-muted-foreground">
          {currentDescription(pathname)}
        </p>
      </div>

      <div className="flex items-center gap-3">
        <Link
          href="/"
          className="text-xs font-medium text-muted-foreground hover:text-foreground"
        >
          Overview
        </Link>
        <span className="flex items-center gap-2 rounded-full border border-border bg-card px-3 py-1.5">
          <span className="flex h-6 w-6 items-center justify-center rounded-full bg-secondary text-[11px] font-semibold">
            {initials}
          </span>
          <span className="hidden leading-tight sm:block">
            <span className="block max-w-[12rem] truncate text-xs font-medium">
              {org?.organizationName ?? "Demo workspace"}
            </span>
            <span className="block text-[11px] text-muted-foreground">
              {org ? org.roleLabel : "Viewer"}
              {org?.isDemo ? " (demo auth)" : ""}
            </span>
          </span>
        </span>
      </div>
    </header>
  );
}
