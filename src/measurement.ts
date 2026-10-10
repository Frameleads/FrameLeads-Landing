export const browserEvents=['PAGE_VIEW','VSL_ENGAGED','AUDIT_STARTED','AUDIT_COMPLETED','CHECKOUT_INITIATED'] as const;
export type BrowserEvent=(typeof browserEvents)[number];
export const attributionFields=['anonymous_id','session_id','source','medium','utm_source','utm_medium','utm_campaign','utm_content','utm_term','campaign_id','adset_id','ad_id','creative_id','creative_concept','creative_angle','creative_format','landing_variant','referrer_host','landing_path','fbclid','fbp','fbc','ttclid','ttp'] as const;
export type Attribution=Partial<Record<(typeof attributionFields)[number],string>>;
export const opaqueId=/^[a-f0-9]{8}-[a-f0-9]{4}-4[a-f0-9]{3}-[89ab][a-f0-9]{3}-[a-f0-9]{12}$/;
type Pixel=((...args:unknown[])=>void)&{callMethod?:(...args:unknown[])=>void;queue:unknown[][];push?:Pixel;loaded:boolean;version:string};
type Browser=Window&{fbq?:Pixel;_fbq?:Pixel;ttq?:{track?:(...args:unknown[])=>void};__b71Pixels?:Set<string>;__b71LastPageViewPath?:string};
let memoryAnonymous:{id:string;expires:number}|undefined;
let memorySession:{id:string;last:number;attribution:Attribution}|undefined;
const emitted=new Set<string>();
function bounded(value:unknown,key:string):string|undefined{
 if(typeof value!=='string')return;
 let v=value.trim();const max=key==='landing_path'?512:key==='referrer_host'?253:['fbclid','fbp','fbc','ttclid','ttp'].includes(key)?256:['utm_campaign','utm_content','utm_term','creative_concept','creative_angle'].includes(key)?160:128;
 if(key==='landing_path')v=v.split(/[?#]/)[0];
 if(!v||v.length>max||/[\x00-\x1f<>@]|%40|https?:\/\//i.test(v))return;
 if(['anonymous_id','session_id'].includes(key)&&!opaqueId.test(v))return;
 if(['campaign_id','adset_id','ad_id','creative_id','fbclid','fbp','fbc','ttclid','ttp'].includes(key)&&!/^[a-zA-Z0-9._:-]+$/.test(v))return;
 if(key==='landing_path'&&!/^\/(?!\/)/.test(v))return;
 if(key==='referrer_host'&&(!/^[a-zA-Z0-9.-]+$/.test(v)||/^([0-9]{1,3}\.){3}[0-9]{1,3}$/.test(v)))return;
 return ['source','medium','utm_source','utm_medium','creative_format','referrer_host'].includes(key)?v.toLowerCase():v;
}
export function normalizeAttribution(value:unknown):Attribution{
 const result:Attribution={};if(!value||typeof value!=='object'||Array.isArray(value))return result;
 for(const key of attributionFields){const v=bounded((value as Record<string,unknown>)[key],key);if(v)result[key]=v;}
 return result;
}
export function validateObservation(value:unknown,now=Date.now()){
 if(!value||typeof value!=='object'||Array.isArray(value))return null;const v=value as Record<string,unknown>;
 if(Object.keys(v).some(k=>!['observationId','eventName','occurredAt','attribution'].includes(k))||typeof v.observationId!=='string'||!opaqueId.test(v.observationId)||!browserEvents.includes(v.eventName as BrowserEvent)||typeof v.occurredAt!=='string'||!v.attribution||typeof v.attribution!=='object'||Array.isArray(v.attribution))return null;
 const time=Date.parse(v.occurredAt),raw=v.attribution as Record<string,unknown>;
 if(!Number.isFinite(time)||time<now-7*86400000||time>now+300000||Object.keys(raw).some(k=>!attributionFields.includes(k as never)))return null;
 const a=normalizeAttribution(raw);if(Object.keys(a).length!==Object.keys(raw).length||!a.anonymous_id||!a.session_id)return null;
 return {observationId:v.observationId,eventName:v.eventName as BrowserEvent,occurredAt:new Date(time).toISOString(),attribution:a};
}
export function getMeasurementAttribution():Attribution{
 if(typeof window==='undefined')return {};
 try{
  const now=Date.now();let anonymous=memoryAnonymous,session=memorySession;
  try{const saved=window.localStorage.getItem('frameleads:b71:anonymous');if(saved)anonymous=JSON.parse(saved);}catch{}
  if(!anonymous||!opaqueId.test(anonymous.id)||!Number.isFinite(anonymous.expires)||anonymous.expires<=now)anonymous={id:crypto.randomUUID(),expires:now+365*86400000};
  memoryAnonymous=anonymous;try{window.localStorage.setItem('frameleads:b71:anonymous',JSON.stringify(anonymous));}catch{}
  try{const saved=window.sessionStorage.getItem('frameleads:b71:session');if(saved)session=JSON.parse(saved);}catch{}
  if(!session||!opaqueId.test(session.id)||!Number.isFinite(session.last)||now-session.last>=30*60000||session.last>now)session={id:crypto.randomUUID(),last:now,attribution:{}};
  const a=normalizeAttribution(session.attribution),params=new URLSearchParams(window.location.search);
  for(const key of attributionFields){if(['anonymous_id','session_id','fbp','fbc','ttp','referrer_host','landing_path'].includes(key))continue;const v=bounded(params.get(key),key);if(v)a[key]=v;}
  a.anonymous_id=anonymous.id;a.session_id=session.id;a.landing_path=bounded(window.location.pathname,'landing_path')??'/';
  try{const host=bounded(new URL(document.referrer).hostname,'referrer_host');if(host)a.referrer_host=host;}catch{}
  for(const [cookie,key,allowed] of [['_fbp','fbp',process.env.NEXT_PUBLIC_META_TRACKING_ENABLED==='true'],['_fbc','fbc',process.env.NEXT_PUBLIC_META_TRACKING_ENABLED==='true'],['_ttp','ttp',process.env.NEXT_PUBLIC_TIKTOK_TRACKING_ENABLED==='true']] as const){
   if(!allowed)continue;const found=document.cookie.split(';').map(s=>s.trim()).find(s=>s.startsWith(cookie+'='));if(found)try{const v=bounded(decodeURIComponent(found.slice(cookie.length+1)),key);if(v)a[key]=v;}catch{}
  }
  session={id:session.id,last:now,attribution:a};memorySession=session;try{window.sessionStorage.setItem('frameleads:b71:session',JSON.stringify(session));}catch{}
  return a;
 }catch{return {};}
}
const jsonArray=(items:unknown[])=>'['+items.map(x=>JSON.stringify(x)).join(', ')+']';
async function digest(value:string){const hash=await crypto.subtle.digest('SHA-256',new TextEncoder().encode(value));return Array.from(new Uint8Array(hash),x=>x.toString(16).padStart(2,'0')).join('');}
export async function observationEventId(id:string){return digest(jsonArray(['b7.v1','BROWSER_OBSERVATION',id]));}
export async function providerEventId(provider:'META'|'TIKTOK',canonicalId:string){return digest(jsonArray(['b7.v1','PAID_CONVERSION',jsonArray([provider,canonicalId,1])]));}
export function initializeMeasurementPixels(){
 if(typeof window==='undefined')return;const w=window as Browser;w.__b71Pixels??=new Set();
 try{
  const id=process.env.NEXT_PUBLIC_META_PIXEL_ID;
  if(process.env.NEXT_PUBLIC_META_TRACKING_ENABLED==='true'&&id&&/^\d{5,32}$/.test(id)&&!w.__b71Pixels.has('META')){
   if(!w.fbq){const pixel=function(...args:unknown[]){if(pixel.callMethod)pixel.callMethod(...args);else pixel.queue.push(args);} as Pixel;pixel.queue=[];pixel.push=pixel;pixel.loaded=true;pixel.version='2.0';w.fbq=pixel;w._fbq=pixel;}
   const script=document.createElement('script');script.async=true;script.src='https://connect.facebook.net/en_US/fbevents.js';document.head.appendChild(script);w.fbq('init',id);w.fbq('set','autoConfig',false,id);w.__b71Pixels.add('META');
  }
 }catch{}
 try{
  const id=process.env.NEXT_PUBLIC_TIKTOK_PIXEL_ID;
  if(process.env.NEXT_PUBLIC_TIKTOK_TRACKING_ENABLED==='true'&&id&&/^[A-Za-z0-9]{5,64}$/.test(id)&&!w.__b71Pixels.has('TIKTOK')){
   const queue=(w.ttq??[]) as unknown as {methods:string[];[key:string]:unknown};queue.methods=['page','track','identify','instances','debug','on','off','once','ready','alias','group','enableCookie','disableCookie','holdConsent','revokeConsent','grantConsent'];
   for(const method of queue.methods)if(!queue[method])queue[method]=(...args:unknown[])=>(queue as unknown as unknown[][]).push([method,...args]);
   const instance=Object.assign([],{_u:'https://analytics.tiktok.com/i18n/pixel/events.js'});
   Object.assign(w,{TiktokAnalyticsObject:'ttq',ttq:queue});Object.assign(queue,{_i:{[id]:instance},_t:{[id]:Date.now()},_o:{[id]:{}}});
   const script=document.createElement('script');script.async=true;script.src='https://analytics.tiktok.com/i18n/pixel/events.js?sdkid='+encodeURIComponent(id)+'&lib=ttq';document.head.appendChild(script);w.__b71Pixels.add('TIKTOK');
  }
 }catch{}
}
/** The caller supplies the same stable ID as a matching server copy, if intended. */
export function sendPixelCopy(provider:'META'|'TIKTOK',eventName:string,eventId:string){
 if(typeof window==='undefined'||!/^[a-f0-9]{64}$/.test(eventId))return;
 try{const w=window as Browser;if(provider==='META'&&process.env.NEXT_PUBLIC_META_TRACKING_ENABLED==='true'&&/^\d{5,32}$/.test(process.env.NEXT_PUBLIC_META_PIXEL_ID??''))w.fbq?.(['PageView','InitiateCheckout','Lead','Purchase'].includes(eventName)?'track':'trackCustom',eventName,{}, {eventID:eventId});else if(provider==='TIKTOK'&&process.env.NEXT_PUBLIC_TIKTOK_TRACKING_ENABLED==='true'&&/^[A-Za-z0-9]{5,64}$/.test(process.env.NEXT_PUBLIC_TIKTOK_PIXEL_ID??''))w.ttq?.track?.(eventName,{}, {event_id:eventId});}catch{}
}
const mapping:Record<BrowserEvent,string>={PAGE_VIEW:'PageView',VSL_ENGAGED:'FrameLeadsVslEngaged',AUDIT_STARTED:'AuditStarted',AUDIT_COMPLETED:'AuditCompleted',CHECKOUT_INITIATED:'InitiateCheckout'};
export function observeMeasurement(name:BrowserEvent,once=true){
 if(typeof window==='undefined'||!browserEvents.includes(name))return;
 try{
  const attribution=getMeasurementAttribution();if(!attribution.anonymous_id||!attribution.session_id)return;
  const key=[attribution.session_id,window.location.pathname,name].join(':');
  if(name==='PAGE_VIEW'){
   const browser=window as Browser;if(browser.__b71LastPageViewPath===window.location.pathname)return;
   browser.__b71LastPageViewPath=window.location.pathname;
  }else{
   if(once&&emitted.has(key))return;
   if(once)try{if(window.sessionStorage.getItem('frameleads:b71:event:'+key))return;window.sessionStorage.setItem('frameleads:b71:event:'+key,'1');}catch{}
   emitted.add(key);
  }
  const observationId=crypto.randomUUID(),occurredAt=new Date().toISOString();
  void(async()=>{const canonical=await observationEventId(observationId);initializeMeasurementPixels();sendPixelCopy('META',mapping[name],await providerEventId('META',canonical));sendPixelCopy('TIKTOK',name==='PAGE_VIEW'?'ViewContent':mapping[name],await providerEventId('TIKTOK',canonical));await fetch('/api/measurement',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({observationId,eventName:name,occurredAt,attribution}),keepalive:true,signal:AbortSignal.timeout(10000)});})().catch(()=>{});
 }catch{}
}
