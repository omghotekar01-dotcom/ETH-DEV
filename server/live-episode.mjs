/** Real three-sponsor live mission: Arkiv context -> 0G decision -> 0G Storage -> Hedera x402 -> Arkiv queryback.
 * No fake success. No autonomous mainnet. A failed step is never silently simulated or automatically retried.
 */
import {mkdir,open,writeFile,readFile} from 'node:fs/promises';
import path from 'node:path';
import {planWith0G,validateInput} from './index.mjs';
import {episodeDocument,upload0GEpisode} from './og-storage.mjs';
import {payHederaService} from './hedera-x402.mjs';
import {publishArkiv,readArkiv} from './arkiv.mjs';
const REQUIRED=['OG_API_KEY','OG_MODEL','OG_STORAGE_PRIVATE_KEY','HEDERA_ACCOUNT_ID','HEDERA_PRIVATE_KEY','HEDERA_ALLOWED_PAY_TO','HEDERA_SERVICE_ACCOUNT_ID','RIFT_X402_ENDPOINT','RIFT_X402_ALLOWED_HOST','ARKIV_ACCESS_KEY','ARKIV_PRIVATE_KEY','RIFT_ACCESS_TOKEN'];
export function liveReadiness(env=process.env){
  const missing=REQUIRED.filter(x=>!env[x]);
  const flags={pc:!!(env.OG_API_KEY&&env.OG_MODEL),storage:!!env.OG_STORAGE_PRIVATE_KEY,
    hedera:!!(env.HEDERA_ACCOUNT_ID&&env.HEDERA_PRIVATE_KEY&&env.HEDERA_ALLOWED_PAY_TO&&env.RIFT_X402_ENDPOINT&&env.RIFT_X402_ALLOWED_HOST&&env.HEDERA_SERVICE_ACCOUNT_ID),
    arkiv:!!(env.ARKIV_ACCESS_KEY&&env.ARKIV_PRIVATE_KEY)};
  return {configured:missing.length===0,enabled:env.RIFT_ENABLE_LIVE_PAYMENTS==='true'&&env.VERCEL!=='1',flags,missing,
    note:'Configured is NOT network verified. Live payments require local durable run ledger and explicit opt-in.'};
}
export class RunLedger {
  constructor(root=path.resolve('.rift-runtime/live-episodes')){this.root=root;}
  safeKey(id){if(!/^[0-9a-f-]{36}$/i.test(id))throw Object.assign(new Error('Invalid run ID'),{status:400});return id.toLowerCase();}
  async claim(id){const key=this.safeKey(id);await mkdir(this.root,{recursive:true,mode:0o700});const file=path.join(this.root,key+'.json');
    let handle;try{handle=await open(file,'wx',0o600);}catch(e){if(e.code==='EEXIST')throw Object.assign(new Error('Run already started. Inspect the existing receipt; retry could duplicate a paid request.'),{status:409});throw e;}
    try{await handle.writeFile(JSON.stringify({runId:key,state:'reserved',startedAt:new Date().toISOString()}));}finally{await handle.close();}
    return key;
  }
  async save(id,record){await writeFile(path.join(this.root,this.safeKey(id)+'.json'),JSON.stringify(record,null,2),{mode:0o600});}
  async get(id){try{return JSON.parse(await readFile(path.join(this.root,this.safeKey(id)+'.json'),'utf8'));}catch(e){if(e.code==='ENOENT')return null;throw e;}}
}
export function validateLiveInput(data){
  if(!data||typeof data!=='object'||typeof data.runId!=='string'||!/^[0-9a-f-]{36}$/i.test(data.runId))throw Object.assign(new Error('A unique run ID is required'),{status:400});
  const ctx=validateInput(data);if(!ctx)throw Object.assign(new Error('Invalid live agent mission context'),{status:400});
  if(!ctx.step.service)throw Object.assign(new Error('This mission step has no paid intelligence service to acquire'),{status:422});
  return ctx;
}
export async function runLiveEpisode(data,{env=process.env,ledger=new RunLedger(),
  read=readArkiv,plan=planWith0G,archive=upload0GEpisode,pay=payHederaService,write=publishArkiv}={}){
  const ctx=validateLiveInput(data),ready=liveReadiness(env);
  if(!ready.configured)throw Object.assign(new Error('Missing live configuration: '+ready.missing.join(', ')),{status:503});
  if(!ready.enabled)throw Object.assign(new Error('Live testnet spending disabled; set RIFT_ENABLE_LIVE_PAYMENTS=true on a durable local server'),{status:503});
  const runId=await ledger.claim(data.runId);
  const result={runId,mission:ctx.mission.id,stepIndex:data.stepIndex,selectedAgent:data.selectedAgent,network:'Hedera testnet + 0G + Arkiv Rabdi',mode:'real-network',stages:[],status:'running'};
  let paid=false;
  const stage=async (name,job)=>{
    const started=new Date().toISOString();try{const value=await job();result.stages.push({name,status:'verified-return',at:started});await ledger.save(runId,result);return value;}
    catch(e){result.stages.push({name,status:'failed',at:started,reason:String(e.message).slice(0,200)});throw e;}
  };
  try{
    const context=await stage('arkiv-read',()=>read({mission:ctx.mission.id,limit:8}));
    if(!Array.isArray(context))throw new Error('Arkiv returned an invalid query result');
    result.arkivContext={readCount:context.length,entityKeys:context.map(x=>x.key).slice(0,8)};
    const ai=await stage('0g-inference',()=>plan({...data,arkivHints:context.slice(0,3)}, {apiKey:env.OG_API_KEY,model:env.OG_MODEL}));
    if(ai.provider!=='0g'||!ai.requestId||!ai.plan)throw new Error('No real 0G decision provenance');
    result.ai={requestId:ai.requestId,model:ai.model,plan:ai.plan};
    const publicDoc=episodeDocument({mission:ctx.mission.id,stepIndex:data.stepIndex,agent:data.selectedAgent,requestId:ai.requestId,model:ai.model,plan:ai.plan,arkivContext:context});
    result.storage=await stage('0g-storage-upload',()=>archive(publicDoc,{env}));
    if(!result.storage?.rootHash||!result.storage?.txHash)throw new Error('Episode storage proof missing');
    // AI makes the decision: no purchase is forced if it chooses execute/wait.
    if(ai.plan.action!=='buy'){
      result.status='decision-without-payment';result.note='0G chose not to purchase; Hedera step intentionally not executed.';
      result.arkiv=await stage('arkiv-write-readback',()=>write({mission:ctx.mission.id,status:'planned',decision:ai.plan.reason,evidence:result.storage.rootHash,requestId:ai.requestId,service:'none',hederaTx:'none'},{env}));
      result.status='completed-no-payment';await ledger.save(runId,result);return result;
    }
    if(ai.plan.service!==ctx.step.service)throw new Error('Model requested a service unrelated to the active mission step; safe-stop');
    // Spending budget is pre-authorized and bounded by environmental merchant+amount caps.
    result.payment=await stage('hedera-x402-settlement',async()=>{const receipt=await pay({mission:ctx.mission.id,service:ai.plan.service},{env});
      if(receipt?.facilitatorConfirmed&&receipt?.transactionId){paid=true;result.payment=receipt;}return receipt;});
    if(!result.payment?.facilitatorConfirmed||!result.payment?.transactionId)throw new Error('Hedera settlement not confirmed');
    result.arkiv=await stage('arkiv-write-readback',()=>write({mission:ctx.mission.id,status:'paid',decision:ai.plan.reason,evidence:result.storage.rootHash,
      requestId:ai.requestId,service:ai.plan.service,hederaTx:result.payment.transactionId},{env}));
    if(!result.arkiv?.readBack||!result.arkiv?.entityKey)throw new Error('Arkiv query-back not confirmed');
    result.status='complete';await ledger.save(runId,result);return result;
  }catch(err){result.status=paid?'partial-payment-settled':'safe-stopped';result.error=String(err.message).slice(0,240);
    result.recovery=paid?'Do not retry this run. A testnet payment may have settled; inspect the transaction and run ledger first.':'No paid request was confirmed; investigate before starting another run.';
    await ledger.save(runId,result);return result;
  }
}
