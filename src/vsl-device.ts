/**
 * Preserve the existing mobile YouTube interaction policy:
 * native first tap on iOS/iPadOS/Android, poster click-to-load on desktop.
 * Modern iPads sometimes report a desktop-style Macintosh user agent.
 */
export function isNativeMobilePlaybackDevice(
  userAgent: string,
  maxTouchPoints: number,
): boolean {
  return /iPhone|iPad|iPod|Android/i.test(userAgent) ||
    (/Macintosh/i.test(userAgent) && maxTouchPoints > 1);
}
