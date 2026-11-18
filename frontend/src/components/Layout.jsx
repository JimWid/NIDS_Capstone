import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import Head from 'next/head';
import { Shield, LayoutDashboard, Monitor, Network, Bell, MessageSquare, RefreshCw, Info } from 'lucide-react';
import { useProject } from './ProjectProvider';
import Assistant from './Assistant';

const pages = [
  { path: '/', title: 'Overview', description: 'See which devices and connections the sensor recorded.', Icon: LayoutDashboard },
  { path: '/devices', title: 'Devices', description: 'See which devices are visible to your sensor.', Icon: Monitor },
  { path: '/connections', title: 'Connections', description: 'Review recorded network flows.', Icon: Network },
  { path: '/alerts', title: 'Alerts', description: 'Review findings from your model and detection rules.', Icon: Bell },
];

export default function Layout({ children }) {
  const { pathname } = useRouter();
  const page = pages.find(({ path }) => path === pathname);
  const title = page?.title || 'Dashboard';
  const { data, mode, error, loading, updated, refresh, auto, setAuto } = useProject();
  const [assistant, setAssistant] = useState(false);
  const openAlerts = data?.alerts.filter(alert => alert.status === 'open').length;
  const updateLabel = error ? 'Connection needs attention' : 'Connecting to dashboard…';

  return <>
    <Head>
      <title>{title} · NIDS Dashboard</title>
      <meta name="description" content="Network intrusion detection dashboard for the NIDS capstone." />
      <meta name="viewport" content="width=device-width, initial-scale=1" />
    </Head>
    <div className="app">
      <aside className="sidebar">
        <Link href="/" className="brand">
          <span><Shield size={22} /></span>
          <div>NIDS<small>NETWORK MONITOR</small></div>
        </Link>
        <nav aria-label="Dashboard">
          {pages.map(({ path, title: label, Icon }) => (
            <Link key={path} href={path} className={pathname === path ? 'selected' : ''}
              aria-current={pathname === path ? 'page' : undefined}>
              <Icon size={17} /><span>{label}</span>
              {label === 'Alerts' && data && <b>{openAlerts}</b>}
            </Link>
          ))}
        </nav>
        <footer className="sidebar-bottom side-version">NIDS Capstone</footer>
      </aside>

      <div className="workspace">
        <header className="topbar">
          <div className="breadcrumb">Network monitor <span>/</span> <b>{title}</b></div>
          <button className="button assistant-button" onClick={() => setAssistant(true)} disabled={!data}>
            <MessageSquare size={16} />Ask assistant
          </button>
        </header>
        <main>
          <div className="page-header">
            <div>
              <h1>{title === 'Overview' ? 'Network overview' : title}</h1>
              {page && <p className="subtitle">{page.description}</p>}
            </div>
            <button className="button" onClick={refresh} disabled={loading}>
              <RefreshCw size={15} className={loading ? 'spin' : ''} />{loading ? 'Loading…' : 'Refresh'}
            </button>
          </div>

          {mode === 'demo' && (
            <div className="mode-banner"><Info size={16} /><span><b>Demo mode</b> · Showing sample data.</span></div>
          )}
          {mode === 'api' && data && (
            <div className="mode-banner api-banner">
              <span className="dot" />
              <span><b>API mode</b> · Capture: {data.health.capture_mode} · Backend: {data.health.status}</span>
            </div>
          )}
          <div className="refresh-line">
            <span>{updated && !error ? 'Last updated ' + updated.toLocaleTimeString() : updateLabel}</span>
            <label><input type="checkbox" checked={auto} onChange={event => setAuto(event.target.checked)} />Refresh every 30 seconds</label>
          </div>
          {error ? (
            <div className="error-state" role="alert">
              <h2>Dashboard data is unavailable</h2>
              <p>{error}</p>
              <button className="button primary" onClick={refresh}>Try again</button>
            </div>
          ) : data ? children : <div role="status" className="loading-state">Loading dashboard data…</div>}
        </main>
      </div>
    </div>
    {assistant && <Assistant onClose={() => setAssistant(false)} />}
  </>;
}
