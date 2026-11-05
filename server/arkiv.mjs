/** Arkiv Rabdi wallet-owned, expiring coordination entities used by the live mission. */
const MISSIONS=new Set(['blackout','supply','vault','genesis']);
const STATES=new Set(['offer','planned','paid','blocked','won','lost']);
export function validateArkivRecord({mission,status,decision,evidence,requestId='none',service='none',hederaTx='none'}){
  if(!MISSIONS.has(mission)||!STATES.has(status))throw new Error('Invalid Arkiv coordination entry');
  for(const value of [decision,evidence,requestId,service,hederaTx])if(typeof value!=='string'||value.length>240)throw new Error('Invalid public Arkiv entity value');
  return {mission,status,decision,evidence,requestId,service,hederaTx};
}
async function modules(){
  const [{createPublicClient,createWalletClient,ExpirationTime},{rabdi},{http},{privateKeyToAccount},{defineSchema,str,addr},{eq}]=await Promise.all([
    import('@arkiv-network/sdk'),import('@arkiv-network/sdk/chains'),import('viem'),import('viem/accounts'),import('@arkiv-network/sdk/schema'),import('@arkiv-network/sdk/query')]);
  return {createPublicClient,createWalletClient,ExpirationTime,rabdi,http,privateKeyToAccount,defineSchema,str,addr,eq};
}
export async function arkivClients({env=process.env,dependencies=null}={}){
  if(!env.ARKIV_ACCESS_KEY)throw Object.assign(new Error('ARKIV_ACCESS_KEY missing'),{status:503});
  const m=dependencies||await modules();const chain=m.rabdi({accessKey:env.ARKIV_ACCESS_KEY});
  const schema=m.defineSchema('rift.agent-coordination.v2',{
    owner:m.addr().indexed(),mission:m.str().indexed(),status:m.str().indexed(),
    requestId:m.str().indexed(),service:m.str().indexed(),decision:m.str(),evidence:m.str(),hederaTx:m.str()});
  const publicClient=m.createPublicClient({chain,transport:m.http()});
  return {...m,schema,chain,publicClient,env};
}
export async function readArkiv({mission=null,limit=20,owner=null}={},options={}){
  if(mission!==null&&!MISSIONS.has(mission))throw Error('Unknown mission filter');
  const m=await arkivClients(options);
  let query=m.publicClient.select({$key:true,$owner:true,$expiresAt:true,mission:true,status:true,requestId:true,service:true,decision:true,evidence:true,hederaTx:true}).from(m.schema);
  if(mission)query=query.where(m.eq('mission',mission));
  if(owner)query=query.ownedBy(owner);
  const {entities}=await query.fetch();
  return (entities||[]).slice(0,Math.min(30,Math.max(1,limit))).map(e=>({key:e.$key,owner:e.$owner,
    expiresAt:String(e.$expiresAt??''),mission:e.mission.value,status:e.status.value,
    requestId:e.requestId.value,service:e.service.value,decision:e.decision.value,evidence:e.evidence.value,hederaTx:e.hederaTx.value}));
}
export async function publishArkiv(data,options={}){
  const record=validateArkivRecord(data);const m=await arkivClients(options);
  if(!m.env.ARKIV_PRIVATE_KEY)throw Object.assign(new Error('ARKIV_PRIVATE_KEY missing'),{status:503});
  const account=m.privateKeyToAccount(m.env.ARKIV_PRIVATE_KEY);
  const wallet=m.createWalletClient({chain:m.chain,transport:m.http(),account});
  const values={...record,owner:m.addr(account.address)};
  const result=await wallet.createEntity(m.schema,values,{expiration:m.ExpirationTime.fromDays(2)});
  const entityKey=result?.entityKey,txHash=result?.txHash;
  if(!entityKey||!txHash)throw new Error('Arkiv write lacks entity key or transaction hash');
  const visible=await readArkiv({mission:record.mission,owner:account.address,limit:30},options);
  if(!visible.some(x=>String(x.key).toLowerCase()===String(entityKey).toLowerCase()))throw new Error('Arkiv write not found in real query-back');
  return {entityKey,txHash,owner:account.address,expiration:'2 days',readBack:true,mission:record.mission};
}
