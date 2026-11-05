/** Local x402 service; real Hedera testnet facilitator, NOT a fake HTTP payment gateway. */
import express from 'express';
import {paymentMiddleware} from '@x402/express';
import {HTTPFacilitatorClient,x402ResourceServer} from '@x402/core/server';
import {ExactHederaScheme} from '@x402/hedera/exact/server';

const recipient=process.env.HEDERA_SERVICE_ACCOUNT_ID;
if(!/^0\.0\.\d+$/.test(recipient||''))throw new Error('HEDERA_SERVICE_ACCOUNT_ID must be a Hedera testnet account');
const facilitator=process.env.X402_TESTNET_FACILITATOR_URL||'https://x402.org/facilitator';
if(new URL(facilitator).protocol!=='https:')throw new Error('HTTPS facilitator required');
const server=new x402ResourceServer(new HTTPFacilitatorClient({url:facilitator})).register('hedera:*',new ExactHederaScheme({}));
const app=express();
const path='/intel';
app.use(paymentMiddleware({
  'GET /intel':{
    accepts:[{scheme:'exact',price:{asset:'0.0.429274',amount:'1000'},network:'hedera:testnet',payTo:recipient}],
    description:'RIFT per-request mission intelligence, priced at 0.001 testnet USDC',mimeType:'application/json'
  }
},server));
app.get(path,(req,res)=>{
  const mission=String(req.query.mission||'');const service=String(req.query.service||'');
  if(!['blackout','supply','vault','genesis'].includes(mission)||!['recon','marketData','riskCheck'].includes(service))return res.status(400).json({error:'Invalid mission or service'});
  const hints={recon:'Cross-check the service authority and network paths.',marketData:'Compare the requested data price against your approved per-call limit.',riskCheck:'Require a human checkpoint for any privileged operation.'};
  return res.json({provider:'rift-hedera-merchant',mission,service,kind:'paid-testnet-intelligence',observation:hints[service]});
});
app.get('/health',(_req,res)=>res.json({service:'RIFT x402 merchant',network:'hedera:testnet',asset:'testnet USDC',price:'0.001',settlement:'via facilitator'}));
const port=Number(process.env.RIFT_MERCHANT_PORT||4021);
app.listen(port,'127.0.0.1',()=>console.log(`RIFT Hedera x402 merchant at http://127.0.0.1:${port}/intel`));
