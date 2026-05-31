"use server";

import { revalidatePath } from "next/cache";
import { resolveRequestContext } from "@/lib/auth/auth-context";
import { submitVoiceReviewDecision } from "@/lib/services/voice-review-service";

export type VoiceReviewActionState = {
  status: "idle" | "ok" | "error";
  message: string;
};

// Server action for a voice plan review decision. It resolves the request
// context on the server, enforces authorization in the service, records the
// decision with an audit event, and revalidates the affected pages. No call is
// placed and no simulation is triggered.
export async function reviewVoicePlanAction(
  _prev: VoiceReviewActionState,
  formData: FormData,
): Promise<VoiceReviewActionState> {
  const context = await resolveRequestContext();
  if (!context) {
    return { status: "error", message: "You are not signed in." };
  }

  const voicePlanId = String(formData.get("voicePlanId") ?? "");
  const decision = String(formData.get("decision") ?? "");
  const notes = String(formData.get("notes") ?? "");

  if (!voicePlanId || (decision !== "approve" && decision !== "reject")) {
    return { status: "error", message: "Invalid review request." };
  }

  const result = await submitVoiceReviewDecision(
    context,
    voicePlanId,
    decision === "approve",
    notes,
  );

  if (!result.ok) {
    return {
      status: "error",
      message:
        result.reason === "forbidden"
          ? "You do not have permission to review voice plans."
          : "That voice plan is no longer awaiting review.",
    };
  }

  revalidatePath("/review-queue");
  revalidatePath("/voice-command-center");
  return {
    status: "ok",
    message: result.approved
      ? "Voice plan approved. It is now eligible for simulation."
      : "Voice plan rejected.",
  };
}
