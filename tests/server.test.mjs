import test from 'node:test';import assert from 'node:assert/strict';
import {validateInput,validateAdvice,planWith0G,createServer,authorized} from '../server/index.mjs';
test('untrusted mission input rejected',()=>{assert.equal(validateInput({mission:'nope',stepIndex:0,budget:2,selectedAgent:'scout'}),null);assert.equal(validateInput({mission:'blackout',stepIndex:0,budget:999999,selectedAgent:'scout'}),null);assert.equal(validateInput({mission:'blackout',stepIndex:0,budget:10,selectedAgent:'admin'}),null)});
test('LLM cannot create arbitrary tool actions',()=>{assert.throws(()=>validateAdvice({action:'transfer-funds',reason:'send'}));assert.throws(()=>validateAdvice({action:'buy',service:'unknown',reason:'buy'}));});
test('mocked 0G request has server-side key, validated output, genuine provider response id',async()=>{
  const calls=[];const fetcher=async(url,options)=>{calls.push({url,options});return {ok:true,json:async()=>({id:'chatcmpl-test-fixture',model:'test-model',choices:[{message:{content:'{"action":"execute","reason":"Proceed without purchases."}'}}]})};};
  const result=await planWith0G({mission:'blackout',stepIndex:0,budget:22,selectedAgent:'scout'},{fetcher,apiKey:'test-only-key',model:'test-model'});
  assert.equal(result.requestId,'chatcmpl-test-fixture');assert.equal(result.plan.action,'execute');assert.equal(result.networkSettled,false);assert.equal(calls.length,1);assert.match(calls[0].options.headers.authorization,/test-only-key/);
});
test('LLM recommends unauthorized cost and fails closed',async()=>{const fetcher=async()=>({ok:true,json:async()=>({id:'mock-1',choices:[{message:{content:'{"action":"buy","service":"marketData","reason":"Purchase the data."}'}}]})});await assert.rejects(planWith0G({mission:'blackout',stepIndex:0,budget:1,selectedAgent:'scout'},{fetcher,apiKey:'demo',model:'demo'}),/firewall/);});
test('no demo token means live access denied',()=>{assert.equal(authorized('Bearer anything'),false)});
test('HTTP server serves app and refuses external inference without secrets',async()=>{
  const server=createServer();await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));const base=`http://127.0.0.1:${server.address().port}`;
  try{const health=await (await fetch(base+'/api/health')).json();assert.equal(health.mode,'sandbox');assert.equal(health.liveVerification.hedera,false);const home=await fetch(base+'/');assert.match(await home.text(),/RIFT/);const blocked=await fetch(base+'/api/agent/plan',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({mission:'blackout',stepIndex:0,budget:22,selectedAgent:'scout'})});assert.equal(blocked.status,403);const traversal=await fetch(base+'/api/not-present');assert.equal(traversal.status,404);}finally{server.close();}
});
