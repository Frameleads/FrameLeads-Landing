import assert from "node:assert/strict";
import test from "node:test";
import { createHash } from "node:crypto";
import { POST as apply } from "../src/app/api/affiliates/apply/route.ts";
import { POST as confirm } from "../src/app/api/affiliates/confirm/route.ts";
import { AFFILIATE_PLANS, affiliateMode, previewAllowedEmail } from "../src/affiliate-native.ts";

const host = "https://frameleads-landing-test123-frameleads.vercel.app";
const recipient = "preview@example.com";
const key = "21".repeat(32);
const sha = createHash("sha256").update(recipient).digest("hex");
const config = {
  VERCEL_ENV: "preview",
  VERCEL_GIT_COMMIT_REF: "feat/whop-native-affiliate-preview-20261112",
  AFFILIATE_PREVIEW_E2E_ENABLED: "true",
  AFFILIATE_PREVIEW_ALLOWED_EMAIL_SHA256: sha,
  AFFILIATE_NATIVE_REGISTRATION_ENABLED: "false",
  AFFILIATE_NATIVE_SECURITY_REVIEW_APPROVED: "false",
  WHOP_ENVIRONMENT: "production",
  AFFILIATE_WHOP_COMPANY_ID: "biz_TestCompany123",
  AFFILIATE_WHOP_API_KEY: "test-whop-api-key",
  AFFILIATE_EMAIL_TOKEN_KEY: key,
  AFFILIATE_RESEND_API_KEY: "test-resend-key",
  AFFILIATE_MAIL_FROM: "akram@frameleads.io",
  AFFILIATE_CORE_PLAN_ID: AFFILIATE_PLANS[0].planId,
  AFFILIATE_ENTERPRISE_PLAN_ID: AFFILIATE_PLANS[1].planId,
};
const before = Object.fromEntries(Object.keys(config).map(k => [k, process.env[k]]));
function putEnv(values: Record<string,string>) {
  for (const [k,v] of Object.entries(values)) process.env[k] = v;
}
function restoreEnv(){
  for(const [k,v] of Object.entries(before)) if(v===undefined) delete process.env[k]; else process.env[k]=v;
}
function makeRequest(route: "apply" | "confirm", body: object, ip: string) {
  return new Request(host+"/api/affiliates/"+route,{
    method:"POST",
    headers:{"Content-Type":"application/json","Origin":host,"Sec-Fetch-Site":"same-origin","x-real-ip":ip},
    body:JSON.stringify(body),
  });
}

test("protected Preview real flow verifies recipient before touching Whop, then sends two referral links", async () => {
  putEnv(config);
  const originalFetch = globalThis.fetch;
  const overrides: Record<string, unknown>[] = [];
  const emails: { body: Record<string,unknown>; idempotencyKey: string|null }[]=[];
  const whopCalls: string[]=[];
  let confirmationUrl="";
  try {
    globalThis.fetch = (async (input: string|URL|Request, init?: RequestInit) => {
      const url=new URL(input.toString());
      const method=init?.method??"GET";
      const response=(o:unknown,status=200)=>new Response(JSON.stringify(o),{status,headers:{"content-type":"application/json"}});
      if(url.hostname==="api.resend.com"){
        assert.equal(url.pathname,"/emails");
        const body=JSON.parse(String(init?.body)) as Record<string,unknown>;
        const to=body.to as string[];
        assert.deepEqual(to,[recipient]);
        emails.push({body,idempotencyKey:new Headers(init?.headers).get("idempotency-key")});
        if(String(body.subject).includes("Confirm")) {
          confirmationUrl=String(body.text).match(/https:\/\/[^\s]+#token=[A-Za-z0-9_-]+/)?.[0]??"";
        }
        return response({id:"49a3999c-0ce1-4ea6-ab68-afcd6dc2e794"});
      }
      assert.equal(url.hostname,"api.whop.com");
      assert.equal(new Headers(init?.headers).get("Api-Version-Date"),"2025-01-01");
      whopCalls.push(method+" "+url.pathname);
      if(url.pathname.startsWith("/api/v1/plans/")){
        const plan=AFFILIATE_PLANS.find(p=>url.pathname.endsWith(p.planId));
        assert.ok(plan);
        return response({id:plan.planId,plan_type:"renewal",currency:"usd",initial_price:0,renewal_price:plan.price,company:{id:config.AFFILIATE_WHOP_COMPANY_ID}});
      }
      if(url.pathname==="/api/v1/affiliates"&&method==="POST")return response({id:"aff_Test123",company:{id:config.AFFILIATE_WHOP_COMPANY_ID}});
      if(url.pathname.endsWith("/overrides")&&method==="GET")return response({data:[...overrides],page_info:{has_next_page:false,end_cursor:null}});
      if(url.pathname.endsWith("/overrides")&&method==="POST"){
        const body=JSON.parse(String(init?.body));
        const created={...body,checkout_direct_link:"https://whop.com/checkout/"+body.plan_id+"?a=mock"};
        overrides.push(created);return response(created);
      }
      throw new Error("Unexpected provider request");
    }) as typeof fetch;
    assert.equal(affiliateMode(process.env),"preview_e2e");
    assert.equal(previewAllowedEmail(recipient,process.env),true);
    assert.equal(previewAllowedEmail("other@example.com",process.env),false);
    const denied=await apply(makeRequest("apply",{firstName:"John",lastName:"Tester",email:"other@example.com",agreed:true,website:""},"198.51.100.101"));
    assert.equal(denied.status,403);
    assert.equal(whopCalls.length,0);
    assert.equal(emails.length,0);

    const accepted=await apply(makeRequest("apply",{firstName:"John",lastName:"Tester",email:recipient,agreed:true,website:"",turnstileToken:""},"198.51.100.102"));
    assert.equal(accepted.status,202);
    assert.equal((await accepted.json()).mode,"verification_sent");
    assert.equal(whopCalls.length,0,"no Whop mutation before clicking verified link");
    assert.equal(emails.length,1);
    assert.ok(confirmationUrl.startsWith(host+"/affiliates/confirm#token="),confirmationUrl);
    const token=new URL(confirmationUrl).hash.split("#token=")[1];
    assert.ok(token.length>32);
    const result=await confirm(makeRequest("confirm",{token},"198.51.100.103"));
    assert.equal(result.status,200);
    assert.equal((await result.json()).code,"AFFILIATE_ENROLLED");
    assert.equal(overrides.length,2);
    assert.deepEqual(overrides.map(o=>o.applies_to_payments),["all_payments","all_payments"]);
    assert.equal(emails.length,2);
    assert.match(String(emails[1].body.text),/https:\/\/whop.com\/checkout\/plan_GQTDPXnvijugf/);
    assert.match(String(emails[1].body.text),/https:\/\/whop.com\/checkout\/plan_uGDGf5WKW7hlE/);
    assert.ok(emails[1].idempotencyKey?.startsWith("affiliate-welcome-"));
    const repeat=await confirm(makeRequest("confirm",{token},"198.51.100.104"));
    assert.equal(repeat.status,200);
    assert.equal(overrides.length,2,"repeat confirmation must not create more Whop overrides");
    assert.equal(emails[1].idempotencyKey,emails[2].idempotencyKey,"Resend should deduplicate repeated welcome message");

    const invalid=await confirm(makeRequest("confirm",{token:"not-our-token"},"198.51.100.105"));
    assert.equal(invalid.status,400);
    assert.equal(overrides.length,2);
    process.env.VERCEL_GIT_COMMIT_REF="main";
    assert.equal(affiliateMode(process.env),"preview");
    assert.equal(previewAllowedEmail(recipient,process.env),false);
  } finally {
    globalThis.fetch=originalFetch;
    restoreEnv();
  }
});
