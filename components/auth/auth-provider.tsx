import type { ReactNode } from "react";
import { ClerkProvider } from "@clerk/nextjs";
import { isClerkConfigured } from "@/lib/auth/clerk-config";

// Wraps the app in ClerkProvider only when Clerk is configured. In demo mode
// the children render directly, so the application works with no Clerk keys.
export function AuthProvider({ children }: { children: ReactNode }) {
  if (!isClerkConfigured()) {
    return <>{children}</>;
  }
  return <ClerkProvider>{children}</ClerkProvider>;
}
