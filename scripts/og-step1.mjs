/** RIFT / 0G Step 1. No service payments or wallets are used by this script. */
import {mkdir,writeFile} from 'node:fs/promises';
import path from 'node:path';
import {randomUUID} from 'node:crypto';
import {check0GReadiness,list0GModels} from '../server/og-config.mjs';
import {planWith0G} from '../server/index.mjs';

const mode=process.argv[2]||'--check';
function reportFailure(error){
  const message=String(error?.message||error);
  console.error('[0G] '+message.replace(/sk-[a-zA-Z0-9_-]{8,}/g,'[redacted-key]'));
  process.exitCode=1;
}
try{
  const state=check0GReadiness();
  console.log(`RIFT / 0G Private Computer: ${state.network} (${state.baseURL})`);
  if(mode==='--check'){
    console.log(`Inference key present: ${state.keyConfigured?'YES':'NO'}`);
    console.log(`Model configured: ${state.modelConfigured?'YES ('+state.model+')':'NO'}`);
    console.log(`Router trust mode: ${state.trust}`);
    for(const warning of state.warnings)console.log('Note: '+warning);
    if(state.missing.length){
      console.log('NEXT: Set '+state.missing.join(' and ')+' in local .env (never commit or share it).');
      console.log('0G Private Computer: https://pc.0g.ai  | Testnet: https://pc.testnet.0g.ai');
    }else console.log('Configuration present; run `npm run og:models` to check model ID, then `npm run og:run` for one real inference.');
    console.log('No network call or billable inference occurred.');
  }else if(mode==='--models'){
    const models=await list0GModels();
    console.log(`0G returned ${models.length} model IDs for ${state.network}:`);
    for(const m of models.slice(0,40))console.log(' - '+m.id);
    if(models.length>40)console.log(`... ${models.length-40} more (browse https://pc.0g.ai/models)`);
    console.log('Model list alone does NOT qualify as inference proof.');
  }else if(mode==='--run'){
    if(!state.inferenceReady)throw new Error('Missing '+state.missing.join(', ')+'. Create a 0G API key and configure your model first.');
    console.log('Submitting ONE potentially billable 0G inference for Blackout Protocol. No Hedera/Arkiv call or payment will be initiated.');
    const startedAt=new Date().toISOString();
    const result=await planWith0G({mission:'blackout',stepIndex:0,budget:22,selectedAgent:'scout'});
    const record={format:'rift.0g.step1.v1',source:'actual-router-response',independentVerification:'pending',
      network:state.network,model:result.model,requestId:result.requestId,startedAt,
      finishedAt:new Date().toISOString(),mission:'blackout',stepIndex:0,
      agent:'NOVA',plan:result.plan,payment:'no Hedera payment attempted',
      qualification:'CLI preflight only; main UI flow and judge-ready evidence still required'};
    const folder=path.resolve('.rift-runtime/og-evidence');
    await mkdir(folder,{recursive:true,mode:0o700});
    const file=path.join(folder,randomUUID()+'.json');
    await writeFile(file,JSON.stringify(record,null,2),{flag:'wx',mode:0o600});
    console.log(`0G inference returned request ID: ${result.requestId}`);
    console.log(`Safe model recommendation: ${result.plan.action}`);
    console.log(`Sanitized evidence written: ${path.relative(process.cwd(),file)}`);
    console.log('Still verify the model request in the main RIFT UI and preserve a real demonstration.');
  }else throw new Error('Choose --check, --models or --run');
}catch(error){reportFailure(error)}
