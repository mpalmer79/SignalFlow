"use client";

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { clientDeviceProfile } from "@/lib/device/detect-device";
import {
  UNKNOWN_DEVICE_PROFILE,
  type DeviceProfile,
} from "@/lib/device/device-types";

const DeviceContext = createContext<DeviceProfile>(UNKNOWN_DEVICE_PROFILE);

// Read the device profile anywhere in the client tree. Before the client has
// mounted and measured, this returns the unknown profile, so consumers must
// remain usable in that state.
export function useDevice(): DeviceProfile {
  return useContext(DeviceContext);
}

// Collect the current client signals from the browser, guarding every API so a
// missing capability never throws.
function readSignals(): DeviceProfile {
  if (typeof window === "undefined") return UNKNOWN_DEVICE_PROFILE;

  const width = window.innerWidth ?? null;
  const height = window.innerHeight ?? null;

  let hasTouch = false;
  try {
    hasTouch =
      "ontouchstart" in window ||
      (typeof navigator !== "undefined" && navigator.maxTouchPoints > 0);
  } catch {
    hasTouch = false;
  }

  let coarsePointer = false;
  try {
    coarsePointer =
      typeof window.matchMedia === "function" &&
      window.matchMedia("(pointer: coarse)").matches;
  } catch {
    coarsePointer = false;
  }

  const userAgent =
    typeof navigator !== "undefined" ? navigator.userAgent : null;

  return clientDeviceProfile({
    width,
    height,
    hasTouch,
    coarsePointer,
    userAgent,
  });
}

// Provide the device profile to the client tree. The server renders the unknown
// profile to avoid a hydration mismatch, then the client measures after mount
// and on resize or orientation change. Updates are debounced and only applied
// when a meaningful field changes, to avoid noisy re-renders.
export function DeviceProvider({
  children,
}: {
  children: ReactNode;
}) {
  const [profile, setProfile] = useState<DeviceProfile>(UNKNOWN_DEVICE_PROFILE);
  const frame = useRef<number | null>(null);

  useEffect(() => {
    const apply = () => {
      const next = readSignals();
      setProfile((prev) => {
        if (
          prev.type === next.type &&
          prev.orientation === next.orientation &&
          prev.hasTouch === next.hasTouch &&
          prev.viewportWidth === next.viewportWidth
        ) {
          return prev;
        }
        return next;
      });
    };

    const schedule = () => {
      if (frame.current !== null) cancelAnimationFrame(frame.current);
      frame.current = requestAnimationFrame(apply);
    };

    // Measure once after mount, then on resize and orientation change.
    apply();
    window.addEventListener("resize", schedule, { passive: true });
    window.addEventListener("orientationchange", schedule, { passive: true });

    return () => {
      if (frame.current !== null) cancelAnimationFrame(frame.current);
      window.removeEventListener("resize", schedule);
      window.removeEventListener("orientationchange", schedule);
    };
  }, []);

  return (
    <DeviceContext.Provider value={profile}>{children}</DeviceContext.Provider>
  );
}

// A thin wrapper that exposes the resolved device type as a data attribute for
// CSS targeting and quick visual debugging. It renders a div that does not
// affect layout flow. The attribute updates after the client refines.
export function DeviceMarker({ children }: { children: ReactNode }) {
  const device = useDevice();
  const value = useMemo(() => device.type, [device.type]);
  return (
    <div data-device={value} className="contents">
      {children}
    </div>
  );
}
