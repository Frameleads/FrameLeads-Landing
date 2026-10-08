import {createHmac} from 'node:crypto';
import {getVercelOidcToken} from '@vercel/oidc';
import {validateObservation} from '../../../measurement.ts';
import {hasAuditProxyConfiguration} from '../../../audit.ts';
const buckets=new Map<string,{time:number;hits:number}>();
export const runtime='nodejs';
export async function POST(request:Request){
 const headers={'Cache-Control':'no-store'};const reject=(code:string,status:number)=>Response.json({ok:false,code},{status,headers});
 const origin=request.headers.get('origin');
 if(origin!==new URL(request.url).origin||request.headers.get('sec-fetch-site')&&!['same-origin','none'].includes(request.headers.get('sec-fetch-site')!))return reject('ORIGIN_REJECTED',403);
 if(request.headers.get('content-type')?.split(';')[0].trim()!=='application/json')return reject('JSON_REQUIRED',415);
 if(Number(request.headers.get('content-length'))>6000)return reject('BODY_TOO_LARGE',413);
 const destination=process.env.BRAND_BRAIN_AUDIT_INGEST_URL,secret=process.env.BRAND_BRAIN_AUDIT_INGEST_SECRET;
 if(!hasAuditProxyConfiguration(destination,secret))return reject('MEASUREMENT_UNAVAILABLE',503);
 const rateKey=createHmac('sha256',secret!).update('b71:'+(request.headers.get('x-real-ip')??'missing-address')).digest('hex');
 const now=Date.now(),bucket=buckets.get(rateKey);
 if(!bucket||now-bucket.time>=60000){if(buckets.size>=1000)for(const [key,v] of buckets)if(now-v.time>=60000)buckets.delete(key);if(buckets.size>=1000&&!bucket)return reject('RATE_LIMITED',429);buckets.set(rateKey,{time:now,hits:1});}else if(++bucket.hits>30)return reject('RATE_LIMITED',429);
 try{
  const reader=request.body?.getReader();if(!reader)return reject('INVALID_OBSERVATION',400);
  const timer=setTimeout(()=>void reader.cancel(),5000);let size=0;const chunks:Uint8Array[]=[];
  try{while(true){const part=await reader.read();if(part.done)break;size+=part.value.byteLength;if(size>6000){await reader.cancel();return reject('BODY_TOO_LARGE',413);}chunks.push(part.value);}}finally{clearTimeout(timer);reader.releaseLock();}
  let body:unknown;try{body=JSON.parse(Buffer.concat(chunks).toString('utf8'));}catch{return reject('INVALID_OBSERVATION',400);}
  const event=validateObservation(body);if(!event)return reject('INVALID_OBSERVATION',400);
  const upstreamUrl=new URL(destination!);upstreamUrl.pathname='/api/marketing/measurement/ingest';const oidc=await getVercelOidcToken();
  const response=await fetch(upstreamUrl,{method:'POST',redirect:'error',cache:'no-store',headers:{'content-type':'application/json',authorization:'Bearer '+secret,'x-vercel-trusted-oidc-idp-token':oidc,'x-frameleads-measurement-rate-key':rateKey},body:JSON.stringify(event),signal:AbortSignal.timeout(10000)});
  if(!response.ok)return reject(response.status===429?'RATE_LIMITED':'MEASUREMENT_UNAVAILABLE',response.status===429?429:502);
  const upstreamReader=response.body?.getReader();if(!upstreamReader)return reject('MEASUREMENT_UNAVAILABLE',502);
  const upstreamChunks:Uint8Array[]=[];let upstreamSize=0;
  try{while(true){const part=await upstreamReader.read();if(part.done)break;upstreamSize+=part.value.byteLength;if(upstreamSize>8192){await upstreamReader.cancel();return reject('MEASUREMENT_UNAVAILABLE',502);}upstreamChunks.push(part.value);}}finally{upstreamReader.releaseLock();}
  const result=JSON.parse(Buffer.concat(upstreamChunks).toString('utf8'));if(result.ok!==true||typeof result.eventId!=='string'||!/^[a-f0-9]{64}$/.test(result.eventId))return reject('MEASUREMENT_UNAVAILABLE',502);
  return Response.json({ok:true,eventId:result.eventId},{status:201,headers});
 }catch{return reject('MEASUREMENT_UNAVAILABLE',502);}
}
