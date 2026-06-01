import { cn } from "@/lib/utils";

// SignalFlow brand logo, ported from design-system/brand/logo-lockups. The mark
// is a signal-wave glyph in a rounded blue tile; the wordmark pairs navy ink
// with a blue "Flow". Inlined as SVG so it renders crisply without a static
// asset pipeline and adapts to the surrounding theme.

export function LogoMark({
  size = 36,
  className,
}: {
  size?: number;
  className?: string;
}) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 96 96"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-label="SignalFlow logo mark"
      className={className}
    >
      <rect width="96" height="96" rx="22" fill="#2563EB" />
      <rect width="96" height="96" rx="22" fill="url(#sfTile)" fillOpacity="0.18" />
      <circle cx="48" cy="48" r="6.5" fill="#fff" />
      <path
        d="M62 34a20 20 0 0 1 0 28"
        stroke="#fff"
        strokeWidth="5.5"
        strokeLinecap="round"
        fill="none"
      />
      <path
        d="M72 26a34 34 0 0 1 0 44"
        stroke="#fff"
        strokeWidth="5.5"
        strokeLinecap="round"
        fill="none"
        strokeOpacity="0.62"
      />
      <path
        d="M34 62a20 20 0 0 1 0-28"
        stroke="#fff"
        strokeWidth="5.5"
        strokeLinecap="round"
        fill="none"
      />
      <path
        d="M24 70a34 34 0 0 1 0-44"
        stroke="#fff"
        strokeWidth="5.5"
        strokeLinecap="round"
        fill="none"
        strokeOpacity="0.62"
      />
      <defs>
        <linearGradient
          id="sfTile"
          x1="0"
          y1="0"
          x2="96"
          y2="96"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#fff" />
          <stop offset="1" stopColor="#fff" stopOpacity="0" />
        </linearGradient>
      </defs>
    </svg>
  );
}

export function Logo({ className }: { className?: string }) {
  return (
    <span className={cn("inline-flex items-center gap-2.5", className)}>
      <LogoMark size={32} />
      <span className="text-lg font-semibold tracking-tight text-foreground">
        Signal<span className="text-primary">Flow</span>
      </span>
    </span>
  );
}
