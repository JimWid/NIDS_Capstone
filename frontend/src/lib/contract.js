// Proposed contract: coordinate changes with the backend team (docs/API_CONTRACT.md).
export const endpoints = {health:'/health',stats:'/stats',devices:'/devices',connections:'/connections',alerts:'/alerts',assistant:'/assistant'};
const str=(x)=>typeof x==='string';
const num=(x)=>typeof x==='number'&&Number.isFinite(x)&&x>=0;
const date=(x)=>str(x)&&!Number.isNaN(Date.parse(x));
const fields=(row, keys)=>row&&keys.every(k=>str(row[k]));
export function validatePayload(resource,data){
 let ok=false;
 if(resource==='health')ok=fields(data,['status','capture_mode'])&&date(data.updated_at);
 if(resource==='stats')ok=fields(data,['window_label'])&&num(data.packets)&&num(data.bytes)&&Array.isArray(data.traffic)&&data.traffic.every(x=>date(x.timestamp)&&num(x.packets))&&Array.isArray(data.protocols)&&data.protocols.every(x=>str(x.protocol)&&num(x.packets));
 if(resource==='devices')ok=Array.isArray(data)&&data.every(x=>fields(x,['id','name','ip','mac','os'])&&['authorized','unknown'].includes(x.authorization)&&['online','offline'].includes(x.status)&&date(x.last_seen));
 if(resource==='connections')ok=Array.isArray(data)&&data.every(x=>fields(x,['id','source_ip','destination_ip','protocol'])&&num(x.source_port)&&num(x.destination_port)&&num(x.packets)&&num(x.bytes)&&['benign','suspicious'].includes(x.classification)&&date(x.last_seen));
 if(resource==='alerts')ok=Array.isArray(data)&&data.every(x=>fields(x,['id','title','source_ip','destination_ip','description','recommendation'])&&['low','medium','high','critical'].includes(x.severity)&&['rule','ml'].includes(x.detector)&&['open','reviewed'].includes(x.status)&&date(x.timestamp));
 if(resource==='assistant')ok=fields(data,['reply'])&&data.reply.trim().length>0;
 if(!ok)throw new Error(`Unexpected ${resource} response. Check docs/API_CONTRACT.md with the backend team.`);
 return data;
}
export function validateMessage(body){
 return body&&str(body.message)&&body.message.trim().length>0&&body.message.length<=2000&&(body.alert_id===undefined||body.alert_id===null||(str(body.alert_id)&&body.alert_id.length<=120));
}
