import {useState} from 'react';
import {MessageSquare} from 'lucide-react';
import Modal from './Modal';
import Assistant from './Assistant';
import {Badge} from './Table';
export default function AlertDetail({alert,onClose}){
 const [explain,setExplain]=useState(false);
 if(explain)return <Assistant alert={alert} onClose={onClose}/>;
 return <Modal title={alert.title} onClose={onClose}><div className="detail-body"><div className="detail-badges"><Badge value={alert.severity}/><Badge value={alert.status}/><span className="muted">{alert.id}</span></div><dl className="detail-grid"><div><dt>Source IP</dt><dd className="mono">{alert.source_ip}</dd></div><div><dt>Destination IP</dt><dd className="mono">{alert.destination_ip}</dd></div><div><dt>Detection method</dt><dd>{alert.detector==='ml'?'Machine learning':'Rule-based'}</dd></div><div><dt>Detected at</dt><dd>{new Date(alert.timestamp).toLocaleString()}</dd></div></dl><h3>What was observed</h3><p>{alert.description}</p><div className="investigation"><h3>Suggested investigation</h3><p>{alert.recommendation}</p></div><p className="small muted">A finding is a signal to investigate, not proof of an attack. Alert status is read-only and comes from the backend.</p><button className="button primary" onClick={()=>setExplain(true)}><MessageSquare size={16}/>Explain this alert</button></div></Modal>
}
