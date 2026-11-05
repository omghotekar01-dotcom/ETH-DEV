/** Manual testnet Arkiv writer/query CLI; only prints actual receipts. */
import {publishArkiv,readArkiv} from '../server/arkiv.mjs';
const [mission,status,decision,evidence]=process.argv.slice(2);
if(!mission||!status||!decision||!evidence){console.error('Usage: node scripts/arkiv-publish.mjs <mission> <offer|planned|paid|blocked|won|lost> "decision" "public evidence"');process.exit(2);}
try{const receipt=await publishArkiv({mission,status,decision,evidence});console.log(JSON.stringify({network:'Arkiv Rabdi testnet',...receipt},null,2));
  const feed=await readArkiv({mission,owner:receipt.owner});console.log(JSON.stringify({verifiedOnchainFeed:feed.slice(0,5)},null,2));}
catch(e){console.error('ARKIV NOT VERIFIED:',e.message);process.exitCode=1;}
