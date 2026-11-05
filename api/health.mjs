import {providers} from '../server/index.mjs';
import {liveReadiness} from '../server/live-episode.mjs';
export default function handler(req,res){
  res.setHeader('Cache-Control','no-store');
  if(req.method!=='GET')return res.status(405).json({error:'Method not allowed'});
  const live=liveReadiness({...process.env,VERCEL:'1'});
  res.status(200).json({name:'RIFT',version:'0.3.0',mode:'sandbox',providers:providers(),live,
    liveVerification:{og:false,hedera:false,arkiv:false},note:'Configured does not prove a successful provider operation.'});
}
