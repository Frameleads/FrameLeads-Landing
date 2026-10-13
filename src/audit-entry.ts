export function auditRequested(search: string): boolean {
  return new URLSearchParams(search).get("audit") === "open";
}

/** Alter only the Audit control parameter, preserving campaign parameters and hashes. */
export function auditLocation(href: string, open: boolean): string {
  const url = new URL(href);
  if (open) url.searchParams.set("audit", "open");
  else url.searchParams.delete("audit");
  return url.pathname + url.search + url.hash;
}

export function legacyAuditDestination(params: Record<string, string | string[] | undefined>): string {
  const query = new URLSearchParams();
  for (const [key, values] of Object.entries(params)) {
    if (key === "audit") continue;
    for (const value of Array.isArray(values) ? values : values === undefined ? [] : [values]) query.append(key, value);
  }
  query.set("audit", "open");
  return "/?" + query.toString();
}
