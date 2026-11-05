import test from 'node:test';
import assert from 'node:assert/strict';
import {mkdtemp,rm} from 'node:fs/promises';
import os from 'node:os';import path from 'node:path';
import {liveReadiness,runLiveEpisode,RunLedger} from '../server/live-episode.mjs';
import {episodeDocument,upload0GEpisode} from '../server/og-storage.mjs';
import {validatePaymentQuote,parseSettlement,payHederaService} from '../server/hedera-x402.mjs';
import {validateArkivRecord} from '../server/arkiv.mjs';
import {initialState,reduceGame} from '../public/engine.mjs';
const ENV={OG_API_KEY:'test-og-credential',OG_MODEL:'test-model',OG_STORAGE_PRIVATE_KEY:'test-only-storage-secret',
  HEDERA_ACCOUNT_ID:'0.0.12345',HEDERA_PRIVATE_KEY:'test-only-signer',HEDERA_SERVICE_ACCOUNT_ID:'0.0.22222',
  HEDERA_ALLOWED_PAY_TO:'0.0.22222',RIFT_X402_ENDPOINT:'http://127.0.0.1:4021/intel',RIFT_X402_ALLOWED_HOST:'127.0.0.1',
  ARKIV_ACCESS_KEY:'test-key',ARKIV_PRIVATE_KEY:'test-only-wallet',RIFT_ACCESS_TOKEN:'test-token',RIFT_ENABLE_LIVE_PAYMENTS:'true'};
const INPUT={runId:'12345678-1234-4234-a234-123456789012',mission:'blackout',stepIndex:0,budget:22,selectedAgent:'scout'};
const PROOF_ID='chatcmpl-0g-fixture-001',ROOT='0x'+'a'.repeat(64),TX='0x'+'b'.repeat(64);
const fixture={
  read:async()=>[{key:'0xearlier',mission:'blackout',status:'offer',service:'recon'}],
  plan:async()=>({provider:'0g',requestId:PROOF_ID,model:'test-0g-model',plan:{action:'buy',service:'recon',reason:'Paid recon intelligence fits this stage.'}}),
  archive:async()=>({rootHash:ROOT,txHash:TX}),
  pay:async()=>({network:'hedera:testnet',facilitatorConfirmed:true,transactionId:'0.0.12345@123.456',service:'recon'}),
  write:async()=>({entityKey:'0xrealArkivEntity',readBack:true,txHash:'0xArkivTx'})
};
async function isolated(t){const dir=await mkdtemp(path.join(os.tmpdir(),'rift-live-'));t.after(()=>rm(dir,{recursive:true,force:true}));return new RunLedger(dir)}

test('three sponsor readiness refuses fake configuration',()=>{
  assert.equal(liveReadiness({}).configured,false);
  assert.equal(liveReadiness(ENV).enabled,true);
  assert.equal(liveReadiness({...ENV,VERCEL:'1'}).enabled,false);
  assert.equal(liveReadiness({...ENV,RIFT_ENABLE_LIVE_PAYMENTS:'false'}).enabled,false);
  assert.equal(liveReadiness({...ENV,ARKIV_ACCESS_KEY:''}).configured,false);
});
test('complete verified journey queries Arkiv, calls 0G, archives 0G episode, pays Hedera and writes Arkiv',async t=>{
  const ledger=await isolated(t),calls=[];
  const spies=Object.fromEntries(Object.entries(fixture).map(([key,fn])=>[key,async(...args)=>{calls.push(key);return fn(...args)}]));
  const actual=await runLiveEpisode(INPUT,{env:ENV,ledger,...spies});
  assert.deepEqual(calls,['read','plan','archive','pay','write']);
  assert.equal(actual.status,'complete');assert.equal(actual.ai.requestId,PROOF_ID);
  assert.equal(actual.storage.rootHash,ROOT);assert.equal(actual.payment.transactionId,'0.0.12345@123.456');
  assert.equal(actual.arkiv.readBack,true);assert.equal((await ledger.get(INPUT.runId)).status,'complete');
  await assert.rejects(runLiveEpisode(INPUT,{env:ENV,ledger,...spies}),{status:409});
});
test('0G failure safe-stops without paying or writing',async t=>{
  const ledger=await isolated(t);let payments=0;
  const result=await runLiveEpisode(INPUT,{env:ENV,ledger,...fixture,plan:async()=>{throw Error('0G offline')},pay:async()=>{payments++}});
  assert.equal(result.status,'safe-stopped');assert.equal(payments,0);
});
test('0G Storage failure stops before payment',async t=>{
  const ledger=await isolated(t);let payments=0;
  const result=await runLiveEpisode(INPUT,{env:ENV,ledger,...fixture,archive:async()=>{throw Error('indexer offline')},pay:async()=>{payments++}});
  assert.equal(result.status,'safe-stopped');assert.equal(payments,0);assert.equal(result.stages.at(-1).name,'0g-storage-upload');
});
test('model requesting different merchant service is rejected before payment',async t=>{
  const ledger=await isolated(t);let payments=0;
  const result=await runLiveEpisode(INPUT,{env:ENV,ledger,...fixture,plan:async()=>({provider:'0g',requestId:PROOF_ID,model:'test',plan:{action:'buy',service:'riskCheck',reason:'unrelated stage'}}),pay:async()=>{payments++}});
  assert.equal(result.status,'safe-stopped');assert.equal(payments,0);
});
test('model chooses WAIT: no Hedera payment and Arkiv records planned decision',async t=>{
  const ledger=await isolated(t);let payments=0,record;
  const result=await runLiveEpisode(INPUT,{env:ENV,ledger,...fixture,plan:async()=>({provider:'0g',requestId:PROOF_ID,model:'test',plan:{action:'wait',reason:'Do not buy today'}}),pay:async()=>{payments++},write:async data=>{record=data;return fixture.write();}});
  assert.equal(result.status,'completed-no-payment');assert.equal(payments,0);assert.equal(record.status,'planned');
});
test('partial Arkiv failure preserves true paid receipt, no automatic retry',async t=>{
  const ledger=await isolated(t);const result=await runLiveEpisode(INPUT,{env:ENV,ledger,...fixture,write:async()=>{throw Error('Arkiv tx timeout')}});
  assert.equal(result.status,'partial-payment-settled');assert.equal(result.payment.facilitatorConfirmed,true);
  assert.match(result.recovery,/Do not retry/);await assert.rejects(runLiveEpisode(INPUT,{env:ENV,ledger,...fixture}),{status:409});
});
test('Hedera challenge enforces correct USDC asset, network, payee and amount cap',()=>{
  const quote={accepts:[{scheme:'exact',network:'hedera:testnet',asset:'0.0.429274',payTo:'0.0.22222',amount:'1000'}]};
  const payload=Buffer.from(JSON.stringify(quote)).toString('base64');
  assert.equal(validatePaymentQuote(payload,{merchant:'0.0.22222',cap:'1000'}).amount,'1000');
  assert.throws(()=>validatePaymentQuote(payload,{merchant:'0.0.999',cap:'1000'}),/allowlisted/);
  assert.throws(()=>validatePaymentQuote(payload,{merchant:'0.0.22222',cap:'100'}),/firewall/);
  assert.throws(()=>validatePaymentQuote(Buffer.from(JSON.stringify({accepts:[{...quote.accepts[0],network:'hedera:mainnet'}]})).toString('base64'),{merchant:'0.0.22222',cap:'1000'}),/allowlisted/);
});
test('settlement receipt cannot be fabricated from HTTP 200 alone',()=>{
  const q={amount:'1000',merchant:'0.0.22222'};
  assert.throws(()=>parseSettlement(null,q),/No PAYMENT-RESPONSE/);
  assert.throws(()=>parseSettlement(Buffer.from(JSON.stringify({success:false,network:'hedera:testnet',transaction:'any'})).toString('base64'),q),/not attest/);
  const p=parseSettlement(Buffer.from(JSON.stringify({success:true,network:'hedera:testnet',transactionId:'0.0.12345@456.789'})).toString('base64'),q);
  assert.match(p.hashscan,/hashscan\.io\/testnet/);
});
test('merchant x402 first response must be 402, never blindly pay an arbitrary URL',async()=>{
  await assert.rejects(payHederaService({mission:'blackout',service:'recon'}, {env:{...ENV,RIFT_X402_ALLOWED_HOST:'evil.com'},fetcher:async()=>{throw Error('called untrusted URL')}}),/allowlisted/);
  await assert.rejects(payHederaService({mission:'blackout',service:'recon'}, {env:ENV,fetcher:async()=>({status:200,headers:new Headers()})}),/402/);
});
test('episode document excludes credentials and requires request ID',()=>{
  const doc=episodeDocument({mission:'blackout',stepIndex:0,agent:'scout',requestId:PROOF_ID,model:'test',plan:{action:'buy',service:'recon',reason:'Useful'},arkivContext:[]});
  assert.equal(doc.requestId,PROOF_ID);assert.equal(doc.payment,'not-initiated-before-episode-archiving');assert.equal(JSON.stringify(doc).includes('test-og-credential'),false);
  assert.throws(()=>episodeDocument({...doc,requestId:''}),/request ID/);
});
test('0G Storage mock SDK must return actual Merkle root and transaction hash',async()=>{
  class MemData {async merkleTree(){return [{rootHash:()=>ROOT},null]}}
  class Indexer {async upload(){return [{rootHash:ROOT,txHash:TX},null]}}
  class Wallet {constructor(key,provider){}}
  class JsonRpcProvider {constructor(url){}}
  const out=await upload0GEpisode({format:'test',requestId:PROOF_ID},{env:ENV,sdk:{MemData,Indexer},ethersLib:{ethers:{Wallet,JsonRpcProvider}}});
  assert.equal(out.rootHash,ROOT);assert.equal(out.txHash,TX);
});
test('Arkiv record schema validates typed public fields',()=>{
  assert.equal(validateArkivRecord({mission:'vault',status:'paid',decision:'safe',evidence:ROOT}).status,'paid');
  assert.throws(()=>validateArkivRecord({mission:'test',status:'paid',decision:'safe',evidence:ROOT}),/Invalid Arkiv/);
});
test('game reducer accepts live receipt but does not convert fictional credits into real cryptocurrency',()=>{
  const s=reduceGame(initialState(),{type:'START',id:'blackout'});
  const n=reduceGame(s,{type:'RECORD_LIVE_EPISODE',runId:INPUT.runId,requestId:PROOF_ID,rootHash:ROOT,hederaTx:'0.0.12345@123.456',arkivKey:'0xArkivRealKey'});
  assert.equal(n.liveReceipts.length,1);assert.equal(n.remaining,s.remaining);assert.equal(n.spent,s.spent);
  const again=reduceGame(n,{type:'RECORD_LIVE_EPISODE',runId:INPUT.runId,requestId:PROOF_ID,rootHash:ROOT,hederaTx:'0.0.12345@123.456',arkivKey:'0xArkivRealKey'});
  assert.equal(again.liveReceipts.length,1);
});
