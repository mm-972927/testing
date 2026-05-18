import { useEffect, useState } from 'react';
import api from '../../lib/api';

export default function AuditLog() {
  const [logs, setLogs] = useState([]);
  useEffect(() => { api.get('/goals/audit').then(r => setLogs(r.data)).catch(() => setLogs([])); }, []);

  return (
    <div style={{ padding: 28 }}>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 20, fontWeight: 600 }}>Audit log</h1>
        <p style={{ fontSize: 13, color: 'var(--gray-600)', marginTop: 3 }}>{logs.length} events recorded</p>
      </div>
      <div style={{ background: '#fff', border: 'var(--border)', borderRadius: 'var(--radius)', padding: 20 }}>
        {logs.length === 0
          ? <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--gray-400)', fontSize: 13 }}>No audit events yet. Approve or submit goals to generate entries.</div>
          : logs.slice().reverse().map((l, i) => (
            <div key={i} style={{ display: 'flex', gap: 14, padding: '10px 0', borderBottom: i < logs.length - 1 ? 'var(--border)' : 'none', alignItems: 'center' }}>
              <div style={{ width: 8, height: 8, borderRadius: '50%', background: l.action === 'approved' ? 'var(--teal)' : 'var(--amber)', flexShrink: 0 }} />
              <div style={{ flex: 1 }}>
                <span style={{ fontSize: 13, fontWeight: 500, textTransform: 'capitalize' }}>{l.action}</span>
                <span style={{ fontSize: 13, color: 'var(--gray-600)' }}> · Goal {l.goalId} by user {l.by}</span>
              </div>
              <div style={{ fontSize: 11, color: 'var(--gray-400)', fontFamily: 'monospace' }}>{new Date(l.at).toLocaleString()}</div>
            </div>
          ))
        }
      </div>
    </div>
  );
}
