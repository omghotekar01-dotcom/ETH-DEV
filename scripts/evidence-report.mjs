import {pathToFileURL} from 'node:url';
/** Convert actual RIFT live run ledger into a human-reviewable evidence checklist.
 * This report never asserts external chain verification; judges must follow source links.
 */
import {readFile,mkdir,writeFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import path from 'node:path';

const RE_HEX=/^0x[0-9a-fA-F]{64}$/;
const RE_HEDERA=/^0\.0\.\d+@\d+\.\d{1,9}$/;
export function summarizeEvidence(run){
  if(!run||typeof run!=='object'||typeof run.runId!=='string')throw new Error('Invalid local run record');
  const pc=typeof run.ai?.requestId==='string'&&run.ai.requestId.length>=5;
  const storage=RE_HEX.test(run.storage?.rootHash||'')&&RE_HEX.test(run.storage?.txHash||'');
  const hedera=run.payment?.facilitatorConfirmed===true&&RE_HEDERA.test(run.payment?.transactionId||'');
  const arkiv=run.arkiv?.readBack===true&&typeof run.arkiv?.entityKey==='string'&&run.arkiv.entityKey.length>6&&typeof run.arkiv?.owner==='string';
  const complete=run.status==='complete'&&pc&&storage&&hedera&&arkiv;
  const status=complete?'EVIDENCE RETURNED — independent verification pending':
    ['payment-status-unknown','partial-payment-settled'].includes(run.status)?'POSSIBLE SETTLEMENT — DO NOT RETRY':
    'INCOMPLETE — DO NOT CLAIM ALL THREE SPONSORS';
  return {format:'rift.evidence-report.v1',runId:run.runId,mission:run.mission,status,runStatus:run.status,
    reportedChecks:{ogPrivateComputer:pc,ogStorage:storage,hederaPayment:hedera,arkivWriteReadback:arkiv},
    references:{ogRequestId:pc?run.ai.requestId:null,ogStorageRoot:storage?run.storage.rootHash:null,
      ogStorageTxHash:storage?run.storage.txHash:null,hederaTxId:hedera?run.payment.transactionId:null,
      hederaHashScan:hedera?`https://hashscan.io/testnet/transaction/${encodeURIComponent(run.payment.transactionId)}`:null,
      arkivEntity:arkiv?run.arkiv.entityKey:null,arkivWriter:arkiv?run.arkiv.owner:null,
      arkivTx:arkiv?run.arkiv.txHash:null},
    independentNetworkVerification:false,
    nextActions:['Verify Hedera transaction status and transfer on HashScan','Verify 0G PC request ID and Storage root/upload transaction',
      'Query the Arkiv entity using the writer address and entity key','Record real screen capture showing the complete end-to-end flow',
      'Add reproducible sponsor data and submission links to README'],
    note:'Report is derived from a local JSON ledger. It does not independently query blockchain explorers or attest authenticity.'};
}
export async function createEvidenceReport({ledgerPath,outputDirectory='.rift-runtime/evidence'}={}){
  if(!ledgerPath)throw new Error('Pass the path to a real, locally generated run ledger');
  const record=JSON.parse(await readFile(ledgerPath,'utf8'));
  const report=summarizeEvidence(record);
  const digest=createHash('sha256').update(JSON.stringify(report)).digest('hex');
  await mkdir(outputDirectory,{recursive:true,mode:0o700});
  const outPath=path.resolve(outputDirectory,`run-${report.runId}.json`);
  await writeFile(outPath,JSON.stringify({...report,reportSha256:digest},null,2),{mode:0o600});
  return {path:outPath,report};
}
if(process.argv[1]&&import.meta.url===pathToFileURL(process.argv[1]).href){
  try{const {path:out,report}=await createEvidenceReport({ledgerPath:process.argv[2]});
    console.log(`Evidence report written: ${out}`);console.log(report.status);
    if(!Object.values(report.reportedChecks).every(Boolean))process.exitCode=1;
  }catch(err){console.error(`Evidence report failed: ${String(err.message).slice(0,240)}`);process.exitCode=1;}
}
