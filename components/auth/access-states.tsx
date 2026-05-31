import Link from "next/link";
import { Lock, ShieldAlert } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { isClerkConfigured } from "@/lib/auth/clerk-config";

// Shown when a protected page resolves no authenticated user. In demo mode this
// never appears because the demo context is always resolved, so it only shows
// when Clerk is configured and the visitor is signed out.
export function UnauthenticatedState() {
  const clerk = isClerkConfigured();
  return (
    <div className="flex min-h-[60vh] items-center justify-center">
      <Card className="max-w-md">
        <CardContent className="space-y-4 p-8 text-center">
          <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-primary/15 text-primary">
            <Lock className="h-6 w-6" />
          </span>
          <h1 className="text-lg font-semibold">Sign in required</h1>
          <p className="text-sm text-muted-foreground">
            {clerk
              ? "This is a protected workspace page. Sign in to continue."
              : "Authentication is not configured in this environment."}
          </p>
          {clerk ? (
            <Link href="/sign-in" className={buttonVariants()}>
              Go to sign in
            </Link>
          ) : (
            <Link href="/" className={buttonVariants({ variant: "outline" })}>
              Back to home
            </Link>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

// Shown when an authenticated user lacks the permission for a page.
export function ForbiddenState({ roleLabel }: { roleLabel: string }) {
  return (
    <div className="flex min-h-[60vh] items-center justify-center">
      <Card className="max-w-md">
        <CardContent className="space-y-4 p-8 text-center">
          <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-warning/15 text-warning">
            <ShieldAlert className="h-6 w-6" />
          </span>
          <h1 className="text-lg font-semibold">Access restricted</h1>
          <p className="text-sm text-muted-foreground">
            Your role ({roleLabel}) does not have permission to view this page.
            Contact an administrator if you need access.
          </p>
          <Link href="/dashboard" className={buttonVariants({ variant: "outline" })}>
            Back to dashboard
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}
