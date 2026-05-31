// Clerk is optional. The application must render in demo mode without any Clerk
// keys, so every Clerk usage is gated behind this check. When the keys are
// absent, the auth layer falls back to a clearly labeled demo context.
export function isClerkConfigured(): boolean {
  const publishable = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;
  const secret = process.env.CLERK_SECRET_KEY;
  return Boolean(
    publishable && publishable.length > 0 && secret && secret.length > 0,
  );
}
