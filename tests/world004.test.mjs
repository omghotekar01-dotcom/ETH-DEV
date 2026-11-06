import test from 'node:test';
import assert from 'node:assert/strict';
import {mkdtemp,rm,readFile} from 'node:fs/promises';
import os from 'node:os';import path from 'node:path';
import {payHederaService} from '../server/hedera-x402.mjs';
import {runLiveEpisode,RunLedger} from '../server/live-episode.mjs';
import {matchesArkivWrite} from '../server/arkiv.mjs';
import {reviewLocalReadiness,probeX402Challenge} from '../scripts/live-preflight.mjs';
import {summarizeEvidence,createEvidenceReport} from '../scripts/evidence-report.mjs';

const env={OG_API_KEY:'fixture',OG_MODEL:'fixture',OG_STORAGE_PRIVATE_KEY:'fixture',HEDERA_ACCOUNT_ID:'0.0.12345',HEDERA_PRIVATE_KEY:'fixture',HEDERA_SERVICE_ACCOUNT_ID:'0.0.45678',HEDERA_ALLOWED_PAY_TO:'0.0.45678',RIFT_X402_ENDPOINT:'http://127.0.0.1:4021/intel',RIFT_X402_ALLOWED_HOST:'127.0.0.1',ARKIV_ACCESS_KEY:'fixture',ARKIV_PRIVATE_KEY:'fixture',RIFT_ACCESS_TOKEN:'fixture',RIFT_ENABLE_LIVE_PAYMENTS:'true'};
const quote=amount=>Buffer.from(JSON.stringify({accepts:[{scheme:'exact',network:'hedera:testnet',asset:'0.0.429274',payTo:'0.0.45678',amount}]})).toString('base64');
const challenge=amount=>({status:402,headers:new Headers({'payment-required':quote(amount)})});
const receipt=Buffer.from(JSON.stringify({success:true,network:'hedera:testnet',transactionId:'0.0.12345@1712345678.123456789'})).toString('base64');
const goodResponse=()=>({ok:true,status:200,headers:new Headers({'payment-response':receipt}),json:async()=>({provider:'rift-hedera-merchant',mission:'blackout',service:'recon'})});
const input={runId:'43f017ae-1ff7-44d4-80f3-aa9a004b92a1',mission:'blackout',stepIndex:0,budget:22,selectedAgent:'scout'};
const root='0x'+'a'.repeat(64),tx='0x'+'b'.repeat(64);
const mocks={read:async()=>[],plan:async()=>({provider:'0g',model:'test',requestId:'req-123-abc',plan:{action:'buy',service:'recon',reason:'needed'}}),archive:async()=>({rootHash:root,txHash:tx}),pay:async()=>({facilitatorConfirmed:true,transactionId:'0.0.12345@1712345678.123456789'}),write:async()=>({readBack:true,entityKey:'0xabcdef01',owner:'0xcafebabe',txHash:tx})};
async function ledger(t){const dir=await mkdtemp(path.join(os.tmpdir(),'rift-w4-'));t.after(()=>rm(dir,{recursive:true,force:true}));return new RunLedger(dir)}

test('changed quote on internal retry fails before any signing or paid response',async()=>{
  let paid=false,calls=0;
  const fetcher=async()=>{calls++;return challenge(calls===1?'1000':'999');};
  await assert.rejects(payHederaService({mission:'blackout',service:'recon'},{env,fetcher,transport:{createPaidFetch:guarded=>async(url,opts)=>{
    const r=await guarded(url,opts);paid=true;return r;}}}),/changed between checks/);
  assert.equal(paid,false);assert.equal(calls,2);
});
test('changed payee on internal retry fails before any signing',async()=>{
 let calls=0,paid=false;
 const fetcher=async()=>{calls++;return calls===1?challenge('1000'):{status:402,headers:new Headers({'payment-required':Buffer.from(JSON.stringify({accepts:[{scheme:'exact',network:'hedera:testnet',asset:'0.0.429274',payTo:'0.0.999',amount:'1000'}]})).toString('base64')})};};
 await assert.rejects(payHederaService({mission:'blackout',service:'recon'},{env,fetcher,transport:{createPaidFetch:guarded=>async(u,o)=>{await guarded(u,o);paid=true;return goodResponse()}}}),/allowlisted/);
 assert.equal(paid,false);
});
test('stable quote and valid facilitator receipt still work with guard',async()=>{
 let calls=0;
 const fetcher=async()=>{calls++;return challenge('1000')};
 const result=await payHederaService({mission:'blackout',service:'recon'},{env,fetcher,transport:{createPaidFetch:guarded=>async(u,o)=>{await guarded(u,o);return goodResponse()}}});
 assert.equal(result.facilitatorConfirmed,true);assert.equal(result.amount,'1000');assert.equal(calls,2);
});
test('timeout after payment boundary is ambiguous, preserves ledger and refuses retry',async t=>{
 const store=await ledger(t);
 const actual=await runLiveEpisode(input,{env,ledger:store,...mocks,pay:async()=>{throw Error('Socket timeout after sending payment')}});
 assert.equal(actual.status,'payment-status-unknown');assert.match(actual.recovery,/Do not retry/);
 assert.ok(actual.paymentAttemptedAt);assert.equal((await store.get(input.runId)).status,'payment-status-unknown');
 await assert.rejects(runLiveEpisode(input,{env,ledger:store,...mocks}),{status:409});
});
test('failure before entering payment stage remains a safe stop',async t=>{
 const store=await ledger(t);
 const actual=await runLiveEpisode(input,{env,ledger:store,...mocks,archive:async()=>{throw Error('0G not reachable')}});
 assert.equal(actual.status,'safe-stopped');assert.equal(actual.paymentAttemptedAt,undefined);
});
test('Arkiv readback must match key, owner and all posted evidence fields',()=>{
 const record={mission:'blackout',status:'paid',decision:'safe',evidence:root,requestId:'req-123-abc',service:'recon',hederaTx:'0.0.1@123.456'};
 const row={...record,key:'0xabc',owner:'0xdef'};
 assert.equal(matchesArkivWrite(row,record,'0xabc','0xdef'),true);
 assert.equal(matchesArkivWrite({...row,hederaTx:'other'},record,'0xabc','0xdef'),false);
 assert.equal(matchesArkivWrite({...row,owner:'0xother'},record,'0xabc','0xdef'),false);
});
test('preflight never outputs credentials and rejects disabled/missing config',()=>{
 const a=reviewLocalReadiness({...env,HEDERA_PRIVATE_KEY:'super-sensitive-fixture'});
 assert.equal(a.configured,true);assert.equal(JSON.stringify(a).includes('super-sensitive-fixture'),false);
 const b=reviewLocalReadiness({...env,RIFT_ENABLE_LIVE_PAYMENTS:'false'});
 assert.equal(b.enabled,false);
 const c=reviewLocalReadiness({...env,HEDERA_SERVICE_ACCOUNT_ID:'0.0.7'});
 assert.ok(c.warnings.some(x=>x.includes('do not match')));
});
test('preflight only probes the unsigned 402 challenge, never calls paid transport',async()=>{
 let calls=0;
 const output=await probeX402Challenge(env,async()=>{calls++;return challenge('1000')});
 assert.equal(output.ok,true);assert.equal(calls,1);assert.match(output.note,/NO payment/);
 const denied=await probeX402Challenge(env,async()=>{calls++;return challenge('2000')});assert.equal(denied.ok,false);
});
test('evidence report labels missing network fields truthfully',()=>{
 const report=summarizeEvidence({runId:input.runId,status:'safe-stopped'});
 assert.equal(report.independentNetworkVerification,false);assert.equal(report.reportedChecks.hederaPayment,false);
 assert.match(report.status,/INCOMPLETE/);
 const unknown=summarizeEvidence({runId:input.runId,status:'payment-status-unknown'});
 assert.match(unknown.status,/DO NOT RETRY/);
});
test('evidence report with all reported fields is still explicitly unverified',async t=>{
 const store=await ledger(t);const actual=await runLiveEpisode(input,{env,ledger:store,...mocks});
 assert.equal(actual.status,'complete');const report=summarizeEvidence(actual);
 assert.equal(report.reportedChecks.hederaPayment,true);assert.equal(report.independentNetworkVerification,false);
 const dir=await mkdtemp(path.join(os.tmpdir(),'rift-evidence-'));t.after(()=>rm(dir,{recursive:true,force:true}));
 const made=await createEvidenceReport({ledgerPath:path.join(store.root,input.runId+'.json'),outputDirectory:dir});
 const fromFile=JSON.parse(await readFile(made.path,'utf8'));
 assert.match(fromFile.reportSha256,/^[a-f0-9]{64}$/);assert.equal(fromFile.references.hederaTxId,actual.payment.transactionId);
});
