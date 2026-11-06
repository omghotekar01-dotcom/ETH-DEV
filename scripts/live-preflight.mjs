import {pathToFileURL} from 'node:url';
/** No-spend preflight for the real three-sponsor operator route.
 * This script does NOT sign, submit or initiate any paid network request.
 */
import {liveReadiness} from '../server/live-episode.mjs';
import {hederaConfiguration,validatePaymentQuote} from '../server/hedera-x402.mjs';

export function reviewLocalReadiness(env=process.env){
  const ready=liveReadiness(env);
  const c=hederaConfiguration(env);
  const warnings=[];
  if(!ready.configured)warnings.push(`Missing configuration names: ${ready.missing.join(', ')}`);
  if(!ready.enabled)warnings.push('Live testnet execution disabled; RIFT_ENABLE_LIVE_PAYMENTS must be true on durable local hosting.');
  if(c.host&&c.endpoint){
    try{
      const u=new URL(c.endpoint);
      if(u.hostname!==c.host||!['https:','http:'].includes(u.protocol))warnings.push('x402 host is not allowlisted or uses an invalid protocol');
      if(u.protocol==='http:'&&!['127.0.0.1','localhost'].includes(u.hostname))warnings.push('Non-loopback x402 merchant must use HTTPS');
    }catch{warnings.push('x402 merchant URL is invalid');}
  }
  if(c.merchant&&env.HEDERA_SERVICE_ACCOUNT_ID&&c.merchant!==env.HEDERA_SERVICE_ACCOUNT_ID)warnings.push('Merchant and configured service recipient do not match');
  return {configured:ready.configured,enabled:ready.enabled,missing:ready.missing,flags:ready.flags,merchant:c.host||null,warnings};
}
export async function probeX402Challenge(env=process.env,fetcher=fetch){
  const c=hederaConfiguration(env);
  if(!c.endpoint||!c.host||!c.merchant)return {ok:false,error:'Merchant endpoint, host, and recipient are required'};
  try{
    const url=new URL(c.endpoint);
    if(url.hostname!==c.host||url.username||url.password||!
      (url.protocol==='https:'||(url.protocol==='http:'&&['localhost','127.0.0.1'].includes(url.hostname))))
      throw Error('Merchant origin is not authorized');
    url.searchParams.set('mission','blackout');url.searchParams.set('service','recon');
    const response=await fetcher(url,{redirect:'error',signal:AbortSignal.timeout(8000)});
    if(response.status!==402)throw Error(`Expected payment challenge HTTP 402, received ${response.status}`);
    const challenge=response.headers.get('payment-required');
    if(!challenge)throw Error('Merchant did not send PAYMENT-REQUIRED');
    const quote=validatePaymentQuote(challenge,c);
    return {ok:true,network:quote.network,asset:quote.asset,amount:quote.amount,payTo:quote.merchant,
      note:'Only an unsigned 402 quote was checked. NO payment occurred.'};
  }catch(e){return {ok:false,error:String(e.message).slice(0,200)};}
}

if(process.argv[1]&&import.meta.url===pathToFileURL(process.argv[1]).href){
  const status=reviewLocalReadiness();
  console.log('RIFT — no-spend live integration preflight');
  console.log(JSON.stringify(status,null,2));
  if(process.argv.includes('--probe')){
    const probe=await probeX402Challenge();
    console.log('Hedera x402 merchant challenge ONLY:',JSON.stringify(probe,null,2));
    if(!probe.ok)process.exitCode=1;
  }
  if(!status.configured||!status.enabled||status.warnings.some(x=>x.includes('do not match')||x.includes('invalid')||x.includes('must use HTTPS')))process.exitCode=1;
}
