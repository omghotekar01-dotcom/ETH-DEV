import test from 'node:test';import assert from 'node:assert/strict';
import {initialState,reduceGame,approveGame,MISSIONS,activeStep} from '../public/engine.mjs';
test('initial state distinctly sandbox',()=>{const s=initialState();assert.equal(s.mode,'sandbox');assert.equal(s.status,'idle');});
test('mission starts with real budget',()=>{const m=MISSIONS[0];const s=reduceGame(initialState(),{type:'START',id:m.id});assert.equal(s.remaining,m.budget);assert.equal(s.status,'running');});
test('simulation spends within budget and wins',()=>{let s=reduceGame(initialState(),{type:'START',id:'blackout'});for(let i=0;i<3;i++)s=reduceGame(s,{type:'TICK'});assert.equal(s.status,'won');assert.ok(s.spent<=22);assert.ok(s.score>350);});
test('duplicate service transaction cannot double charge',()=>{let s=reduceGame(initialState(),{type:'START',id:'blackout'});s=reduceGame(s,{type:'BUY',id:'recon'});const amount=s.spent;s=reduceGame(s,{type:'BUY',id:'recon'});assert.equal(s.spent,amount);assert.equal(s.purchases.length,1);});
test('mission approval halts until operator approves',()=>{let s=reduceGame(initialState(),{type:'START',id:'vault'});s=reduceGame(s,{type:'TICK'});s=reduceGame(s,{type:'TICK'});assert.equal(s.status,'approval');assert.equal(s.stepIndex,1);s=approveGame(s,true);assert.equal(s.status,'running');s=reduceGame(s,{type:'TICK'});assert.equal(s.stepIndex,2);});
test('operator can deny safely',()=>{let s=reduceGame(initialState(),{type:'START',id:'vault'});s=reduceGame(s,{type:'TICK'});s=reduceGame(s,{type:'TICK'});s=approveGame(s,false);assert.equal(s.status,'lost');});
test('pause/resume and abort safe transitions',()=>{let s=reduceGame(initialState(),{type:'START',id:'blackout'});s=reduceGame(s,{type:'PAUSE'});assert.equal(reduceGame(s,{type:'TICK'}).round,0);s=reduceGame(s,{type:'RESUME'});s=reduceGame(s,{type:'ABORT'});assert.equal(s.status,'lost');assert.equal(reduceGame(s,{type:'TICK'}).round,0);});
test('invalid mission or nonexistent agent do not mutate',()=>{const s=initialState();assert.equal(reduceGame(s,{type:'START',id:'no'}),s);assert.equal(reduceGame(s,{type:'SELECT_AGENT',id:'x'}),s);});
test('malicious agent purchase is denied without spending or progressing',()=>{let s=reduceGame(initialState(),{type:'START',id:'blackout'});const before=s.remaining;s=reduceGame(s,{type:'ATTACK',merchant:'unknown-merchant',amount:999});assert.equal(s.remaining,before);assert.equal(s.spent,0);assert.equal(s.stepIndex,0);assert.equal(s.blockedAttempts,1);assert.equal(s.logs[0].type,'blocked');});
test('an allowed amount still never triggers external payment',()=>{let s=reduceGame(initialState(),{type:'START',id:'blackout'});s=reduceGame(s,{type:'ATTACK',merchant:'recon',amount:3});assert.equal(s.purchases.length,0);assert.equal(s.spent,0);});
test('approval checkpoint can be replayed without bypass',()=>{let s=reduceGame(initialState(),{type:'START',id:'genesis'});s=reduceGame(s,{type:'TICK'});s=reduceGame(s,{type:'TICK'});s=reduceGame(s,{type:'TICK'});assert.equal(s.status,'approval');s=approveGame(s,true);assert.equal(s.approvedSteps.includes(2),true);s=reduceGame(s,{type:'TICK'});assert.equal(s.status,'running');assert.equal(s.stepIndex,3);});
test('forbidden actions on paused and idle games do not modify budget',()=>{let s=initialState();assert.equal(reduceGame(s,{type:'ATTACK',merchant:'evil',amount:999}),s);s=reduceGame(s,{type:'START',id:'blackout'});s=reduceGame(s,{type:'PAUSE'});assert.equal(reduceGame(s,{type:'ATTACK',merchant:'evil',amount:999}),s);});

test('0G advice is logged but can never spend or execute by itself',()=>{
  const started=reduceGame(initialState(),{type:'START',id:'blackout'});
  const id='chatcmpl-test-0g';
  const next=reduceGame(started,{type:'RECORD_ADVICE',requestId:id,plan:{action:'buy',service:'recon',reason:'Useful signal intel'}});
  assert.equal(next.remaining,started.remaining);
  assert.equal(next.stepIndex,started.stepIndex);
  assert.equal(next.logs[0].requestId,id);
  assert.equal(next.logs[0].provider,'0g');
  assert.strictEqual(reduceGame(started,{type:'RECORD_ADVICE',requestId:id,plan:{action:'wire-all-money',reason:'Attack'}}),started);
});

test('wait keeps budgets intact',()=>{
  const started=reduceGame(initialState(),{type:'START',id:'vault'});
  const next=reduceGame(started,{type:'WAIT'});
  assert.equal(next.remaining,started.remaining);
  assert.equal(next.stepIndex,started.stepIndex);
  assert.match(next.logs[0].text,/no credit spent/i);
});
