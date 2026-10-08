import test from 'node:test';import assert from 'node:assert/strict';import {randomUUID,createHash} from 'node:crypto';
import {getMeasurementAttribution,normalizeAttribution,validateObservation,observeMeasurement,observationEventId,providerEventId,sendPixelCopy,initializeMeasurementPixels} from '../src/measurement.ts';
import {playbackProgress} from '../src/vsl-engagement.ts';
const wait=()=>new Promise(resolve=>setTimeout(resolve,20));
test('strict observation contract accepts opaque PAGE_VIEW and rejects canonical events, unknown fields and PII',()=>{
 const e={observationId:randomUUID(),eventName:'PAGE_VIEW',occurredAt:new Date().toISOString(),attribution:{anonymous_id:randomUUID(),session_id:randomUUID(),utm_source:'META'}};
 assert.equal(validateObservation(e)?.attribution.utm_source,'meta');
 for(const eventName of ['CAPTURED_LEAD','QUALIFIED_LEAD','PURCHASE','FIRST_GOVERNED_DECISION'])assert.equal(validateObservation({...e,eventName}),null);
 assert.equal(validateObservation({...e,prospect_id:randomUUID()}),null);
 assert.equal(validateObservation({...e,attribution:{...e.attribution,answers:{private:true}}}),null);
 assert.equal(validateObservation({...e,attribution:{...e.attribution,anonymous_id:'private@example.com'}}),null);
 assert.equal(validateObservation({...e,occurredAt:'2020-01-01'}),null);
 assert.deepEqual(normalizeAttribution({utm_term:'private@example.com',campaign_id:'x'.repeat(129),landing_path:'/audit?email=private@example.com',fbclid:'click_fixture'}),{landing_path:'/audit',fbclid:'click_fixture'});
});
test('provider ID derivation matches PostgreSQL canonical byte representation; different logical events remain distinct',async()=>{
 const id=randomUUID(),json=(a:unknown[])=>'['+a.map(x=>JSON.stringify(x)).join(', ')+']';const sha=(v:string)=>createHash('sha256').update(v).digest('hex');
 const canonical=sha(json(['b7.v1','BROWSER_OBSERVATION',id]));assert.equal(await observationEventId(id),canonical);
 assert.equal(await providerEventId('META',canonical),sha(json(['b7.v1','PAID_CONVERSION',json(['META',canonical,1])])));
 assert.notEqual(await providerEventId('META',canonical),await providerEventId('TIKTOK',canonical));
 assert.notEqual(await providerEventId('META',canonical),await providerEventId('META',await observationEventId(randomUUID())));
});
test('first-party identifiers, 30-minute session rotation, cookies, pixel failures and one page observation',async()=>{
 const prior=new Map(['window','document','fetch'].map(k=>[k,Object.getOwnPropertyDescriptor(globalThis,k)]));
 const keys=['NEXT_PUBLIC_META_TRACKING_ENABLED','NEXT_PUBLIC_META_PIXEL_ID','NEXT_PUBLIC_TIKTOK_TRACKING_ENABLED'];const env=Object.fromEntries(keys.map(k=>[k,process.env[k]]));
 const local=new Map<string,string>(),session=new Map<string,string>(),requests:unknown[]=[],pixelCalls:unknown[][]=[];
 const storage=(m:Map<string,string>)=>({getItem:(k:string)=>m.get(k)??null,setItem:(k:string,v:string)=>m.set(k,v)});
 const location={search:'?utm_source=meta&campaign_id=campaign_1&fbclid=click_1&ttclid=tiktok_1',pathname:'/'};
 const doc={cookie:'_fbp=fb.1.1700000000000.12345; _fbc=fb.1.1700000000000.click_1; _ttp=tiktok_cookie',referrer:'https://ref.example/path?private=data',createElement(){throw Error('Pixel intentionally unavailable');},head:{appendChild(){throw Error('Pixel unavailable');}}};
 const w={location,localStorage:storage(local),sessionStorage:storage(session),fbq:(...args:unknown[])=>pixelCalls.push(args)};
 Object.defineProperty(globalThis,'window',{configurable:true,value:w});Object.defineProperty(globalThis,'document',{configurable:true,value:doc});Object.defineProperty(globalThis,'fetch',{configurable:true,value:async(_url:unknown,options:{body:string})=>{requests.push(JSON.parse(options.body));return Response.json({ok:true});}});
 try{
  delete process.env.NEXT_PUBLIC_META_TRACKING_ENABLED;delete process.env.NEXT_PUBLIC_TIKTOK_TRACKING_ENABLED;
  let a=getMeasurementAttribution();assert.match(a.anonymous_id!,/^[a-f0-9-]{36}$/);assert.match(a.session_id!,/^[a-f0-9-]{36}$/);assert.equal(a.referrer_host,'ref.example');assert.equal(a.fbclid,'click_1');assert.equal(a.ttclid,'tiktok_1');assert.equal(a.fbp,undefined);
  const anonymous=a.anonymous_id,oldSession=a.session_id;
  session.set('frameleads:b71:session',JSON.stringify({id:oldSession,last:Date.now()-31*60000,attribution:{}}));
  a=getMeasurementAttribution();assert.equal(a.anonymous_id,anonymous);assert.notEqual(a.session_id,oldSession);
  process.env.NEXT_PUBLIC_META_TRACKING_ENABLED='true';process.env.NEXT_PUBLIC_META_PIXEL_ID='123456789';process.env.NEXT_PUBLIC_TIKTOK_TRACKING_ENABLED='true';
  a=getMeasurementAttribution();assert.equal(a.fbp,'fb.1.1700000000000.12345');assert.equal(a.fbc,'fb.1.1700000000000.click_1');assert.equal(a.ttp,'tiktok_cookie');
  assert.doesNotThrow(()=>initializeMeasurementPixels());
  observeMeasurement('PAGE_VIEW');observeMeasurement('PAGE_VIEW');await wait();assert.equal(requests.length,1);assert.equal((requests[0] as {eventName:string}).eventName,'PAGE_VIEW');
  const id=await providerEventId('META','a'.repeat(64));sendPixelCopy('META','Lead',id);sendPixelCopy('META','Lead',id);assert.equal((pixelCalls.at(-1)?.[3] as {eventID:string}).eventID,id);
  process.env.NEXT_PUBLIC_META_TRACKING_ENABLED='false';const before=pixelCalls.length;sendPixelCopy('META','Lead',id);assert.equal(pixelCalls.length,before);
  observeMeasurement('PURCHASE' as never);await wait();assert.equal(requests.length,1);
 }finally{for(const [key,descriptor] of prior){if(descriptor)Object.defineProperty(globalThis,key,descriptor);else Reflect.deleteProperty(globalThis,key);}for(const key of keys){if(env[key]===undefined)delete process.env[key];else process.env[key]=env[key];}}
});
test('VSL requires real forward playback; pause and seeking never count as engagement',()=>{
 assert.equal(playbackProgress(0,100,true),0);assert.equal(playbackProgress(1,2,false),0);assert.equal(playbackProgress(5,2,true),0);assert.equal(playbackProgress(1,2,true),1);
});
