/** Write a real 0G Storage episode after a real 0G inference. Never emit mock storage proofs. */
const DEFAULT_RPC = 'https://evmrpc-testnet.0g.ai';
const DEFAULT_INDEXER = 'https://indexer-storage-testnet-turbo.0g.ai';

export function episodeDocument({mission,stepIndex,agent,requestId,model,plan,arkivContext=[]}) {
  if (!/^[\w.-]{5,160}$/.test(String(requestId||''))) throw new Error('Missing valid 0G decision request ID');
  if (!['blackout','supply','vault','genesis'].includes(mission)) throw new Error('Unknown mission');
  if (!Number.isInteger(stepIndex)||stepIndex<0||stepIndex>5) throw new Error('Invalid step index');
  if (!['scout','broker','operator'].includes(agent)) throw new Error('Unknown agent');
  if (!['buy','wait','execute'].includes(plan?.action)) throw new Error('Unknown model action');
  // No wallet secrets, prompts, credentials, or private customer records enter public 0G storage.
  return {format:'rift.episode.v1',createdAt:new Date().toISOString(),mission,stepIndex,agent,
    provider:'0g-private-computer',requestId,model:String(model).slice(0,100),
    decision:{action:plan.action,service:plan.service||null,reason:String(plan.reason||'').slice(0,300)},
    arkivContext:arkivContext.slice(0,3).map(x=>({key:String(x.key||'').slice(0,90),status:String(x.status||'').slice(0,50)})),
    payment:'not-initiated-before-episode-archiving'};
}

export async function upload0GEpisode(episode,{env=process.env,sdk=null,ethersLib=null}={}) {
  const privateKey=env.OG_STORAGE_PRIVATE_KEY;
  if(!privateKey) throw Object.assign(new Error('0G Storage testnet wallet not configured'),{status:503});
  // Genuine SDK interaction, with imported dependencies replaceable by test doubles only in tests.
  const {MemData,Indexer}=sdk||await import('@0gfoundation/0g-storage-ts-sdk');
  const {ethers}=ethersLib||await import('ethers');
  const bytes=new TextEncoder().encode(JSON.stringify(episode));
  if(bytes.length>4096)throw new Error('Episode document exceeds configured public data cap');
  const mem=new MemData(bytes);
  const [tree,treeErr]=await mem.merkleTree();
  if(treeErr!==null)throw new Error('0G episode Merkle calculation failed');
  const indexer=new Indexer(env.OG_STORAGE_INDEXER||DEFAULT_INDEXER);
  const rpc=env.OG_STORAGE_RPC||DEFAULT_RPC;
  const signer=new ethers.Wallet(privateKey,new ethers.JsonRpcProvider(rpc));
  const [result,error]=await indexer.upload(mem,rpc,signer);
  if(error!==null||!result)throw new Error('0G episode upload did not succeed');
  const rootHash=result.rootHash||result.rootHashes?.[0]||tree?.rootHash?.();
  const txHash=result.txHash||result.txHashes?.[0];
  if(typeof rootHash!=='string'||!/^0x[0-9a-fA-F]{64}$/.test(rootHash))throw new Error('0G Storage returned no valid content root');
  if(typeof txHash!=='string'||!/^0x[0-9a-fA-F]{64}$/.test(txHash))throw new Error('0G Storage returned no valid transaction hash');
  return {network:'0g-testnet-storage',rootHash,txHash,requestId:episode.requestId,bytes:bytes.length};
}
