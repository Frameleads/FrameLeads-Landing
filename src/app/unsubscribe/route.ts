import { renderUnsubscribePage } from '../../audit-unsubscribe.ts';

export const runtime = 'nodejs';
export function GET(request: Request) {
  return renderUnsubscribePage(request);
}
