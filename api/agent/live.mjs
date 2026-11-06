/** Explicitly fail closed on serverless: no cross-instance durable idempotency ledger. */
export default function handler(req,res){
  res.setHeader('Cache-Control','no-store');
  if(req.method!=='POST')return res.status(405).json({error:'Method not allowed'});
  res.status(503).json({error:'Live Hedera payment mode is disabled on stateless serverless. Run a durable local RIFT operator service with RIFT_ENABLE_LIVE_PAYMENTS=true.'});
}
