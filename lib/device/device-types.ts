// Device awareness types. These describe a presentation hint only. They are
// never used for authorization, business logic, database behavior, AI behavior,
// provider selection, workflow execution, or compliance rules. Responsive CSS
// remains the primary strategy; this layer supports it.

export type DeviceType = "mobile" | "tablet" | "desktop" | "unknown";

export type DeviceOrientation = "portrait" | "landscape" | "unknown";

export interface DeviceProfile {
  type: DeviceType;
  isMobile: boolean;
  isTablet: boolean;
  isDesktop: boolean;
  hasTouch: boolean;
  orientation: DeviceOrientation;
  viewportWidth: number | null;
}

// Breakpoints used to refine a profile from viewport width. They align with the
// Tailwind sm and lg breakpoints the app already uses, so the device hint and
// the responsive classes stay consistent.
export const MOBILE_MAX_WIDTH = 640;
export const TABLET_MAX_WIDTH = 1024;

// A safe default used on the server and before the client refines. Unknown is
// deliberately neutral: the app must remain fully usable in this state.
export const UNKNOWN_DEVICE_PROFILE: DeviceProfile = {
  type: "unknown",
  isMobile: false,
  isTablet: false,
  isDesktop: false,
  hasTouch: false,
  orientation: "unknown",
  viewportWidth: null,
};

// Build a complete profile from a device type, filling the boolean conveniences
// so consumers do not repeat the comparisons.
export function profileFromType(
  type: DeviceType,
  extras: Partial<Omit<DeviceProfile, "type" | "isMobile" | "isTablet" | "isDesktop">> = {},
): DeviceProfile {
  return {
    type,
    isMobile: type === "mobile",
    isTablet: type === "tablet",
    isDesktop: type === "desktop",
    hasTouch: extras.hasTouch ?? false,
    orientation: extras.orientation ?? "unknown",
    viewportWidth: extras.viewportWidth ?? null,
  };
}
