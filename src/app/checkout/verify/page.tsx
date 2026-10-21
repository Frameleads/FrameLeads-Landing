import type { Metadata } from 'next';
import VerifyCheckout from './verify-checkout';

export const metadata: Metadata = { title: 'Verify checkout continuation | FrameLeads', robots: { index: false, follow: false }, referrer: 'no-referrer' };

export default function VerifyCheckoutPage() { return <VerifyCheckout />; }
