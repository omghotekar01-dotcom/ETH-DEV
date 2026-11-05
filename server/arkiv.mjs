/** Optional real Arkiv Rabdi integration. Never substituting local storage for a successful chain read. */
function config(){if(!process.env.ARKIV_ACCESS_KEY)throw new Error('ARKIV_ACCESS_KEY missing');}
async function modules(){
  const [{createPublicClient,createWalletClient,ExpirationTime},{rabdi},{http,stringToBytes},{privateKeyToAccount},{defineSchema,str,addr}]=await Promise.all([
    import('@arkiv-network/sdk'),import('@arkiv-network/sdk/chains'),import('viem'),import('viem/accounts'),import('@arkiv-network/sdk/schema')]);
  return {createPublicClient,createWalletClient,ExpirationTime,rabdi,http,stringToBytes,privateKeyToAccount,defineSchema,str,addr};
}
export async function arkivClients(){
  config();const m=await modules();const chain=m.rabdi({accessKey:process.env.ARKIV_ACCESS_KEY});
  const schema=m.defineSchema('rift.agent-missions.v1',{owner:m.addr().indexed(),mission:m.str().indexed(),status:m.str().indexed(),decision:m.str(),evidence:m.str()});
  const publicClient=m.createPublicClient({chain,transport:m.http()});
  return {...m,schema,chain,publicClient};
}
export async function readArkiv(){
  const {schema,publicClient}=await arkivClients();
  const data=await publicClient.select({$key:true,mission:true,status:true,decision:true,evidence:true}).from(schema).fetch();
  return (data.entities||[]).slice(0,30).map(e=>({key:e.$key,mission:e.mission.value,status:e.status.value,decision:e.decision.value,evidence:e.evidence.value}));
}
export async function publishArkiv({mission,status,decision,evidence}){
  if(!process.env.ARKIV_PRIVATE_KEY)throw new Error('ARKIV_PRIVATE_KEY missing');
  if(typeof mission!=='string'||!['blackout','supply','vault','genesis'].includes(mission))throw new Error('Invalid mission');
  if(!['won','lost','blocked'].includes(status))throw new Error('Invalid status');
  for(const field of [decision,evidence])if(typeof field!=='string'||field.length>240)throw new Error('Invalid content');
  const m=await arkivClients();const account=m.privateKeyToAccount(process.env.ARKIV_PRIVATE_KEY);
  const wallet=m.createWalletClient({chain:m.chain,transport:m.http(),account});
  const {entityKey}=await wallet.createEntity(m.schema,{owner:m.addr(account.address),mission,status,decision,evidence},{expiration:m.ExpirationTime.fromDays(2)});
  const result=await readArkiv();
  if(!result.some(x=>String(x.key)===String(entityKey)))throw new Error('Arkiv write returned but read-back query did not find the entity');
  return {entityKey,owner:account.address,readBack:true};
}
