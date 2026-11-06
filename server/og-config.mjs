/** Approved 0G Private Computer Router environments. Credentials never leave the server. */
export const OG_ROUTERS = Object.freeze({
  mainnet: 'https://router-api.0g.ai/v1',
  testnet: 'https://router-api-testnet.integratenetwork.work/v1'
});
export function resolve0GSettings(env=process.env){
  const network=String(env.OG_NETWORK||'mainnet').toLowerCase();
  if(!Object.hasOwn(OG_ROUTERS,network))throw new Error('OG_NETWORK must be mainnet or testnet');
  const trust=String(env.OG_TRUST_MODE||'standard').toLowerCase();
  if(!['standard','verified','private'].includes(trust))throw new Error('OG_TRUST_MODE must be standard, verified, or private');
  return {network,baseURL:OG_ROUTERS[network],trust};
}
export function check0GReadiness(env=process.env){
  const settings=resolve0GSettings(env);
  const missing=['OG_API_KEY','OG_MODEL'].filter(key=>!String(env[key]||'').trim());
  const key=String(env.OG_API_KEY||'');
  const warnings=[];
  if(key&&(!key.startsWith('sk-')))warnings.push('0G inference API keys normally begin with sk-; do not use a management mk- key.');
  if(!env.RIFT_ACCESS_TOKEN)warnings.push('RIFT_ACCESS_TOKEN is not set; the browser 0G advisor endpoint will refuse requests until configured.');
  return {network:settings.network,baseURL:settings.baseURL,trust:settings.trust,
    keyConfigured:!!key,modelConfigured:!!env.OG_MODEL,
    model:env.OG_MODEL?String(env.OG_MODEL).slice(0,120):null,
    inferenceReady:missing.length===0,missing,warnings};
}
export async function list0GModels({env=process.env,fetcher=fetch}={}){
  const {baseURL}=resolve0GSettings(env);
  const headers={'accept':'application/json'};
  if(env.OG_API_KEY)headers.authorization=`Bearer ${env.OG_API_KEY}`;
  const response=await fetcher(baseURL+'/models',{headers,signal:AbortSignal.timeout(10000)});
  if(!response.ok)throw new Error(`0G model catalog unavailable (HTTP ${response.status}); check router network or credentials`);
  const body=await response.json();
  if(!Array.isArray(body.data))throw new Error('0G model catalog returned an unexpected response');
  return body.data.filter(x=>x&&typeof x.id==='string'&&x.id.trim()).map(x=>({id:x.id}));
}
