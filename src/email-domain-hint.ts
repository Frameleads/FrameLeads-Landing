/** Optional, exact-match corrections only. Never silently rewrite an address. */
const knownTypos: Readonly<Record<string,string>> = Object.freeze({
  "gmaill.com": "gmail.com",
  "gmial.com": "gmail.com",
  "gmai.com": "gmail.com",
  "gmail.con": "gmail.com",
  "outlok.com": "outlook.com",
  "hotmial.com": "hotmail.com",
  "yaho.com": "yahoo.com",
});

export function suggestAuditEmailCorrection(value: string): string | null {
  const candidate = value.trim();
  const at = candidate.lastIndexOf("@");
  if (at <= 0 || at !== candidate.indexOf("@")) return null;
  const domain = candidate.slice(at + 1).toLowerCase();
  const correction = knownTypos[domain];
  return correction ? candidate.slice(0, at) + "@" + correction : null;
}
