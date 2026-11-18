import {useEffect,useRef} from 'react';
import {X} from 'lucide-react';
export default function Modal({title,onClose,children,wide=false}){
 const ref=useRef(null);
 useEffect(()=>{const dialog=ref.current;dialog.showModal();return()=>dialog.close()},[]);
 return <dialog ref={ref} className={'modal '+(wide?'wide':'')} aria-label={title} onCancel={e=>{e.preventDefault();onClose()}} onClick={e=>{if(e.target===ref.current)onClose()}}><div className="modal-header"><h2>{title}</h2><button className="icon-button" aria-label="Close dialog" onClick={onClose}><X size={20}/></button></div>{children}</dialog>
}
