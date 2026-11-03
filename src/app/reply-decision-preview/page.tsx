import type { Metadata } from "next";
import ReplyDecisionPreview from "../../components/ReplyDecisionPreview";

export const metadata: Metadata = {
  title: "Reply Decision Preview | FrameLeads",
  description: "Explore how FrameLeads uses reply context, seller rules, and human approval to shape the next action.",
  robots: { index: false, follow: false },
};

export default function ReplyDecisionPreviewPage() {
  return <ReplyDecisionPreview />;
}
