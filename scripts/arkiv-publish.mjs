/** Publish a real mission checkpoint and query it back. Requires funded Arkiv Rabdi testnet account. */
import {publishArkiv,readArkiv} from '../server/arkiv.mjs';
const [mission,status,decision,evidence]=process.argv.slice(2);
if(!mission||!status||!decision||!evidence){console.error('Usage: node scripts/arkiv-publish.mjs <blackout|supply|vault|genesis> <won|lost|blocked> "decision" "public evidence"');process.exit(2);}
try{const receipt=await publishArkiv({mission,status,decision,evidence});console.log(JSON.stringify({network:'Arkiv Rabdi testnet',...receipt},null,2));const feed=await readArkiv();console.log(JSON.stringify({visibleFeed:feed.slice(0,5)},null,2));}
catch(e){console.error('ARKIV NOT VERIFIED:',e.message);process.exitCode=1;}
