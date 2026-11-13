/**
 * Client-only Whop Elements initializer.
 *
 * Never imports the SDK or creates payment elements if checkout is disabled,
 * a hosted fallback is unavailable, or a referral must use hosted checkout.
 * The caller's cancellation predicate protects StrictMode cleanups and
 * navigation away while the asynchronous SDK import is in flight.
 */
export async function initializeWhopCheckout<T>(
  options: {
    embedEnabled: boolean;
    hostedFallback: string;
    referralHintPresent: boolean;
  },
  importSdk: () => Promise<{ loadWhop: () => T }>,
  isActive: () => boolean,
  onReady: (elements: T) => void,
  onUnavailable: () => void,
): Promise<void> {
  if (!options.embedEnabled || !options.hostedFallback || options.referralHintPresent || !isActive()) return;

  try {
    const sdk = await importSdk();
    if (!isActive()) return;
    const elements = sdk.loadWhop();
    if (isActive()) onReady(elements);
  } catch {
    if (isActive()) onUnavailable();
  }
}
