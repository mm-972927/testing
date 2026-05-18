import { useEffect, useState } from 'react';
import api from '../../lib/api';

export default function Approvals() {
  const [team, setTeam] = useState([]);
  const [acting, setActing] = useState({});

  const load = () => api.get('/goals/team').then(r => setTeam(r.data));
  useEffect(() => { load(); }, []);

  const pending = team.flatMap(m =>
    m.goals.filter(g => g.status === 'submitted').map(g => ({ ...g, employee: m.user }))
  );

  const act = async (goalId, status) => {
    setActing(a => ({ ...a, [goalId]: status }));
    try { await api.put(`/goals/${goalId}`, { status }); load(); }
    finally { setActing(a => ({ ...a, [goalId]: null })); }
  };

  return (
    <div style={{ padding: 28 }}>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 20, fontWeight: 600 }}>Goal approvals</h1>
        <p style={{ fontSize: 13, color: 'var(--gray-600)', marginTop: 3 }}>{pending.length} goal{pending.length !== 1 ? 's' : ''} awaiting your review</p>
      </div>

      {pending.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--gray-400)' }}>
          <div style={{ fontSize: 32, marginBottom: 8 }}>✓</div>
          <div style={{ fontSize: 14 }}>All caught up — no pending approvals</div>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {pending.map(g => (
            <div key={g.id} style={{ background: '#fff', border: 'var(--border)', borderRadius: 'var(--radius)', padding: 20 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                    <div style={{ width: 26, height: 26, borderRadius: '50%', background: 'var(--teal-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontWeight: 600, color: 'var(--teal-dark)' }}>
                      {g.employee.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                    </div>
                    <span style={{ fontSize: 12, color: 'var(--gray-600)' }}>{g.employee.name}</span>
                  </div>
                  <h2 style={{ fontSize: 15, fontWeight: 600, marginBottom: 4 }}>{g.title}</h2>
                  {g.description && <p style={{ fontSize: 13, color: 'var(--gray-600)', lineHeight: 1.5 }}>{g.description}</p>}
                </div>
                <div style={{ display: 'flex', gap: 8, flexShrink: 0, marginLeft: 16 }}>
                  <button onClick={() => act(g.id, 'draft')} disabled={acting[g.id]}
                    style={{ padding: '7px 14px', background: 'var(--red-light)', color: 'var(--red)', border: '0.5px solid var(--red)', borderRadius: 'var(--radius-sm)', fontSize: 12, fontWeight: 500 }}>
                    Return
                  </button>
                  <button onClick={() => act(g.id, 'approved')} disabled={acting[g.id]}
                    style={{ padding: '7px 16px', background: 'var(--teal)', color: '#fff', border: 'none', borderRadius: 'var(--radius-sm)', fontSize: 12, fontWeight: 600 }}>
                    {acting[g.id] === 'approved' ? 'Approving…' : '✓ Approve'}
                  </button>
                </div>
              </div>
              <div style={{ display: 'flex', gap: 8 }}>
                <span style={{ fontSize: 11, padding: '2px 9px', borderRadius: 20, background: 'var(--purple-light)', color: 'var(--purple)' }}>{g.thrustArea}</span>
                <span style={{ fontSize: 11, padding: '2px 9px', borderRadius: 20, background: 'var(--gray-100)', color: 'var(--gray-600)' }}>Target: {g.target}</span>
                <span style={{ fontSize: 11, padding: '2px 9px', borderRadius: 20, background: 'var(--gray-100)', color: 'var(--gray-600)' }}>Weight: {g.weightage}%</span>
                <span style={{ fontSize: 11, padding: '2px 9px', borderRadius: 20, background: 'var(--gray-100)', color: 'var(--gray-600)' }}>UoM: {g.uom}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
