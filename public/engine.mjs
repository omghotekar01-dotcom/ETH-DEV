/** RIFT v0.1 deterministic TRAINING SANDBOX engine. Never represents LLM or blockchain execution. */
export const AGENTS = [
  {id:'scout',name:'NOVA',role:'RECON AGENT',icon:'◎',color:'#9df6df',specialty:'recon',ability:'Uncover hidden threats and locate services',power:9},
  {id:'broker',name:'VEX',role:'MARKET BROKER',icon:'◇',color:'#f4ca81',specialty:'negotiate',ability:'Evaluate prices and acquire intelligence',power:8},
  {id:'operator',name:'KAI',role:'FIELD OPERATOR',icon:'⬡',color:'#b3a7fe',specialty:'execute',ability:'Build, deliver, and secure critical assets',power:9}
];
export const ZONES = [
  {id:'signal',name:'Signal Spire',type:'COMMS',x:154,y:192,color:'#80ead4',info:'Communication infrastructure and network telemetry.'},
  {id:'market',name:'Data Bazaar',type:'MARKET',x:367,y:118,color:'#f9c886',info:'An open marketplace of metered AI and data services.'},
  {id:'forge',name:'The Forge',type:'BUILD',x:595,y:225,color:'#aca2ff',info:'Agent tooling, deployment and operational execution.'},
  {id:'vault',name:'The Vault',type:'TRUST',x:611,y:413,color:'#e7a8ce',info:'Permission rules, budget locks and integrity checks.'},
  {id:'lab',name:'Research Lab',type:'INTEL',x:355,y:381,color:'#8bcbff',info:'Decision support and verified intelligence sources.'},
  {id:'port',name:'Transit Port',type:'DELIVERY',x:126,y:391,color:'#b4f48d',info:'Finalize and dispatch verified mission results.'}
];
export const SERVICES = [
  {id:'recon',name:'Signal Intelligence',kind:'RECON',price:3,zone:'signal',description:'Reveals the operational path for the next mission stage.',icon:'◎'},
  {id:'marketData',name:'Market Oracle',kind:'DATA',price:5,zone:'market',description:'Evaluates service options and improves execution reward.',icon:'◈'},
  {id:'riskCheck',name:'Risk Verification',kind:'SECURITY',price:4,zone:'vault',description:'Reduces the impact of uncertain or adversarial events.',icon:'⬡'}
];
export const MISSIONS = [
  {id:'blackout',no:'01',name:'BLACKOUT PROTOCOL',type:'Infrastructure',difficulty:'EASY',duration:12,budget:22,reward:350,color:'#88f0d1',tag:'STARTER MISSION',description:'A communications blackout threatens the city. Restore reliable signal distribution with your autonomous team.',steps:[{label:'Locate broken uplink',zone:'signal',role:'recon',service:'recon',cost:3},{label:'Source spare routing data',zone:'market',role:'negotiate',service:'marketData',cost:5},{label:'Bring the network online',zone:'forge',role:'execute',service:null,cost:2}]},
  {id:'supply',no:'02',name:'SUPPLY CHAIN ZERO',type:'Logistics',difficulty:'MEDIUM',duration:11,budget:25,reward:560,color:'#ffcd8c',tag:'ECONOMY CHALLENGE',description:'Independent suppliers went offline. Reconstruct a fair delivery chain while keeping procurement within a strict limit.',steps:[{label:'Discover available suppliers',zone:'market',role:'recon',service:'recon',cost:3},{label:'Negotiate resource access',zone:'lab',role:'negotiate',service:'marketData',cost:6},{label:'Dispatch essential shipment',zone:'port',role:'execute',service:null,cost:5}]},
  {id:'vault',no:'03',name:'VAULT BREACH',type:'Security',difficulty:'HARD',duration:10,budget:24,reward:770,color:'#c3b5ff',tag:'HIGH-RISK OPERATION',description:'An untrusted service requests a protected operation. Contain the threat without handing the agent unauthorized control.',steps:[{label:'Trace the suspicious request',zone:'lab',role:'recon',service:'recon',cost:3},{label:'Check authorization boundary',zone:'vault',role:'negotiate',service:'riskCheck',cost:4,approval:true},{label:'Quarantine the compromised route',zone:'forge',role:'execute',service:null,cost:5}]},
  {id:'genesis',no:'04',name:'GENESIS MARKET',type:'Economic systems',difficulty:'EXPERT',duration:10,budget:26,reward:1100,color:'#f0b8d6',tag:'FINAL CHALLENGE',description:'Launch a self-organizing micro-economy under pressure. Agents must balance information, spending and customer delivery.',steps:[{label:'Scan emerging service demand',zone:'signal',role:'recon',service:'recon',cost:3},{label:'Acquire verified market intel',zone:'market',role:'negotiate',service:'marketData',cost:6},{label:'Authorize economic launch',zone:'vault',role:'execute',service:'riskCheck',cost:4,approval:true},{label:'Settle delivery obligations',zone:'port',role:'execute',service:null,cost:5}]}
];
export const SPEND_POLICY = Object.freeze({maxSinglePurchase: 7, allowedServices: SERVICES.map(s=>s.id), forbiddenMerchant: 'unknown-merchant'});
const NOW=()=>new Date().toISOString();
const ev=(type,text,meta={})=>({id:`evt-${Date.now()}-${Math.random().toString(36).slice(2,6)}`,type,text,time:NOW(),...meta});
export function initialState(){return {version:1,mode:'sandbox',mission:null,missionId:null,status:'idle',stepIndex:0,round:0,score:0,spent:0,remaining:0,risk:0,blockedAttempts:0,approvedSteps:[],approvalFor:null,selectedZone:'market',selectedAgent:'scout',purchases:[],logs:[ev('system','Training sandbox initialized. No network activity has occurred.')],completed:[],liveReceipts:[],startedAt:null,finishedAt:null};}
function record(s,type,message,meta={}){s.logs=[ev(type,message,meta),...s.logs].slice(0,120);return s;}
export function activeMission(s){return MISSIONS.find(m=>m.id===s.missionId)||null;}
export function activeStep(s){const m=activeMission(s);return m?.steps[s.stepIndex]||null;}
export function reduceGame(prev,action){
  const s={...prev,purchases:[...prev.purchases],logs:[...prev.logs],completed:[...prev.completed],approvedSteps:[...(prev.approvedSteps||[])],liveReceipts:[...(prev.liveReceipts||[])]};
  const m=activeMission(s);
  switch(action.type){
    case 'START':{
      const target=MISSIONS.find(x=>x.id===action.id);if(!target) return prev;
      return {...initialState(),missionId:target.id,status:'running',remaining:target.budget,score:prev.score,completed:prev.completed.slice(),selectedAgent:'scout',selectedZone:target.steps[0].zone,startedAt:NOW(),logs:[ev('start',`Mission ${target.name} deployed. Sandbox mode; no real network calls.`)]};}
    case 'SELECT_ZONE': return ZONES.some(z=>z.id===action.id)?{...s,selectedZone:action.id}:prev;
    case 'SELECT_AGENT':return AGENTS.some(a=>a.id===action.id)?{...s,selectedAgent:action.id}:prev;
    case 'PAUSE': if(s.status!=='running')return prev;s.status='paused';return record(s,'warning','Mission paused by operator.');
    case 'RESUME':if(s.status!=='paused')return prev;s.status='running';return record(s,'system','Operator resumed mission.');
    case 'ABORT': if(!m||['won','lost','idle'].includes(s.status))return prev;s.status='lost';s.finishedAt=NOW();return record(s,'warning','Mission aborted; no rewards awarded.');
    case 'APPROVE':{
      if(s.status!=='approval'||!s.approvalFor)return prev;
      if(action.approved!==true){s.status='lost';s.finishedAt=NOW();s.approvalFor=null;return record(s,'warning','Operator denied high-risk action. Mission safely stopped.');}
      s.status='running';s.approvalFor=null;s.approvedSteps.push(s.stepIndex);return record(s,'verified','Operator approved sandbox high-risk checkpoint (not identity verified).',{step:s.stepIndex});}
    case 'RECORD_ADVICE':{
      if(!m||s.status!=='running')return prev;
      const id=action.requestId,plan=action.plan;
      if(typeof id!=='string'||id.length<2||id.length>160||!plan||!['buy','execute','wait'].includes(plan.action))return prev;
      if(typeof plan.reason!=='string'||!plan.reason.trim()||plan.reason.length>360)return prev;
      if(plan.action==='buy'&&!SERVICES.some(x=>x.id===plan.service))return prev;
      return record(s,'agent',`0G model suggested ${plan.action.toUpperCase()} for sandbox stage ${s.stepIndex+1}. Human must apply it; no external payment was made.`,{provider:'0g',requestId:id,action:plan.action,stage:s.stepIndex});
    }
    case 'RECORD_LIVE_EPISODE':{
      if(!m||s.status!=='running')return prev;
      for(const key of ['runId','requestId','rootHash','hederaTx','arkivKey']){
        if(typeof action[key]!=='string'||action[key].length<8||action[key].length>220)return prev;
      }
      if(s.liveReceipts.some(x=>x.runId===action.runId))return prev;
      s.liveReceipts.push({runId:action.runId,requestId:action.requestId,rootHash:action.rootHash,
        hederaTx:action.hederaTx,arkivKey:action.arkivKey,step:s.stepIndex,network:'real-testnet-evidence-returned'});
      return record(s,'verified',`Agent's real-network run returned 0G, Hedera x402 and Arkiv evidence for step ${s.stepIndex+1}. This is separate from game credits.`,
        {requestId:action.requestId,hederaTx:action.hederaTx,arkivKey:action.arkivKey,provider:'live-three-sponsor'});
    }
    case 'WAIT': if(!m||s.status!=='running')return prev;return record(s,'agent','Operator accepted WAIT: no credit spent and no stage advanced.');
    case 'ATTACK':{
      if(!m || s.status!=='running')return prev;
      const amount=Number(action.amount);
      const merchant=String(action.merchant||SPEND_POLICY.forbiddenMerchant);
      const denied=!Number.isFinite(amount)||amount<=0||amount>SPEND_POLICY.maxSinglePurchase||!SPEND_POLICY.allowedServices.includes(merchant)||amount>s.remaining;
      if(denied){s.blockedAttempts=(s.blockedAttempts||0)+1;s.risk=(s.risk||0)+1;
        return record(s,'blocked',`SPENDING FIREWALL BLOCKED ${Number.isFinite(amount)?amount:'invalid'} sandbox credits to ${merchant}. No credits transferred.`,{merchant,amount,blocked:true});}
      return record(s,'warning','The attempted action passed local policy, but real payments remain disabled.',{merchant,amount,blocked:false});
    }
    case 'BUY':{
      if(!m||s.status!=='running')return prev;
      const svc=SERVICES.find(x=>x.id===action.id);if(!svc)return prev;
      if(s.purchases.some(x=>x.id===svc.id&&x.stage===s.stepIndex)){return record(s,'warning','Duplicate purchase blocked for this stage.');}
      if(svc.price>SPEND_POLICY.maxSinglePurchase||!SPEND_POLICY.allowedServices.includes(svc.id))return record(s,'blocked',`Spending policy blocked ${svc.name}.`);
      if(s.remaining<svc.price)return record(s,'warning',`Insufficient sandbox credits for ${svc.name}.`);
      s.remaining-=svc.price;s.spent+=svc.price;s.purchases.push({id:svc.id,stage:s.stepIndex,price:svc.price,at:NOW(),network:'sandbox'});
      return record(s,'purchase',`${svc.name} acquired for ${svc.price} sandbox credits. Not a blockchain payment.`,{price:svc.price});}
    case 'TICK':{
      if(!m||s.status!=='running')return prev;
      s.round++;
      const step=m.steps[s.stepIndex];if(!step){return prev;}
      if(s.round>m.duration){s.status='lost';s.finishedAt=NOW();return record(s,'warning','Mission timed out. Agents returned to base.');}
      if(step.approval && !s.approvedSteps.includes(s.stepIndex)){
        if(!s.logs.some(x=>x.type==='verified'&&x.step===s.stepIndex)){
          s.status='approval';s.approvalFor=`step-${s.stepIndex}`;
          return record(s,'warning',`Human checkpoint required: ${step.label}. This is local consent, NOT World ID.`);
        }
      }
      const chosen=AGENTS.find(x=>x.specialty===step.role)||AGENTS[0];
      const discount=s.selectedAgent===chosen.id?1:0;
      const cost=Math.max(0,step.cost-discount);
      if(s.remaining<cost){s.status='lost';s.finishedAt=NOW();return record(s,'warning','Mission failed: resources exhausted before action.');}
      s.remaining-=cost;s.spent+=cost;s.selectedAgent=chosen.id;s.selectedZone=step.zone;
      const servicePurchased=step.service&&s.purchases.some(p=>p.id===step.service&&p.stage===s.stepIndex);
      s.score+=(servicePurchased?85:60)+discount*10;
      const stepWas=s.stepIndex;s.stepIndex++;
      if(s.stepIndex===m.steps.length){
        const bonus=Math.max(0, m.duration-s.round)*15 + s.remaining*5;
        s.score+=m.reward+bonus;s.status='won';s.finishedAt=NOW();s.completed.push(m.id);
        return record(s,'success',`${chosen.name} completed ${step.label}. MISSION CLEARED +${m.reward+bonus} score.`);
      }
      return record(s,'action',`${chosen.name} completed stage ${stepWas+1}: ${step.label}. ${cost} sandbox credits spent.`);
    }
    case 'RESET':return initialState();
    default:return prev;
  }
}
/** Checkpoint approval is not a substitute for authentication. */
export function approveGame(prev,yes){if(prev.status!=='approval') return prev;return reduceGame(prev,{type:'APPROVE',approved:yes});}
export function canTick(s){return s.status==='running'&&!!activeStep(s);}
export function scoreLabel(n){return Number(n||0).toLocaleString('en-US');}
