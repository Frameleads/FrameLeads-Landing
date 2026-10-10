import { getVercelOidcToken } from '@vercel/oidc';
import { forwardUnsubscribe } from '../../../../audit-unsubscribe.ts';

export const runtime = 'nodejs';
export const maxDuration = 15;

export async function POST(request: Request) {
  return forwardUnsubscribe(request, getVercelOidcToken);
}
