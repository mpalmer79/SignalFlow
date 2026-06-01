import {
  MOBILE_MAX_WIDTH,
  TABLET_MAX_WIDTH,
  profileFromType,
  type DeviceOrientation,
  type DeviceProfile,
  type DeviceType,
} from "./device-types";

// Pure device detection helpers. They take inputs (a user agent string, a
// viewport width, capability flags) and return a deterministic result. They
// touch no browser globals directly, so they are easy to test and safe to call
// on the server. The user agent is only a weak initial hint; the client refines
// with viewport and capability signals after mount.

// Classify a user agent string into a device type. This is intentionally
// conservative: anything uncertain returns unknown rather than guessing. The
// result is a hint, not a decision.
export function deviceTypeFromUserAgent(
  userAgent: string | null | undefined,
): DeviceType {
  if (!userAgent) return "unknown";
  const ua = userAgent.toLowerCase();

  // Tablets first, because many tablet user agents also contain mobile tokens.
  const tabletHint =
    ua.includes("ipad") ||
    (ua.includes("android") && !ua.includes("mobile")) ||
    ua.includes("tablet") ||
    ua.includes("kindle") ||
    ua.includes("silk") ||
    ua.includes("playbook");
  if (tabletHint) return "tablet";

  const mobileHint =
    ua.includes("iphone") ||
    ua.includes("ipod") ||
    (ua.includes("android") && ua.includes("mobile")) ||
    ua.includes("windows phone") ||
    ua.includes("blackberry") ||
    ua.includes("bb10") ||
    ua.includes("opera mini") ||
    ua.includes("mobile safari");
  if (mobileHint) return "mobile";

  // Known desktop platforms with no mobile or tablet token.
  const desktopHint =
    ua.includes("windows nt") ||
    ua.includes("macintosh") ||
    ua.includes("x11") ||
    ua.includes("linux x86") ||
    ua.includes("cros");
  if (desktopHint) return "desktop";

  return "unknown";
}

// Refine a device type from a viewport width. Width is the most reliable signal
// available on the client, so it takes precedence over the user agent hint when
// present. A non-positive or missing width leaves the prior type unchanged.
export function deviceTypeFromWidth(
  width: number | null | undefined,
  fallback: DeviceType = "unknown",
): DeviceType {
  if (typeof width !== "number" || !Number.isFinite(width) || width <= 0) {
    return fallback;
  }
  if (width <= MOBILE_MAX_WIDTH) return "mobile";
  if (width <= TABLET_MAX_WIDTH) return "tablet";
  return "desktop";
}

// Derive orientation from width and height. Returns unknown when either value
// is missing, so a partial environment never produces a misleading result.
export function orientationFromSize(
  width: number | null | undefined,
  height: number | null | undefined,
): DeviceOrientation {
  if (
    typeof width !== "number" ||
    typeof height !== "number" ||
    !Number.isFinite(width) ||
    !Number.isFinite(height) ||
    width <= 0 ||
    height <= 0
  ) {
    return "unknown";
  }
  return height >= width ? "portrait" : "landscape";
}

// The server side initial profile. It uses the user agent only as a weak hint
// and never sets a viewport width, so the client can refine without a hydration
// mismatch. Uncertain user agents yield an unknown profile.
export function serverDeviceProfile(
  userAgent: string | null | undefined,
): DeviceProfile {
  const type = deviceTypeFromUserAgent(userAgent);
  return profileFromType(type, {
    hasTouch: type === "mobile" || type === "tablet",
    orientation: "unknown",
    viewportWidth: null,
  });
}

// Inputs the client collects after mount. All fields are optional so the
// function degrades safely when a browser API is unavailable.
export interface ClientDeviceSignals {
  width?: number | null;
  height?: number | null;
  hasTouch?: boolean | null;
  coarsePointer?: boolean | null;
  userAgent?: string | null;
}

// Build the refined client profile. Width drives the type; when width is
// missing, the user agent hint is used. Touch is true when either a touch
// capability or a coarse pointer is reported. Missing APIs do not throw.
export function clientDeviceProfile(
  signals: ClientDeviceSignals,
): DeviceProfile {
  const uaType = deviceTypeFromUserAgent(signals.userAgent);
  const type = deviceTypeFromWidth(signals.width, uaType);
  const hasTouch = Boolean(signals.hasTouch) || Boolean(signals.coarsePointer);
  return profileFromType(type, {
    hasTouch,
    orientation: orientationFromSize(signals.width, signals.height),
    viewportWidth:
      typeof signals.width === "number" && Number.isFinite(signals.width)
        ? signals.width
        : null,
  });
}
