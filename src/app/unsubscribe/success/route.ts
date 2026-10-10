const headers = {
  'Cache-Control': 'no-store',
  'Referrer-Policy': 'no-referrer',
  'X-Content-Type-Options': 'nosniff',
  'Content-Security-Policy': "default-src 'none'; frame-ancestors 'none'; base-uri 'none'",
  'Content-Type': 'text/html; charset=utf-8',
};

export function GET() {
  return new Response('<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="referrer" content="no-referrer"><title>Unsubscribed | FrameLeads</title></head><body style="margin:0;min-height:100vh;background:#1A1A1A;color:#FFFFFF;font-family:Arial,Helvetica,sans-serif"><main style="box-sizing:border-box;max-width:620px;margin:8vh auto;padding:0 20px"><section style="overflow:hidden;border:1px solid #383838;border-radius:16px;background:#242424"><div style="height:3px;background:#FF5A1F"></div><div style="padding:36px 32px"><p style="margin:0 0 30px;font-size:18px;font-weight:bold;letter-spacing:2px">FRAMELEADS</p><h1 style="margin:0 0 12px;font-size:25px;line-height:1.3">You\'re unsubscribed from Reply Workflow Audit emails.</h1></div></section></main></body></html>', { status: 200, headers });
}
