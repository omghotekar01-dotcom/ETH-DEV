import {authorized,planWith0G} from '../../server/index.mjs';
const requests=new Map();
export default async function handler(req,res){
  res.setHeader('Cache-Control','no-store');
  if(req.method!=='POST')return res.status(405).json({error:'Method not allowed'});
  if(!authorized(req.headers.authorization))return res.status(403).json({error:'Unauthorized demo access'});
  const ip=req.headers['x-forwarded-for']?.split(',')[0]||'unknown';const prev=requests.get(ip)||{at:Date.now(),count:0};if(Date.now()-prev.at>60_000){prev.at=Date.now();prev.count=0;}prev.count++;requests.set(ip,prev);if(requests.size>2000)requests.clear();if(prev.count>10)return res.status(429).json({error:'Rate limit reached'});
  try{const value=await planWith0G(req.body);return res.status(200).json(value);}catch(e){return res.status(e.status||502).json({error:e.status?e.message:'Provider request failed'});}
}
