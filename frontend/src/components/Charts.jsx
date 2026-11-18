import { Timestamp } from './Table';

export function TrafficChart({ points }) {
  const max = points.reduce((peak, point) => Math.max(peak, point.packets), 1);

  return (
    <section className="traffic-panel">
      <h3>Packets over time</h3>
      {points.length ? <>
        <div className="bar-chart" aria-hidden="true">
          <div className="chart-scale"><span>{max.toLocaleString()}</span><span>{Math.round(max / 2).toLocaleString()}</span><span>0</span></div>
          <div className="bars">
            {points.map(({ timestamp, packets }, index) => (
              <div className="bar-slot" key={index}>
                <div className="bar" style={{ height: (packets / max) * 100 + '%' }}
                  title={new Date(timestamp).toLocaleString() + ' · ' + packets.toLocaleString() + ' packets'} />
              </div>
            ))}
          </div>
        </div>
        <div className="chart-times">
          <Timestamp value={points[0].timestamp} />
          <span>Local time</span>
          <Timestamp value={points.at(-1).timestamp} />
        </div>
        <details className="chart-data">
          <summary>View packet counts</summary>
          <div className="table-scroll">
            <table>
              <thead><tr><th>Time</th><th>Packets</th></tr></thead>
              <tbody>
                {points.map(({ timestamp, packets }, index) => (
                  <tr key={index}><td>{new Date(timestamp).toLocaleString()}</td><td>{packets.toLocaleString()}</td></tr>
                ))}
              </tbody>
            </table>
          </div>
        </details>
      </> : <p className="empty-state">No traffic samples yet.</p>}
    </section>
  );
}

export function ProtocolChart({ items }) {
  const total = items.reduce((sum, item) => sum + item.packets, 0);
  const protocols = [...items].sort((a, b) => b.packets - a.packets);

  return (
    <section className="protocol-panel">
      <h3>Packets by protocol</h3>
      {protocols.length ? (
        <ul className="protocol-list">
          {protocols.map(({ protocol, packets }, index) => {
            const percent = total ? (packets / total) * 100 : 0;
            return (
              <li key={index}>
                <div><strong>{protocol}</strong><span>{packets.toLocaleString()} · {percent.toFixed(1)}%</span></div>
                <div className="protocol-track" aria-hidden="true"><span style={{ width: percent + '%' }} /></div>
              </li>
            );
          })}
        </ul>
      ) : <p className="empty-state">No protocol data yet.</p>}
    </section>
  );
}
