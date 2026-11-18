import {createContext,useContext,useEffect,useRef,useState,useCallback} from 'react';
const Context=createContext(null);
export function ProjectProvider({children}){
 const [data,setData]=useState(null),[mode,setMode]=useState(null),[error,setError]=useState(''),[loading,setLoading]=useState(true),[updated,setUpdated]=useState(null),[auto,setAuto]=useState(false);
 const controller=useRef(null);
 const refresh=useCallback(async()=>{
  controller.current?.abort();const ctrl=new AbortController();controller.current=ctrl;setLoading(true);
  try{const keys=['health','stats','devices','connections','alerts'];const results=await Promise.all(keys.map(async key=>{const response=await fetch('/api/nids/'+key,{signal:ctrl.signal});const json=await response.json();if(!response.ok)throw new Error(json.error||'Unable to load '+key);return json}));
   if(ctrl.signal.aborted)return;
   if(!results.every(r=>r.mode===results[0].mode))throw new Error('Data mode changed during refresh. Refresh again.');
   setData(Object.fromEntries(keys.map((k,i)=>[k,results[i].data])));setMode(results[0].mode);setUpdated(new Date());setError('');
  }catch(e){if(e.name!=='AbortError'){setError(e.message||'Could not load dashboard data.');setData(null);setMode(null)}}finally{if(!ctrl.signal.aborted)setLoading(false)}
 },[]);
 useEffect(()=>{refresh();return()=>controller.current?.abort()},[refresh]);
 useEffect(()=>{if(auto){const id=setInterval(refresh,30000);return()=>clearInterval(id)}},[auto,refresh]);
 return <Context.Provider value={{data,mode,error,loading,updated,refresh,auto,setAuto}}>{children}</Context.Provider>
}
export const useProject=()=>useContext(Context);
