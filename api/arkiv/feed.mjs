import {readArkiv} from '../../server/arkiv.mjs';
export default async function handler(req,res){
  res.setHeader('Cache-Control','no-store');
  if(req.method!=='GET')return res.status(405).json({error:'Method not allowed'});
  if(!process.env.ARKIV_ACCESS_KEY)return res.status(503).json({error:'Arkiv access key not configured'});
  try{return res.status(200).json({source:'arkiv-rabdi-testnet',items:await readArkiv({mission:req.query?.mission||null})});}
  catch{return res.status(502).json({error:'Arkiv read failed'});}
}
