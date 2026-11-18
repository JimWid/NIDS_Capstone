import Link from 'next/link';
import { useState } from 'react';
import { ArrowRight } from 'lucide-react';
import { useProject } from '../components/ProjectProvider';
import { TrafficChart, ProtocolChart } from '../components/Charts';
import { Badge, Timestamp } from '../components/Table';
import AlertDetail from '../components/AlertDetail';
import { formatBytes } from '../lib/view.js';

export default function Overview() {
  const { data } = useProject();
  const [selected, setSelected] = useState(null);
  if (!data) return null;

  const { devices, connections, alerts, stats } = data;
  const metrics = [
    ['Devices seen', devices.length],
    ['Recorded flows', connections.length],
    ['Open alerts', alerts.filter(alert => alert.status === 'open').length],
    ['Captured packets', stats.packets],
  ];
  const recentAlerts = [...alerts]
    .sort((a, b) => Date.parse(b.timestamp) - Date.parse(a.timestamp))
    .slice(0, 5);

  return <>
    <dl className="panel metrics" aria-label="Network summary">
      {metrics.map(([label, count]) => (
        <div className="metric" key={label}>
          <dt>{label}</dt>
          <dd>{count.toLocaleString()}</dd>
        </div>
      ))}
    </dl>

    <section className="panel activity-panel" aria-labelledby="activity-heading">
      <div className="section-label">
        <h2 id="activity-heading">Network activity</h2>
        <span>{stats.window_label} · {formatBytes(stats.bytes)}</span>
      </div>
      <div className="chart-grid">
        <TrafficChart points={stats.traffic} />
        <ProtocolChart items={stats.protocols} />
      </div>
    </section>

    <section className="panel recent-alerts" aria-labelledby="recent-heading">
      <div className="section-label">
        <h2 id="recent-heading">Recent alerts</h2>
        <Link href="/alerts">All alerts <ArrowRight size={15} /></Link>
      </div>
      {recentAlerts.length ? (
        <div className="table-scroll">
          <table>
            <thead><tr><th>Alert</th><th>Severity</th><th>Source</th><th>Detected</th><th>Status</th></tr></thead>
            <tbody>
              {recentAlerts.map(alert => (
                <tr key={alert.id}>
                  <td><button className="alert-link" onClick={() => setSelected(alert)}>{alert.title}<small>{alert.id}</small></button></td>
                  <td><Badge value={alert.severity} /></td>
                  <td className="mono">{alert.source_ip}</td>
                  <td><Timestamp value={alert.timestamp} /></td>
                  <td><Badge value={alert.status} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : <p className="empty-state">No alerts reported.</p>}
    </section>
    {selected && <AlertDetail alert={selected} onClose={() => setSelected(null)} />}
  </>;
}
