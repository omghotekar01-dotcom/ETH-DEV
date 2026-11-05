/** Real Hedera testnet x402 payer CLI with same guardrails as the app. */
import {payHederaService} from '../server/hedera-x402.mjs';
const [mission='blackout',service='recon']=process.argv.slice(2);
try{
  if(process.env.RIFT_ENABLE_LIVE_PAYMENTS!=='true')throw Error('Set RIFT_ENABLE_LIVE_PAYMENTS=true to authorize bounded TESTNET spending');
  const receipt=await payHederaService({mission,service});
  console.log(JSON.stringify(receipt,null,2));
}catch(err){console.error('Hedera x402 NOT VERIFIED:',err.message);process.exitCode=1;}
