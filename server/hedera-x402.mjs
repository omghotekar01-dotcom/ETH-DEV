/** Testnet-only x402 paid client with explicit per-merchant and per-request spending ceiling. */
const network='hedera:testnet';
const asset='0.0.429274'; // Hedera TESTNET USDC: verify against official docs before funding.
const DEFAULT_CAP=1000n; // 0.001 USDC (6 decimals)
export function hederaConfiguration(env=process.env){return {
  endpoint:env.RIFT_X402_ENDPOINT||'', merchant:env.HEDERA_ALLOWED_PAY_TO||'',
  host:env.RIFT_X402_ALLOWED_HOST||'',account:env.HEDERA_ACCOUNT_ID||'',privateKey:env.HEDERA_PRIVATE_KEY||'',
  cap:env.RIFT_X402_MAX_UNITS||String(DEFAULT_CAP)};}
function urlSafe(endpoint,host){
  const u=new URL(endpoint);
  if(!host||u.hostname!==host||u.username||u.password||u.searchParams.has('key'))throw new Error('Merchant endpoint not allowlisted');
  if(u.protocol!=='https:' && !(u.protocol==='http:'&&['127.0.0.1','localhost'].includes(u.hostname)))throw new Error('Only HTTPS or local loopback merchant is allowed');
  if(['127.0.0.1','localhost'].includes(host)&&!['127.0.0.1','localhost'].includes(u.hostname))throw new Error('Untrusted merchant address');
  return u;
}
export function validatePaymentQuote(encoded,config){
  let requirements;
  try{requirements=JSON.parse(Buffer.from(encoded,'base64').toString('utf8'));}catch{throw new Error('Malformed x402 payment quote');}
  if(!Array.isArray(requirements?.accepts))throw new Error('Missing x402 payment options');
  const payment=requirements.accepts.find(x=>x.scheme==='exact'&&x.network===network&&x.asset===asset&&x.payTo===config.merchant);
  if(!payment)throw new Error('Payment does not match allowlisted Hedera testnet USDC merchant');
  if(!/^[1-9][0-9]*$/.test(String(payment.amount)))throw new Error('Invalid quote amount');
  const amount=BigInt(payment.amount),cap=BigInt(config.cap);
  if(cap<1n||cap>1_000_000n)throw new Error('Invalid RIFT configured max payment');
  if(amount>cap)throw new Error(`Spending firewall denied ${amount} units (> ${cap})`);
  return {amount:amount.toString(),asset,network,merchant:config.merchant,cap:cap.toString()};
}
export function parseSettlement(header,quote){
  if(!header)throw new Error('No PAYMENT-RESPONSE receipt — cannot claim a settled payment');
  let proof;
  try{proof=JSON.parse(Buffer.from(header,'base64').toString('utf8'));}catch{throw new Error('Invalid PAYMENT-RESPONSE receipt');}
  if(proof.success!==true||proof.network!==network)throw new Error('Facilitator did not attest successful Hedera settlement');
  const transactionId=proof.transactionId||proof.transaction;
  if(typeof transactionId!=='string'||!/^0\.0\.\d+@\d+\.\d{1,9}$/.test(transactionId))throw new Error('Receipt has no verifiable Hedera transaction identifier');
  return {network,asset,amount:quote.amount,merchant:quote.merchant,transactionId,facilitatorConfirmed:true,
    hashscan:`https://hashscan.io/testnet/transaction/${encodeURIComponent(transactionId)}`};
}
export async function payHederaService({mission,service},{env=process.env,fetcher=fetch,transport=null}={}){
  const c=hederaConfiguration(env);
  if(!c.endpoint||!c.merchant||!c.host||!c.account||!c.privateKey)throw Object.assign(new Error('Hedera x402 testnet configuration missing'),{status:503});
  if(!/^0\.0\.\d+$/.test(c.account)||!/^0\.0\.\d+$/.test(c.merchant))throw new Error('Malformed Hedera testnet account');
  if(!['blackout','supply','vault','genesis'].includes(mission))throw new Error('Unknown mission');
  if(!['recon','marketData','riskCheck'].includes(service))throw new Error('Unknown paid service');
  const u=urlSafe(c.endpoint,c.host);u.searchParams.set('mission',mission);u.searchParams.set('service',service);
  const first=await fetcher(u.toString(),{redirect:'error',signal:AbortSignal.timeout(12000)});
  if(first.status!==402)throw new Error('Merchant is not returning a valid HTTP 402 challenge');
  const challenge=first.headers.get('payment-required');if(!challenge)throw new Error('Merchant omitted payment requirements');
  const quote=validatePaymentQuote(challenge,c);
  // Revalidate EVERY x402 challenge, including the 402 that the payment wrapper
  // receives on its own initial fetch. Otherwise a changing quote may bypass the
  // preflight price/payee check before the SDK signs the settlement.
  const guardedFetch=async (url,init)=>{
    const response=await fetcher(url,init);
    if(response.status===402){
      const encoded=response.headers.get('payment-required');
      if(!encoded)throw new Error('x402 retry challenge did not contain payment requirements');
      const candidate=validatePaymentQuote(encoded,c);
      if(candidate.amount!==quote.amount||candidate.asset!==quote.asset||candidate.merchant!==quote.merchant||candidate.network!==quote.network)
        throw new Error('x402 payment quote changed between checks; refusing signature');
    }
    return response;
  };
  const dependencies=transport||await (async()=>{
    const [{wrapFetchWithPayment,x402Client},{createClientHederaSigner},{ExactHederaScheme},{PrivateKey}]=await Promise.all([
      import('@x402/fetch'),import('@x402/hedera'),import('@x402/hedera/exact/client'),import('@hiero-ledger/sdk')]);
    const signer=createClientHederaSigner(c.account,PrivateKey.fromStringECDSA(c.privateKey),{network});
    return {paidFetch:wrapFetchWithPayment(guardedFetch,new x402Client().register(network,new ExactHederaScheme(signer)))};
  })();
  const paidFetch=dependencies.createPaidFetch?.(guardedFetch)||dependencies.paidFetch;
  if(typeof paidFetch!=='function')throw new Error('Missing payment transport');
  const settled=await paidFetch(u.toString(),{redirect:'error',signal:AbortSignal.timeout(45000)});
  if(!settled.ok)throw new Error(`x402 paid request unsuccessful: HTTP ${settled.status}`);
  const receipt=parseSettlement(settled.headers.get('payment-response'),quote);
  const data=await settled.json();
  if(data?.provider!=='rift-hedera-merchant'||data?.mission!==mission||data?.service!==service)throw new Error('Paid service response is malformed or inconsistent');
  return {...receipt,service,mission,serviceData:data};
}
