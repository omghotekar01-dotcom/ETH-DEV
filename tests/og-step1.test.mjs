import test from 'node:test';
import assert from 'node:assert/strict';
import {check0GReadiness,list0GModels,resolve0GSettings} from '../server/og-config.mjs';
import {planWith0G} from '../server/index.mjs';
const data={mission:'blackout',stepIndex:0,budget:22,selectedAgent:'scout'};
test('Step 1 detects missing credentials without leaking secrets',()=>{
 const s=check0GReadiness({OG_NETWORK:'testnet'});
 assert.deepEqual(s.missing,['OG_API_KEY','OG_MODEL']);
 assert.equal(s.baseURL,'https://router-api-testnet.integratenetwork.work/v1');
 assert.equal(JSON.stringify(s).includes('Bearer'),false);
});
test('0G router network and trust options are allowlisted',()=>{
 assert.equal(resolve0GSettings({OG_NETWORK:'mainnet'}).network,'mainnet');
 assert.throws(()=>resolve0GSettings({OG_NETWORK:'localhost'}),/OG_NETWORK/);
 assert.throws(()=>resolve0GSettings({OG_NETWORK:'testnet',OG_TRUST_MODE:'bypass'}),/OG_TRUST_MODE/);
});
test('0G model catalog uses correct router and tolerates unauthenticated public listing',async()=>{
 let url;const models=await list0GModels({env:{OG_NETWORK:'testnet'},fetcher:async(u,o)=>{url=u;assert.equal(o.headers.authorization,undefined);return {ok:true,json:async()=>({data:[{id:'0gm-model'},{id:''},{}]})}}});
 assert.equal(url,'https://router-api-testnet.integratenetwork.work/v1/models');
 assert.deepEqual(models,[{id:'0gm-model'},{id:''}].filter(x=>x.id));
});
test('genuine 0G advisor request routes to selected network and trust mode',async()=>{
 let sent;const response=await planWith0G(data,{apiKey:'sk-test-only',model:'real-model-id',env:{OG_NETWORK:'testnet',OG_TRUST_MODE:'verified'},fetcher:async(url,o)=>{sent={url,o};return {ok:true,json:async()=>({id:'chatcmpl-provider-fixture',model:'real-model-id',choices:[{message:{content:'{"action":"wait","reason":"Verify the uplink first."}'}}]})}}});
 assert.equal(sent.url,'https://router-api-testnet.integratenetwork.work/v1/chat/completions');
 assert.equal(sent.o.headers['X-0G-Provider-Trust-Mode'],'verified');
 assert.equal(response.requestId,'chatcmpl-provider-fixture');
 assert.equal(response.plan.action,'wait');
});
test('model catalog errors cannot count as qualification',async()=>{
 await assert.rejects(list0GModels({env:{},fetcher:async()=>({ok:false,status:401})}),/HTTP 401/);
});
