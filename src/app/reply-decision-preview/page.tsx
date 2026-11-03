import type { Metadata } from "next";
import { redirect } from "next/navigation";

export const metadata: Metadata = {
  title: "Reply Decision Preview | FrameLeads",
  description: "Explore how FrameLeads uses reply context, seller rules, and human approval to shape the next action.",
  robots: { index: false, follow: false },
};

export default function ReplyDecisionPreviewPage() {
  redirect("/#reply-scenarios");
}
