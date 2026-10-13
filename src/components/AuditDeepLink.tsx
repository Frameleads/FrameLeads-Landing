"use client";

import { useEffect, useRef } from "react";
import { useSearchParams } from "next/navigation";
import { auditRequested } from "../audit-entry";

export default function AuditDeepLink({ onChange }: { onChange: (open: boolean) => void }) {
  const search = useSearchParams();
  const requested = auditRequested(search.toString());
  const previous = useRef<boolean | null>(null);
  useEffect(() => {
    if (previous.current === requested) return;
    previous.current = requested;
    onChange(requested);
  }, [requested, onChange]);
  return null;
}
