import { useEffect, useState } from 'react';
import api from '../../lib/api';

const Q_LABELS = { q1: 'Q1 Jul', q2: 'Q2 Oct', q3: 'Q3 Jan', q4: 'Q4 Apr' };

export default function CompletionDashboard() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/goals/completion-dashboard').then(r => setData(r.data)).finally(() => setLoading(false));
  }, []);

  const exportCSV = () => {
    window.open(import.meta.env.VITE_API_URL
      ? `${import.meta.env.VITE_API_URL}/goals/export`
      : 'http://localhost:4000/api/goals/export', '_blank');
  };

  if (loading) return <div style={{ padding: 28, color: 'var(--gray-400)' }}>Loading…</div>;

  return (
    <div style={{ padding: 28 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24 }}>
        <div>
          <h1 style={{ fontSize: 20, fontWeight: 600 }}>Completion dashboard</h1>
          <p style={{ fontSize: 13, color: 'var(--gray-600)', marginTop: 3 }}>Real-time check-in completion rates across the organisation</p>
        </div>
        <button onClick={exportCSV}
          style={{ display: 'flex', alignItems: 'center', gap: 7, padding: '9px 18px', background: 'var(--teal)', color: '#fff', border: 'none', borderRadius: 'var(--radius-sm)', fontWeight: 600, fontSize: 13, cursor: 'pointer' }}>
          ↓ Export Achievement Report (CSV)
        </button>
      </div>

      {/* Summary row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 12, marginBottom: 24 }}>
        {Object.entries(Q_LABELS).map(([q, label]) => {
          const total = data.length;
          const done  = data.filter(d => d.checkins[q]?.pct === 100).length;
          const pct   = total ? Math.round(done/total*100) : 0;
          return (
            <div key={q} style={{ background: '#fff', border: 'var(--border)', borderRadius: 'var(--radius)', padding: 16 }}>
              <div style={{ fontSize: 11, color: 'var(--gray-600)', marginBottom: 6 }}>{label}</div>
              <div style={{ fontSize: 22, fontWeight: 600, color: pct===100?'var(--teal)':pct>=50?'var(--amber)':'var(--red)' }}>{pct}%</div>
              <div style={{ fontSize: 11, color: 'var(--gray-400)', marginTop: 2 }}>{done}/{total} employees complete</div>
              <div style={{ height: 4, background: 'var(--gray-100)', borderRadius: 2, marginTop: 8 }}>
                <div style={{ height: '100%', width: `${pct}%`, background: pct===100?'var(--teal)':pct>=50?'var(--amber)':'var(--red)', borderRadius: 2, transition: 'width .6s' }} />
              </div>
            </div>
          );
        })}
      </div>

      {/* Per-employee table */}
      <div style={{ background: '#fff', border: 'var(--border)', borderRadius: 'var(--radius)', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: 'var(--gray-50)', borderBottom: 'var(--border)' }}>
              <th style={{ padding: '10px 16px', textAlign: 'left', fontSize: 11, fontWeight: 600, color: 'var(--gray-600)' }}>Employee</th>
              <th style={{ padding: '10px 16px', textAlign: 'left', fontSize: 11, fontWeight: 600, color: 'var(--gray-600)' }}>Active Goals</th>
              {Object.entries(Q_LABELS).map(([q, l]) => (
                <th key={q} style={{ padding: '10px 16px', textAlign: 'center', fontSize: 11, fontWeight: 600, color: 'var(--gray-600)' }}>{l}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.map((d, i) => (
              <tr key={d.employee.id} style={{ borderBottom: i < data.length-1 ? 'var(--border)' : 'none' }}>
                <td style={{ padding: '11px 16px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
                    <div style={{ width: 28, height: 28, borderRadius: '50%', background: 'var(--teal-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontWeight: 700, color: 'var(--teal-dark)' }}>
                      {d.employee.name.split(' ').map(n=>n[0]).join('').slice(0,2)}
                    </div>
                    <div>
                      <div style={{ fontSize: 13, fontWeight: 500 }}>{d.employee.name}</div>
                      <div style={{ fontSize: 11, color: 'var(--gray-400)' }}>{d.employee.department}</div>
                    </div>
                  </div>
                </td>
                <td style={{ padding: '11px 16px', fontSize: 13, color: 'var(--gray-600)' }}>{d.goalsCount}</td>
                {['q1','q2','q3','q4'].map(q => {
                  const ci = d.checkins[q];
                  const pct = ci?.pct ?? 0;
                  return (
                    <td key={q} style={{ padding: '11px 16px', textAlign: 'center' }}>
                      <span style={{ fontSize: 11, padding: '2px 9px', borderRadius: 20, fontWeight: 600,
                        background: pct===100?'var(--teal-light)':pct>0?'var(--amber-light)':'var(--gray-100)',
                        color:      pct===100?'var(--teal-dark)':pct>0?'var(--amber-text)':'var(--gray-400)' }}>
                        {ci?.updated ?? 0}/{ci?.total ?? 0}
                      </span>
                    </td>
                  );
                })}
              </tr>
            ))}
            {data.length === 0 && (
              <tr><td colSpan={6} style={{ padding: '40px 0', textAlign: 'center', color: 'var(--gray-400)', fontSize: 13 }}>No data yet</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
