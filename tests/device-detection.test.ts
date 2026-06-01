import { describe, it, expect } from "vitest";
import {
  clientDeviceProfile,
  deviceTypeFromUserAgent,
  deviceTypeFromWidth,
  orientationFromSize,
  serverDeviceProfile,
} from "@/lib/device/detect-device";

// Representative user agent strings. These are inert test fixtures, not live
// detection of any real device.
const IPHONE =
  "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1";
const ANDROID_PHONE =
  "Mozilla/5.0 (Linux; Android 14; Pixel 8) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Mobile Safari/537.36";
const IPAD =
  "Mozilla/5.0 (iPad; CPU OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Safari/604.1";
const ANDROID_TABLET =
  "Mozilla/5.0 (Linux; Android 13; SM-X710) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36";
const DESKTOP =
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36";

describe("deviceTypeFromUserAgent", () => {
  it("maps an iPhone user agent to mobile", () => {
    expect(deviceTypeFromUserAgent(IPHONE)).toBe("mobile");
  });

  it("maps an Android phone user agent to mobile", () => {
    expect(deviceTypeFromUserAgent(ANDROID_PHONE)).toBe("mobile");
  });

  it("maps an iPad user agent to tablet", () => {
    expect(deviceTypeFromUserAgent(IPAD)).toBe("tablet");
  });

  it("maps an Android tablet user agent to tablet", () => {
    expect(deviceTypeFromUserAgent(ANDROID_TABLET)).toBe("tablet");
  });

  it("maps a desktop user agent to desktop", () => {
    expect(deviceTypeFromUserAgent(DESKTOP)).toBe("desktop");
  });

  it("returns unknown for a missing or unrecognized user agent", () => {
    expect(deviceTypeFromUserAgent(null)).toBe("unknown");
    expect(deviceTypeFromUserAgent("")).toBe("unknown");
    expect(deviceTypeFromUserAgent("SomeRandomBot/1.0")).toBe("unknown");
  });
});

describe("deviceTypeFromWidth", () => {
  it("refines a narrow viewport to mobile", () => {
    expect(deviceTypeFromWidth(375)).toBe("mobile");
    expect(deviceTypeFromWidth(640)).toBe("mobile");
  });

  it("refines a medium viewport to tablet", () => {
    expect(deviceTypeFromWidth(768)).toBe("tablet");
    expect(deviceTypeFromWidth(1024)).toBe("tablet");
  });

  it("refines a wide viewport to desktop", () => {
    expect(deviceTypeFromWidth(1280)).toBe("desktop");
    expect(deviceTypeFromWidth(1920)).toBe("desktop");
  });

  it("returns the fallback when width is missing or invalid", () => {
    expect(deviceTypeFromWidth(null, "desktop")).toBe("desktop");
    expect(deviceTypeFromWidth(undefined)).toBe("unknown");
    expect(deviceTypeFromWidth(0, "tablet")).toBe("tablet");
    expect(deviceTypeFromWidth(Number.NaN)).toBe("unknown");
  });
});

describe("orientationFromSize", () => {
  it("detects portrait when height is at least width", () => {
    expect(orientationFromSize(375, 812)).toBe("portrait");
    expect(orientationFromSize(500, 500)).toBe("portrait");
  });

  it("detects landscape when width exceeds height", () => {
    expect(orientationFromSize(812, 375)).toBe("landscape");
  });

  it("returns unknown when a dimension is missing", () => {
    expect(orientationFromSize(375, null)).toBe("unknown");
    expect(orientationFromSize(null, 812)).toBe("unknown");
    expect(orientationFromSize(0, 0)).toBe("unknown");
  });
});

describe("serverDeviceProfile", () => {
  it("uses the user agent as a hint and sets no viewport width", () => {
    const profile = serverDeviceProfile(IPHONE);
    expect(profile.type).toBe("mobile");
    expect(profile.isMobile).toBe(true);
    expect(profile.viewportWidth).toBeNull();
    expect(profile.hasTouch).toBe(true);
  });

  it("returns an unknown profile for an uncertain user agent", () => {
    const profile = serverDeviceProfile(null);
    expect(profile.type).toBe("unknown");
    expect(profile.isMobile).toBe(false);
    expect(profile.isTablet).toBe(false);
    expect(profile.isDesktop).toBe(false);
  });
});

describe("clientDeviceProfile", () => {
  it("lets viewport width override the user agent hint", () => {
    // A desktop user agent in a narrow window resolves to mobile by width.
    const profile = clientDeviceProfile({ width: 375, height: 812, userAgent: DESKTOP });
    expect(profile.type).toBe("mobile");
    expect(profile.orientation).toBe("portrait");
    expect(profile.viewportWidth).toBe(375);
  });

  it("refines tablet from width", () => {
    const profile = clientDeviceProfile({ width: 900, height: 1200 });
    expect(profile.type).toBe("tablet");
    expect(profile.isTablet).toBe(true);
  });

  it("refines desktop from width", () => {
    const profile = clientDeviceProfile({ width: 1440, height: 900 });
    expect(profile.type).toBe("desktop");
    expect(profile.isDesktop).toBe(true);
    expect(profile.orientation).toBe("landscape");
  });

  it("marks touch when a touch capability or coarse pointer is present", () => {
    expect(clientDeviceProfile({ width: 375, hasTouch: true }).hasTouch).toBe(true);
    expect(clientDeviceProfile({ width: 375, coarsePointer: true }).hasTouch).toBe(true);
    expect(clientDeviceProfile({ width: 1440 }).hasTouch).toBe(false);
  });

  it("does not crash when all browser signals are missing", () => {
    const profile = clientDeviceProfile({});
    expect(profile.type).toBe("unknown");
    expect(profile.viewportWidth).toBeNull();
    expect(profile.orientation).toBe("unknown");
    expect(profile.hasTouch).toBe(false);
  });
});
