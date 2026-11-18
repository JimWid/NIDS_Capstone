import {endpoints,validatePayload} from './contract.js';
// Only known resources can be proxied. The backend address is server configuration.
export async function fetchBackend(resource,{baseUrl,message,fetchImpl=fetch}={}){
 if(!Object.hasOwn(endpoints,resource))throw new Error('Unknown API resource.');
 let base;
 try{base=new URL(baseUrl||'http://localhost:8000');if(!['http:','https:'].includes(base.protocol))throw Error();}catch{throw new Error('BACKEND_API_URL must be an http:// or https:// URL.');}
 const url=base.toString().replace(/\/$/,'')+endpoints[resource];
 let response;
 try{response=await fetchImpl(url,{method:resource==='assistant'?'POST':'GET',headers:{Accept:'application/json',...(resource==='assistant'?{'Content-Type':'application/json'}:{})},body:resource==='assistant'?JSON.stringify(message):undefined,signal:AbortSignal.timeout(resource==='assistant'?30000:10000),cache:'no-store',redirect:'error'});}catch{throw new Error('Backend unavailable or timed out. Check that FastAPI is running and BACKEND_API_URL is correct.');}
 if(!response.ok)throw new Error(`Backend returned HTTP ${response.status} for ${endpoints[resource]}.`);
 let data;try{data=await response.json()}catch{throw new Error('Backend returned invalid JSON.');}
 return validatePayload(resource,data);
}
