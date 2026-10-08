import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import ts from 'typescript';
import * as crypto from 'node:crypto';
import * as measurement from '../src/measurement.ts';
import * as audit from '../src/audit.ts';

function route(transport:typeof fetch=async()=>Response.json({ok:true,eventId:'a'.repeat(64)})){
 const exports:{POST?:(request:Request)=>Promise<Response>}={};
 const context=vm.createContext({Buffer,URL,Request,Response,Date,Map,Uint8Array,setTimeout,clearTimeout,AbortSignal,process:{env:{BRAND_BRAIN_AUDIT_INGEST_URL:'https://brandbrain-pi.vercel.app/api/marketing/audit-lead/ingest',BRAND_BRAIN_AUDIT_INGEST_SECRET:'fixture-secret-with-sufficient-length-only'}},fetch:transport});
 const code=ts.transpileModule(fs.readFileSync(new URL('../src/app/api/measurement/route.ts',import.meta.url),'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2023}}).outputText;
 const modules:Record<string,unknown>={'node:crypto':crypto,'@vercel/oidc':{getVercelOidcToken:async()=> 'fixture-runtime-token'},'../../../measurement.ts':measurement,'../../../audit.ts':audit};
 vm.runInContext(`(function(exports,require){${code}})`,context)(exports,(name:string)=>{if(!(name in modules))throw Error('Forbidden dependency');return modules[name];});
 return exports.POST!;
}
const event=()=>({observationId:crypto.randomUUID(),eventName:'PAGE_VIEW',occurredAt:new Date().toISOString(),attribution:{anonymous_id:crypto.randomUUID(),session_id:crypto.randomUUID()}});
const request=(body:unknown,headers:Record<string,string>={})=>new Request('https://frameleads.io/api/measurement',{method:'POST',headers:{origin:'https://frameleads.io','content-type':'application/json',...headers},body:typeof body==='string'?body:JSON.stringify(body)});

test('public boundary checks origin, bounded JSON and canonical-name rejection before forwarding',async()=>{
 let calls=0;const post=route(async()=>{calls++;throw Error('Unexpected network');});
 assert.equal((await post(request(event(),{origin:'https://other.example'}))).status,403);
 assert.equal((await post(request(event(),{'sec-fetch-site':'cross-site'}))).status,403);
 assert.equal((await post(request(event(),{'content-type':'text/plain'}))).status,415);
 assert.equal((await post(request('x'.repeat(6001)))).status,413);
 assert.equal((await post(request('{'))).status,400);
 for(const eventName of ['CAPTURED_LEAD','QUALIFIED_LEAD','PURCHASE','FIRST_GOVERNED_DECISION'])assert.equal((await post(request({...event(),eventName}))).status,400);
 assert.equal(calls,0);
});
test('public route forwards only normalized observation with server Bearer/OIDC and HMAC rate identity',async()=>{
 let calls=0;const post=route(async(url,options)=>{
  calls++;assert.equal(String(url),'https://brandbrain-pi.vercel.app/api/marketing/measurement/ingest');
  const headers=new Headers(options?.headers);assert.match(headers.get('authorization')!,/^Bearer fixture-/);assert.equal(headers.get('x-vercel-trusted-oidc-idp-token'),'fixture-runtime-token');assert.match(headers.get('x-frameleads-measurement-rate-key')!,/^[a-f0-9]{64}$/);assert.equal(headers.get('x-real-ip'),null);
  assert.equal(JSON.parse(String(options?.body)).eventName,'PAGE_VIEW');return Response.json({ok:true,eventId:'a'.repeat(64)});
 });
 assert.equal((await post(request(event(),{'x-real-ip':'192.0.2.1'}))).status,201);assert.equal(calls,1);
});
test('public route throttles and safely bounds upstream failures',async()=>{
 const post=route();for(let n=0;n<30;n++)assert.equal((await post(request(event()))).status,201);
 assert.equal((await post(request(event()))).status,429);
 assert.equal((await route(async()=>Response.json({},{status:401}))(request(event()))).status,502);
 assert.equal((await route(async()=>new Response('x'.repeat(8193)))(request(event()))).status,502);
 assert.equal((await route(async()=>{throw Error('SECRET upstream body');})(request(event()))).status,502);
});
