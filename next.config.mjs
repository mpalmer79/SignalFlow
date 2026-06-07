/** @type {import('next').NextConfig} */

// Conservative, demo-safe security headers applied to every route. These are
// static response headers only. They add no network calls, no runtime
// dependencies, and no behavior changes to the deterministic demo.
//
// A Content-Security-Policy is intentionally not set here. Next.js injects
// inline bootstrap scripts and styles, and a strict CSP would need per-request
// nonces wired through the framework and the auth client to avoid breaking
// rendering. A brittle CSP that breaks the app is worse than none, so CSP is
// deferred and tracked in docs/TECHNICAL_DEBT_REGISTER.md as work that needs
// deployment-specific testing.
const securityHeaders = [
  // Disallow framing to prevent clickjacking.
  { key: "X-Frame-Options", value: "DENY" },
  // Stop MIME type sniffing.
  { key: "X-Content-Type-Options", value: "nosniff" },
  // Send only the origin to other sites, full path same-origin.
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  // Disable powerful browser features this app never uses.
  {
    key: "Permissions-Policy",
    value:
      "camera=(), microphone=(), geolocation=(), payment=(), usb=(), serial=(), bluetooth=()",
  },
  // Force HTTPS. Safe on Vercel, which serves the app over HTTPS only. Browsers
  // ignore this header when delivered over plain HTTP, so local development is
  // unaffected.
  {
    key: "Strict-Transport-Security",
    value: "max-age=63072000; includeSubDomains; preload",
  },
];

const nextConfig = {
  reactStrictMode: true,
  async headers() {
    return [
      {
        source: "/:path*",
        headers: securityHeaders,
      },
    ];
  },
};

export default nextConfig;
