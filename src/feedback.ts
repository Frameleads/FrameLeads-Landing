export type FeedbackReason =
  | "price"
  | "customer_results"
  | "offer_clarity"
  | "workflow_fit"
  | "ai_control";

export type FeedbackPlanContext = "core" | "enterprise" | "micro_pilot" | "general";

/** Phase 2 transport contract. submitted_at is supplied by the server, never the browser. */
export interface FeedbackSubmission {
  reason: FeedbackReason;
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

/** Deliberately no network or persistence until the secure Phase 2 endpoint exists. */
export async function submitFeedbackPreview(submission: FeedbackSubmission): Promise<never> {
  void submission;
  throw new Error("Feedback preview is not connected to a submission service.");
}
