/** Real Hedera TESTNET x402 client. Enforces amount/merchant bounds before any signing. */
const endpoint=process.env.RIFT_X402_ENDPOINT;
const account=process.env.HEDERA_ACCOUNT_ID;
const secret=process.env.HEDERA_PRIVATE_KEY;
const recipient=process.env.HEDERA_ALLOWED_PAY_TO;
const maxTinybar=BigInt(process.env.RIFT_MAX_TINYBAR||'1000000'); // default 0.01 HBAR
if(!endpoint||!account||!secret||!recipient){console.error('Missing RIFT_X402_ENDPOINT, HEDERA_ACCOUNT_ID, HEDERA_PRIVATE_KEY, or HEDERA_ALLOWED_PAY_TO');process.exit(2);}
const u=new URL(endpoint);
if(u.protocol!=='https:'||u.username||u.password)throw new Error('Only HTTPS endpoints supported; credentials forbidden in URL');
const allowedHost=process.env.RIFT_X402_ALLOWED_HOST;
if(!allowedHost||u.hostname!==allowedHost)throw new Error('Merchant hostname is not in the explicit allowlist');
if(!/^0\.0\.\d+$/.test(recipient)||!/^0\.0\.\d+$/.test(account))throw new Error('Invalid Hedera account ID');
if(maxTinybar<=0n||maxTinybar>100_000_000n)throw new Error('Unsafe spending cap');
const first=await fetch(endpoint,{redirect:'error',signal:AbortSignal.timeout(10000)});
if(first.status!==402)throw new Error(`Expected 402 payment challenge, received HTTP ${first.status}; no payment attempted`);
const header=first.headers.get('payment-required')||first.headers.get('PAYMENT-REQUIRED');
if(!header)throw new Error('Missing x402 payment requirements header');
let required;try{required=JSON.parse(Buffer.from(header,'base64').toString('utf8'));}catch{throw new Error('Invalid x402 payment requirement encoding');}
const payment=(required.accepts||[]).find(p=>p.network==='hedera:testnet'&&p.scheme==='exact'&&p.asset==='0.0.0'&&p.payTo===recipient);
if(!payment)throw new Error('No allowed Hedera testnet exact HBAR payment option');
const amount=BigInt(payment.amount);
if(amount<=0n||amount>maxTinybar)throw new Error(`Spending firewall blocked ${amount} tinybars > ${maxTinybar} limit`);
const [{x402Client},{createClientHederaSigner},{ExactHederaScheme},{PrivateKey},{wrapFetchWithPayment,decodePaymentResponseHeader}]=await Promise.all([
  import('@x402/core/client'),import('@x402/hedera'),import('@x402/hedera/exact/client'),import('@hiero-ledger/sdk'),import('@x402/fetch')]);
const signer=createClientHederaSigner(account,PrivateKey.fromString(secret),{network:'hedera:testnet'});
const client=new x402Client().register('hedera:*',new ExactHederaScheme(signer));
const paidFetch=wrapFetchWithPayment(fetch,client);
const settled=await paidFetch(endpoint,{redirect:'error',signal:AbortSignal.timeout(30000)});
if(!settled.ok)throw new Error(`Payment request returned HTTP ${settled.status}; verify settlement externally`);
const proofHeader=settled.headers.get('payment-response');
if(!proofHeader)throw new Error('Response lacks PAYMENT-RESPONSE settlement receipt; cannot claim paid');
const proof=decodePaymentResponseHeader(proofHeader);
if(!proof?.success||!proof.transactionId||proof.network!=='hedera:testnet')throw new Error('Settlement receipt invalid/incomplete');
const body=await settled.text();
console.log(JSON.stringify({provider:'Hedera x402',network:'hedera:testnet',merchant:recipient,amountTinybar:amount.toString(),transactionId:proof.transactionId,hashScan:`https://hashscan.io/testnet/transaction/${encodeURIComponent(proof.transactionId)}`,responseSnippet:body.slice(0,200)},null,2));
