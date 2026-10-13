import { redirect } from "next/navigation";
import { legacyAuditDestination } from "../../audit-entry";

/** Temporary compatibility redirect preserves every existing campaign parameter. */
export default async function AuditPage({ searchParams }: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  redirect(legacyAuditDestination(await searchParams));
}
