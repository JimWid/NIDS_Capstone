import {makeDemo,demoReply} from '../../../lib/demo.js';
import {endpoints,validateMessage} from '../../../lib/contract.js';
import {fetchBackend} from '../../../lib/backend.js';
export const config={api:{bodyParser:{sizeLimit:'16kb'}}};
export default async function handler(req,res){
 res.setHeader('Cache-Control','no-store');
 const resource=req.query.resource;
 if(!Object.hasOwn(endpoints,resource))return res.status(404).json({error:'Unknown resource.'});
 const method=resource==='assistant'?'POST':'GET';
 if(req.method!==method){res.setHeader('Allow',method);return res.status(405).json({error:'Method not allowed.'})}
 if(resource==='assistant'&&!validateMessage(req.body))return res.status(400).json({error:'Enter a message between 1 and 2,000 characters.'});
 // Runtime configuration works for npm and Docker without rebuilding the app.
 const mode=process.env.NIDS_DATA_MODE||'demo';
 if(!['demo','api'].includes(mode))return res.status(500).json({error:'NIDS_DATA_MODE must be demo or api.'});
 try{
 const data=mode==='demo'?(resource==='assistant'?{reply:demoReply(req.body.message,req.body.alert_id)}:makeDemo()[resource]):await fetchBackend(resource,{baseUrl:process.env.BACKEND_API_URL||process.env.NEXT_PUBLIC_API_URL,message:req.body});
 return res.json({mode,data});
 }catch(error){return res.status(502).json({mode,error:error.message})}
}
