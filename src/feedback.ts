export type FeedbackReason =
  | "price"
  | "customer_results"
  | "offer_clarity"
  | "workflow_fit"
  | "ai_control";

export type FeedbackPlanContext = "core" | "enterprise" | "micro_pilot" | "general";

/** Phase 2 transport contract. submitted_at is supplied by the server, never the browser. */
export interface FeedbackSubmission {
  /** Optional if an open-text concern is provided; Phase 2 must validate at least one. */
  reason?: FeedbackReason;
  optional_message?: string;
  source_page: string;
  plan_context: FeedbackPlanContext;
  submitted_at?: string;
}

export const FEEDBACK_REASONS: { id: FeedbackReason; label: string }[] = [
  { id: "price", label: "The pricing feels too high." },
  { id: "customer_results", label: "I need proof it works with real replies." },
  { id: "offer_clarity", label: "I'm not sure what I get after paying." },
  { id: "workflow_fit", label: "I'm unsure it fits my existing outbound workflow." },
  { id: "ai_control", label: "I'm not ready to trust AI with important replies." },
];

/** Browser sends only visitor input. The server derives source and timestamp. */
export type FeedbackSubmissionRequest = Pick<FeedbackSubmission, "reason" | "optional_message" | "plan_context">;

export async function submitFeedback(submission: FeedbackSubmissionRequest): Promise<void> {
  const response = await fetch("/api/feedback", {
    method: "POST",
    credentials: "same-origin",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(submission),
    cache: "no-store",
  });
  const body: unknown = await response.json().catch(() => null);
  if (!response.ok || !body || typeof body !== "object" || !("saved" in body) || body.saved !== true) {
    const detail = body && typeof body === "object" && "error" in body && typeof body.error === "string"
      ? body.error
      : "Feedback could not be saved. Please try again.";
    throw new Error(detail);
  }
}
