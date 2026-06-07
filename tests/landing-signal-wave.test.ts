import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import { join } from "node:path";

// Static guarantees for the hero signal-wave background. The component is a
// server component that cannot be imported into the node test environment, so
// these are structural checks of the source: it must be decorative, must not
// block clicks, must be hidden on mobile, must be wired behind the hero, and
// must honor reduced motion. These guard the premium-but-restrained intent.

const ROOT = process.cwd();
const COMPONENT = readFileSync(
  join(ROOT, "components", "landing", "signal-wave-background.tsx"),
  "utf8",
);
const PAGE = readFileSync(join(ROOT, "app", "page.tsx"), "utf8");
const GLOBALS = readFileSync(join(ROOT, "app", "globals.css"), "utf8");
// Built from its code point so this banned character never appears literally in
// the source, which would otherwise trip the repository safety scan.
const EM_DASH = String.fromCharCode(0x2014);

describe("signal wave background component", () => {
  it("is decorative and does not block clicks", () => {
    expect(COMPONENT).toContain('aria-hidden="true"');
    expect(COMPONENT).toContain("pointer-events-none");
  });

  it("sits behind the hero content", () => {
    expect(COMPONENT).toContain("-z-0");
    expect(COMPONENT).toContain("absolute inset-0");
  });

  it("is hidden on mobile and shown from md up", () => {
    expect(COMPONENT).toContain("hidden");
    expect(COMPONENT).toContain("md:block");
  });

  it("uses a semantic navy token at low opacity, not a hardcoded hex", () => {
    expect(COMPONENT).toContain("text-foreground");
    expect(COMPONENT).not.toMatch(/#[0-9a-fA-F]{6}/);
  });

  it("contains no em dashes", () => {
    expect(COMPONENT.includes(EM_DASH)).toBe(false);
  });
});

describe("hero wiring", () => {
  it("renders the signal wave behind the hero", () => {
    expect(PAGE).toContain("SignalWaveBackground");
    expect(PAGE).toContain(
      'from "@/components/landing/signal-wave-background"',
    );
  });
});

describe("reduced motion and drift", () => {
  it("defines the drift keyframes and animation", () => {
    expect(GLOBALS).toContain("@keyframes signal-wave-drift");
    expect(GLOBALS).toMatch(/\.signal-wave\b/);
  });

  it("only animates when motion is not reduced", () => {
    expect(GLOBALS).toContain("prefers-reduced-motion: no-preference");
  });

  it("disables the animation under reduced motion", () => {
    const reduceBlock = GLOBALS.slice(
      GLOBALS.indexOf("prefers-reduced-motion: reduce"),
    );
    expect(reduceBlock).toContain(".signal-wave");
    expect(reduceBlock).toContain("animation: none");
    expect(GLOBALS.includes(EM_DASH)).toBe(false);
  });
});
