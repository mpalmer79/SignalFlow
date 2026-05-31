"use client";

import Link from "next/link";
import dynamic from "next/dynamic";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

// The Clerk widget is loaded client-side only, so the demo build never
// evaluates Clerk during prerendering. The publishable key is a public env var,
// so this check is safe on the client.
const ClerkSignInWidget = dynamic(
  () =>
    import("@/components/auth/clerk-auth-widgets").then(
      (mod) => mod.ClerkSignInWidget,
    ),
  { ssr: false },
);

const clerkConfigured = Boolean(process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY);

export default function SignInPage() {
  if (clerkConfigured) {
    return (
      <div className="flex min-h-screen items-center justify-center p-6">
        <ClerkSignInWidget />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center p-6">
      <Card className="max-w-md">
        <CardContent className="space-y-4 p-8 text-center">
          <h1 className="text-lg font-semibold">Demo mode</h1>
          <p className="text-sm text-muted-foreground">
            Authentication is not configured in this environment. The
            application runs with a clearly labeled demo auth context, so you can
            explore the workspace without signing in.
          </p>
          <Link href="/dashboard" className={buttonVariants()}>
            Enter the demo workspace
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}
