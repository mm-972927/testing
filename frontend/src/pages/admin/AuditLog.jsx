import { useEffect, useState } from 'react';
import api from '../../lib/api';

const ACTION_COLOR = {
  approved:       { bg:'var(--teal-light)',   text:'var(--teal-dark)' },
  submitted:      { bg:'var(--amber-light)',  text:'var(--amber-text)' },
  created:        { bg:'var(--gray-100)',     text:'var(--gray-600)' },
  'unlocked/returned': { bg:'var(--red-light)', text:'var(--red)' },
};

export default function AuditLog() {
  const [logs, setLogs] = useState([]);
  const [filter, setFilter] = useState('all');

  useEffect(() => { api.get('/goals/audit').then(r => setLogs(r.data)).catch(()=>setLogs([])); }, []);

  const filtered = filter === 'all' ? logs : logs.filter(l => l.action.startsWith(filter));
  const actions  = ['all', 'approved', 'submitted', 'created', 'edited', 'unlocked/returned'];

  return (
    <div style={{ padding: 28 }}>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 20, fontWeight: 600 }}>Audit trail</h1>
        <p style={{ fontSize: 13, color: 'var(--gray-600)', marginTop: 3 }}>{logs.length} events recorded — all goal changes tracked with who, what, and when</p>
      </div>

      <div style={{ display:'flex', gap:8, marginBottom:18, flexWrap:'wrap' }}>
        {actions.map(a => (
          <button key={a} onClick={()=>setFilter(a)}
            style={{ padding:'6px 14px', borderRadius:'var(--radius-sm)', fontSize:12, fontWeight:500, cursor:'pointer', border: filter===a?'1.5px solid var(--teal)':'var(--border)', background:filter===a?'var(--teal-light)':'#fff', color:filter===a?'var(--teal-dark)':'var(--gray-600)' }}>
            {a.charAt(0).toUpperCase()+a.slice(1)}
          </button>
        ))}
      </div>

      <div style={{ background:'#fff', border:'var(--border)', borderRadius:'var(--radius)', overflow:'hidden' }}>
        {filtered.length === 0 ? (
          <div style={{ textAlign:'center', padding:'48px 0', color:'var(--gray-400)', fontSize:13 }}>
            <div style={{ fontSize:28, marginBottom:8 }}>≡</div>
            No audit events yet. Create and approve goals to generate entries.
          </div>
        ) : (
          filtered.slice().reverse().map((l, i) => {
            const ac = ACTION_COLOR[l.action] || ACTION_COLOR.created;
            return (
              <div key={i} style={{ display:'flex', alignItems:'center', gap:14, padding:'11px 18px', borderBottom: i<filtered.length-1?'var(--border)':'none' }}>
                <span style={{ fontSize:11, padding:'2px 9px', borderRadius:20, fontWeight:600, background:ac.bg, color:ac.text, whiteSpace:'nowrap', flexShrink:0 }}>
                  {l.action}
                </span>
                <div style={{ flex:1, fontSize:13, color:'var(--gray-700)' }}>
                  Goal <strong>{l.goalId}</strong> {l.action} by <strong>{l.byName || l.by}</strong>
                </div>
                <div style={{ fontSize:11, color:'var(--gray-400)', fontFamily:'monospace', whiteSpace:'nowrap', flexShrink:0 }}>
                  {new Date(l.at).toLocaleString('en-IN', { dateStyle:'medium', timeStyle:'short' })}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
