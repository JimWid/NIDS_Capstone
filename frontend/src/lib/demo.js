// Synthetic fixtures only. No packets are captured and no LLM is called.
export function makeDemo(now = new Date()) {
  const time = (minutes) => new Date(now.getTime() - minutes * 60000).toISOString();
  const devices = [
    ['dev-1','Lab workstation','192.168.1.10','02:00:00:00:00:10','Windows','authorized','online',1],
    ['dev-2','Development server','192.168.1.20','02:00:00:00:00:20','Linux','authorized','online',2],
    ['dev-3','Unknown device','192.168.1.47','02:00:00:00:00:47','Unknown','unknown','online',3],
    ['dev-4','Lab gateway','192.168.1.1','02:00:00:00:00:01','Router','authorized','online',1],
    ['dev-5','Test laptop','192.168.1.30','02:00:00:00:00:30','Windows','authorized','offline',65],
    ['dev-6','Sensor host','192.168.1.15','02:00:00:00:00:15','Linux','authorized','online',2],
  ].map(([id,name,ip,mac,os,authorization,status,mins])=>({id,name,ip,mac,os,authorization,status,last_seen:time(mins)}));
  const alerts = [
    ['ALT-001','Possible port scan','high','192.168.1.47','192.168.1.20','rule','open',3,'Repeated connection attempts to many destination ports were observed in a short interval.','Confirm whether this device is running an approved scan. Review destination ports and timing.'],
    ['ALT-002','Unknown device observed','medium','192.168.1.47','192.168.1.1','rule','open',8,'A device not present in the lab allowlist appeared in captured traffic.','Check the asset inventory and ask the lab owner to identify the device.'],
    ['ALT-003','Repeated login attempts','critical','192.168.1.47','192.168.1.20','rule','open',17,'The configured rule flagged repeated connection attempts to the authentication service. This alone does not confirm failed logins.','Correlate with server authentication logs before concluding credentials were attacked.'],
    ['ALT-004','Unusual outbound flow','medium','192.168.1.10','203.0.113.24','ml','open',38,'The model marked this flow as different from the training baseline.','Review the destination, application and flow metadata. An anomaly is not proof of an intrusion.'],
    ['ALT-005','Connection frequency increase','low','192.168.1.30','192.168.1.20','ml','reviewed',82,'A burst of connections exceeded the baseline behavior for this device.','Compare with planned development and software update activity.'],
    ['ALT-006','Possible port scan','high','192.168.1.47','192.168.1.15','rule','reviewed',140,'Several destination ports were contacted in rapid succession.','Review sensor visibility and correlate with the authorized test schedule.'],
  ].map(([id,title,severity,source_ip,destination_ip,detector,status,mins,description,recommendation])=>({id,title,severity,source_ip,destination_ip,detector,status,timestamp:time(mins),description,recommendation}));
  const connections = [
    ['FLW-001','192.168.1.10',52114,'203.0.113.10',443,'TCP',182,148300,'benign',1],
    ['FLW-002','192.168.1.47',49201,'192.168.1.20',22,'TCP',46,4140,'suspicious',3],
    ['FLW-003','192.168.1.15',53002,'192.168.1.1',53,'UDP',34,2840,'benign',4],
    ['FLW-004','192.168.1.47',49202,'192.168.1.20',3389,'TCP',25,2250,'suspicious',5],
    ['FLW-005','192.168.1.20',8000,'192.168.1.10',52115,'TCP',210,240000,'benign',7],
    ['FLW-006','192.168.1.10',52116,'203.0.113.24',443,'TCP',121,91600,'suspicious',38],
    ['FLW-007','192.168.1.30',53110,'192.168.1.1',53,'UDP',13,1140,'benign',65],
    ['FLW-008','192.168.1.1',0,'192.168.1.15',0,'ICMP',8,672,'benign',91],
  ].map(([id,source_ip,source_port,destination_ip,destination_port,protocol,packets,bytes,classification,mins])=>({id,source_ip,source_port,destination_ip,destination_port,protocol,packets,bytes,classification,last_seen:time(mins)}));
  const volumes=[160,210,170,260,320,290,430,370,520,410,330,470];
  const stats={window_label:'Last 24 hours',packets:39400,bytes:28610000,traffic:volumes.map((packets,i)=>({timestamp:time((11-i)*120),packets:packets*10})),protocols:[{protocol:'TCP',packets:29410},{protocol:'UDP',packets:8068},{protocol:'ICMP',packets:1922}]};
  return {stats,devices,alerts,connections,health:{status:'demo',capture_mode:'synthetic',updated_at:now.toISOString()}};
}
export function demoReply(message,alertId) {
 const a=makeDemo().alerts.find(a=>a.id===alertId);
 if(a)return `Example explanation — ${a.title}: ${a.description} Suggested next step: ${a.recommendation} This is a scripted demo, not an LLM assessment.`;
 if(/scan/i.test(message))return 'Example explanation: a port scan contacts multiple ports to discover available services. It can be legitimate administration or suspicious reconnaissance. Compare the source device with the authorized lab test plan. This is a scripted demo.';
 if(/device|unknown/i.test(message))return 'Example explanation: an unknown device is one that is absent from your allowlist. Identify its owner and check the asset inventory before treating it as malicious. This is a scripted demo.';
 return 'Demo assistant: this sample contains a possible port scan, an unknown device, repeated connection attempts and ML anomalies. Select an alert and choose “Explain this alert” for a scripted explanation. Real answers require the backend assistant endpoint.';
}
