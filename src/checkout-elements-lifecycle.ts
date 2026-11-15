/**
 * Defer third-party payment SDK initialization until after React hydration.
 * A cancelled effect must never initialize the SDK or publish stale results.
 * This helper intentionally does not grant purchases, entitlements, or consent.
 */
export function scheduleCheckoutElementsLoad<T>(
  enabled: boolean,
  load: () => T,
  onReady: (elements: T) => void,
  onUnavailable: () => void,
  enqueue: (task: () => void) => void = queueMicrotask,
): () => void {
  if (!enabled) return () => {};

  let active = true;
  enqueue(() => {
    if (!active) return;
    try {
      const elements = load();
      if (active) onReady(elements);
    } catch {
      if (active) onUnavailable();
    }
  });
  return () => {
    active = false;
  };
}
