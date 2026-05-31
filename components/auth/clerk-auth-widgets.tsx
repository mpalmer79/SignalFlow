"use client";

import { SignIn, SignUp } from "@clerk/nextjs";

// Client-only Clerk widgets. These are loaded through next/dynamic with ssr
// disabled, so Clerk is never evaluated during prerendering or in demo mode.
export function ClerkSignInWidget() {
  return <SignIn routing="hash" />;
}

export function ClerkSignUpWidget() {
  return <SignUp routing="hash" />;
}
