"use client";

import { useRouter } from "next/navigation";
import PipelineAudit from "./PipelineAudit";

export default function AuditRouteClient() {
  const router = useRouter();
  return <div className="rounded-2xl border border-white/[0.12] bg-white/[0.025] p-5 shadow-[0_24px_60px_-24px_rgba(0,0,0,.8)] sm:p-8 md:p-10">
    <PipelineAudit standalone onClose={() => router.push("/")} />
  </div>;
}
