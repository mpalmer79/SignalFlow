"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import {
  reviewVoicePlanAction,
  type VoiceReviewActionState,
} from "@/app/(app)/review-queue/actions";

const initialState: VoiceReviewActionState = { status: "idle", message: "" };

// Approve or reject control for a needs-review voice plan. The decision is
// submitted to a server action that enforces authorization and records an audit
// event. Approving makes the plan eligible for simulation under the existing
// rules; nothing is sent and no call is placed.
export function VoiceReviewButtons({
  voicePlanId,
  canReview,
}: {
  voicePlanId: string;
  canReview: boolean;
}) {
  const [state, formAction, pending] = useActionState(
    reviewVoicePlanAction,
    initialState,
  );

  if (!canReview) {
    return (
      <p className="text-[11px] text-muted-foreground">
        Awaiting a reviewer with voice review permission.
      </p>
    );
  }

  if (state.status === "ok") {
    return <p className="text-[11px] text-success">{state.message}</p>;
  }

  return (
    <form action={formAction} className="flex flex-wrap items-center gap-2">
      <input type="hidden" name="voicePlanId" value={voicePlanId} />
      <input type="hidden" name="notes" value="Reviewed from the review queue." />
      <Button
        type="submit"
        name="decision"
        value="approve"
        size="sm"
        disabled={pending}
      >
        Approve
      </Button>
      <Button
        type="submit"
        name="decision"
        value="reject"
        size="sm"
        variant="outline"
        disabled={pending}
      >
        Reject
      </Button>
      {state.status === "error" ? (
        <span className="text-[11px] text-danger">{state.message}</span>
      ) : null}
    </form>
  );
}
