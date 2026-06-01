"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";
import { primaryNav } from "@/lib/config/navigation";
import { cn } from "@/lib/utils";

// The key reviewer destinations, surfaced first in the mobile menu so a
// recruiter can reach the flagship paths in one tap. The remaining nav items
// follow under a divider. This is presentation only; it links to the same
// routes the desktop sidebar uses.
const PRIORITY_HREFS = [
  "/dashboard",
  "/revenue-command-center",
  "/ai-center",
  "/review-queue",
  "/voice-command-center",
  "/provider-management",
];

// A tap-friendly navigation menu for small and medium screens. The desktop
// sidebar stays the primary navigation at lg and up; this fills the gap below
// that breakpoint, where the sidebar is hidden. It is a client component with a
// simple open state, an accessible toggle, and large tap targets.
export function MobileNav() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  // Close the menu whenever the route changes, so a tap navigates and dismisses.
  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  // Lock body scroll while the overlay is open.
  useEffect(() => {
    if (!open) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previous;
    };
  }, [open]);

  const priority = PRIORITY_HREFS.map((href) =>
    primaryNav.find((item) => item.href === href),
  ).filter((item): item is (typeof primaryNav)[number] => Boolean(item));
  const rest = primaryNav.filter(
    (item) => !PRIORITY_HREFS.includes(item.href),
  );

  const isActive = (href: string) =>
    pathname === href || pathname.startsWith(`${href}/`);

  return (
    <div className="lg:hidden">
      <button
        type="button"
        aria-label={open ? "Close navigation menu" : "Open navigation menu"}
        aria-expanded={open}
        aria-controls="mobile-nav-panel"
        onClick={() => setOpen((value) => !value)}
        className="flex h-10 w-10 items-center justify-center rounded-md border border-border bg-card text-foreground hover:bg-accent"
      >
        {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
      </button>

      {open ? (
        <div className="fixed inset-0 z-50">
          <button
            type="button"
            aria-label="Close navigation menu"
            tabIndex={-1}
            onClick={() => setOpen(false)}
            className="absolute inset-0 bg-background/70 backdrop-blur-sm"
          />
          <nav
            id="mobile-nav-panel"
            className="absolute right-0 top-0 flex h-full w-72 max-w-[85vw] flex-col overflow-y-auto border-l border-border bg-card p-4 shadow-xl"
            aria-label="Primary"
          >
            <div className="mb-3 flex items-center justify-between">
              <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                Jump to
              </p>
              <button
                type="button"
                aria-label="Close navigation menu"
                onClick={() => setOpen(false)}
                className="flex h-9 w-9 items-center justify-center rounded-md hover:bg-accent"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-1">
              {priority.map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      "flex min-h-[44px] items-center gap-3 rounded-md px-3 text-sm font-medium transition-colors",
                      isActive(item.href)
                        ? "bg-primary/15 text-primary"
                        : "text-foreground hover:bg-accent",
                    )}
                  >
                    <Icon className="h-4 w-4 shrink-0" />
                    {item.label}
                  </Link>
                );
              })}
            </div>

            <div className="my-3 border-t border-border" />

            <div className="space-y-1">
              {rest.map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      "flex min-h-[44px] items-center gap-3 rounded-md px-3 text-sm transition-colors",
                      isActive(item.href)
                        ? "bg-primary/15 text-primary"
                        : "text-muted-foreground hover:bg-accent hover:text-foreground",
                    )}
                  >
                    <Icon className="h-4 w-4 shrink-0" />
                    {item.label}
                  </Link>
                );
              })}
            </div>
          </nav>
        </div>
      ) : null}
    </div>
  );
}
