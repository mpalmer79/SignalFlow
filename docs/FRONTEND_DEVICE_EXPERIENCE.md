# Frontend Device Experience

SignalFlow provides a responsive, device-aware reviewer experience. The app is
the same on every screen; a small device awareness layer adds presentation
polish so the platform feels intentional on a phone, a tablet, a small laptop,
and a desktop. Responsive CSS remains the primary strategy. Device detection
supports it; it does not replace it.

## Device categories

```text
mobile    narrow viewport, touch first
tablet    medium viewport, often touch
desktop   wide viewport, pointer first
unknown   safe neutral default before detection resolves
```

The unknown state is deliberate. The app must remain fully usable when detection
is uncertain, so unknown renders the standard responsive layout with no device
specific additions.

## Why responsive CSS remains primary

Tailwind responsive classes already drive every layout in the app. They work
during server render, need no JavaScript, and never cause a hydration mismatch.
The device layer is a thin enhancement on top: it adds a navigation menu below
the desktop breakpoint, a short reviewer banner on a few high value pages, and a
data attribute for optional CSS targeting. If the device layer did nothing, the
app would still be responsive and usable. That is the staff level principle
here: detection is a hint, not a dependency.

## Detection approach

The layer is layered, from a weak server hint to a reliable client refinement.

Pure helpers in `lib/device/detect-device.ts` (no browser globals, fully
tested):

- `deviceTypeFromUserAgent` classifies a user agent into a type. It is
  conservative and returns unknown when uncertain.
- `deviceTypeFromWidth` refines a type from viewport width, which is the most
  reliable signal. Width takes precedence over the user agent hint.
- `orientationFromSize` derives portrait or landscape, or unknown when a
  dimension is missing.
- `serverDeviceProfile` builds a server side profile from the user agent only,
  with no viewport width, so the client can refine without a hydration mismatch.
- `clientDeviceProfile` builds the refined profile from width, height, touch,
  coarse pointer, and user agent. Every input is optional, so a missing browser
  API never throws.

Client provider in `components/device/device-provider.tsx`:

- `DeviceProvider` renders the unknown profile on the server and during the
  first client paint, then measures after mount and on resize or orientation
  change. Updates are scheduled with requestAnimationFrame and applied only when
  a meaningful field changes, to avoid noisy re-renders.
- `useDevice` reads the resolved profile anywhere in the client tree.
- `DeviceMarker` exposes the resolved type as `data-device` for CSS targeting.
  It uses display contents, so it does not affect layout.

The body starts with `data-device="unknown"` in the root layout, which matches
the first client paint and avoids hydration errors. AuthProvider remains the
outermost wrapper and is unchanged.

## Device profile contract

```ts
type DeviceType = "mobile" | "tablet" | "desktop" | "unknown";
type DeviceOrientation = "portrait" | "landscape" | "unknown";

interface DeviceProfile {
  type: DeviceType;
  isMobile: boolean;
  isTablet: boolean;
  isDesktop: boolean;
  hasTouch: boolean;
  orientation: DeviceOrientation;
  viewportWidth: number | null;
}
```

## What changes on mobile and tablet

- Navigation. The desktop sidebar is hidden below the large breakpoint. A
  tap-friendly menu in the header (`components/device/mobile-nav.tsx`) opens a
  panel that lists the key reviewer destinations first (Dashboard, Revenue
  Command Center, AI Center, Review Queue, Voice Command Center, Provider
  Management), then the rest. Tap targets are at least 44 pixels tall.
- Reviewer banner. A short, confident banner
  (`components/device/mobile-reviewer-banner.tsx`) appears on the landing page,
  the dashboard, and the Revenue Command Center when the device is mobile or
  tablet. It frames the experience and points at the flagship path. It is hidden
  on desktop and when the device is unknown, so it never adds noise.
- Reduced density. The Revenue Command Center lifecycle row renders two columns
  on phones with the supplementary hint hidden, while the stage label and the
  live count stay visible. The hint reappears at the small breakpoint and up.
  No important content is permanently hidden; condensed content returns at
  larger sizes.
- Spacing. The app shell uses tighter vertical spacing on phones and relaxes at
  the small breakpoint and up.

## What does not use device detection

Device detection is used only for presentation. It is never used for
authorization, business logic, database behavior, AI behavior, provider
selection, workflow execution, or compliance rules. Those remain identical on
every device.

## Known limitations

- The server hint is a weak signal. The reliable classification happens on the
  client after mount, so the reviewer banner and the data attribute settle a
  frame after first paint. This is intentional and keeps hydration safe.
- User agent classification is heuristic. Unusual or spoofed user agents resolve
  to unknown on the server and are then corrected by viewport width on the
  client.
- The mobile navigation is a focused enhancement, not a full navigation system.
  The desktop sidebar remains the primary navigation at the large breakpoint.

## Manual validation steps

Open the deployed demo and resize or use device emulation. Expected behavior:

```text
iPhone width (about 375)      single column content, mobile menu, reviewer
                              banner on landing, dashboard, and command center,
                              two column lifecycle row with hints hidden
Android phone width (360-412) same as iPhone width
iPad or tablet width (768-1024) two to four column grids, mobile menu still
                              available, reviewer banner present, hints visible
small laptop width (1280)     desktop sidebar visible, no reviewer banner, four
                              to seven column grids
desktop width (1440 and up)   full command center layout, seven column
                              lifecycle row
unknown device                standard responsive layout, no device specific
                              additions, fully usable
```

Accessibility checks performed: the mobile menu toggle has an accessible label
and aria-expanded, the panel is keyboard reachable and closes on route change,
tap targets meet the minimum size, and no important content is hidden only
because of device type.
