"use client";

import { useState, useTransition } from "react";
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
//
// This uses the stable React 18 hooks useState and useTransition and calls the
// server action directly, so it does not depend on the React 19 form-action
// hooks that the installed React version does not export.
export function VoiceReviewButtons({
  voicePlanId,
  canReview,
}: {
  voicePlanId: string;
  canReview: boolean;
}) {
  const [state, setState] = useState<VoiceReviewActionState>(initialState);
  const [pending, startTransition] = useTransition();

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

  const submit = (decision: "approve" | "reject") => {
    startTransition(async () => {
      const result = await reviewVoicePlanAction({ voicePlanId, decision });
      setState(result);
    });
  };

  return (
    <div className="flex flex-wrap items-center gap-2">
      <Button
        type="button"
        size="sm"
        disabled={pending}
        onClick={() => submit("approve")}
      >
        Approve
      </Button>
      <Button
        type="button"
        size="sm"
        variant="outline"
        disabled={pending}
        onClick={() => submit("reject")}
      >
        Reject
      </Button>
      {state.status === "error" ? (
        <span className="text-[11px] text-danger">{state.message}</span>
      ) : null}
    </div>
  );
}
