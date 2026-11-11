export type FeedbackReason =
  | "price"
  | "customer_results"
  | "product_clarity"
  | "setup_integrations_security"
  | "other";

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
  { id: "customer_results", label: "I'd like to see real customer results." },
  { id: "product_clarity", label: "I'm not sure what FrameLeads would do for me." },
  { id: "setup_integrations_security", label: "I have questions about setup, integrations, or security." },
  { id: "other", label: "Something else." },
];

/** Deliberately no network or persistence until the secure Phase 2 endpoint exists. */
export async function submitFeedbackPreview(submission: FeedbackSubmission): Promise<never> {
  void submission;
  throw new Error("Feedback preview is not connected to a submission service.");
}
