import { useEffect, useState } from 'react';
import api from '../../lib/api';

export default function AdminGoals() {
  const [team, setTeam] = useState([]);
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');

  const load = () => api.get('/goals/team').then(r => setTeam(r.data));
  useEffect(() => { load(); }, []);

  const allGoals = team.flatMap(m => m.goals.map(g => ({ ...g, employee: m.user })));
  const filtered = allGoals.filter(g => {
    const matchStatus = filter === 'all' || g.status === filter;
    const matchSearch = !search || g.title.toLowerCase().includes(search.toLowerCase()) || g.employee.name.toLowerCase().includes(search.toLowerCase());
    return matchStatus && matchSearch;
  });

  const act = async (goalId, status) => { await api.put(`/goals/${goalId}`, { status }); load(); };

  const STATUS_COLOR = { approved: 'var(--teal)', submitted: 'var(--amber)', draft: 'var(--gray-400)' };
  const STATUS_BG = { approved: 'var(--teal-light)', submitted: 'var(--amber-light)', draft: 'var(--gray-100)' };

  return (
    <div style={{ padding: 28 }}>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 20, fontWeight: 600 }}>All goals</h1>
        <p style={{ fontSize: 13, color: 'var(--gray-600)', marginTop: 3 }}>{allGoals.length} total across {team.length} employees</p>
      </div>

      <div style={{ display: 'flex', gap: 10, marginBottom: 18 }}>
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by goal or employee…"
          style={{ flex: 1, padding: '8px 12px', border: 'var(--border)', borderRadius: 'var(--radius-sm)', fontSize: 13, background: '#fff' }} />
        {['all', 'draft', 'submitted', 'approved'].map(s => (
          <button key={s} onClick={() => setFilter(s)}
            style={{ padding: '7px 14px', borderRadius: 'var(--radius-sm)', fontSize: 12, fontWeight: 500, border: filter === s ? '1.5px solid var(--teal)' : 'var(--border)', background: filter === s ? 'var(--teal-light)' : '#fff', color: filter === s ? 'var(--teal-dark)' : 'var(--gray-600)', cursor: 'pointer' }}>
            {s.charAt(0).toUpperCase() + s.slice(1)}
          </button>
        ))}
      </div>

      <div style={{ background: '#fff', border: 'var(--border)', borderRadius: 'var(--radius)', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: 'var(--gray-50)', borderBottom: 'var(--border)' }}>
              {['Employee', 'Goal', 'Thrust Area', 'Weight', 'Status', 'Actions'].map(h => (
                <th key={h} style={{ padding: '10px 14px', textAlign: 'left', fontSize: 11, fontWeight: 600, color: 'var(--gray-600)' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map((g, i) => (
              <tr key={g.id} style={{ borderBottom: i < filtered.length - 1 ? 'var(--border)' : 'none' }}>
                <td style={{ padding: '11px 14px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <div style={{ width: 26, height: 26, borderRadius: '50%', background: 'var(--teal-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontWeight: 600, color: 'var(--teal-dark)' }}>
                      {g.employee.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                    </div>
                    <div>
                      <div style={{ fontSize: 12, fontWeight: 500 }}>{g.employee.name}</div>
                      <div style={{ fontSize: 10, color: 'var(--gray-400)' }}>{g.employee.department}</div>
                    </div>
                  </div>
                </td>
                <td style={{ padding: '11px 14px', maxWidth: 220 }}>
                  <div style={{ fontSize: 12, fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{g.title}</div>
                  <div style={{ fontSize: 11, color: 'var(--gray-400)' }}>Target: {g.target} · {g.uom}</div>
                </td>
                <td style={{ padding: '11px 14px' }}>
                  <span style={{ fontSize: 11, padding: '2px 8px', borderRadius: 20, background: 'var(--purple-light)', color: 'var(--purple)' }}>{g.thrustArea}</span>
                </td>
                <td style={{ padding: '11px 14px', fontSize: 13, fontWeight: 500 }}>{g.weightage}%</td>
                <td style={{ padding: '11px 14px' }}>
                  <span style={{ fontSize: 11, padding: '2px 8px', borderRadius: 20, fontWeight: 500, background: STATUS_BG[g.status] || 'var(--gray-100)', color: STATUS_COLOR[g.status] || 'var(--gray-600)' }}>{g.status}</span>
                </td>
                <td style={{ padding: '11px 14px' }}>
                  <div style={{ display: 'flex', gap: 6 }}>
                    {g.status === 'submitted' && <button onClick={() => act(g.id, 'approved')} style={{ fontSize: 11, padding: '3px 10px', background: 'var(--teal)', color: '#fff', border: 'none', borderRadius: 'var(--radius-sm)', cursor: 'pointer', fontWeight: 500 }}>Approve</button>}
                    {g.status === 'submitted' && <button onClick={() => act(g.id, 'draft')} style={{ fontSize: 11, padding: '3px 10px', background: 'var(--red-light)', color: 'var(--red)', border: '0.5px solid var(--red)', borderRadius: 'var(--radius-sm)', cursor: 'pointer', fontWeight: 500 }}>Return</button>}
                    {g.status === 'approved' && <button onClick={() => act(g.id, 'draft')} style={{ fontSize: 11, padding: '3px 10px', background: 'var(--amber-light)', color: 'var(--amber)', border: '0.5px solid var(--amber)', borderRadius: 'var(--radius-sm)', cursor: 'pointer', fontWeight: 500 }}>Unlock</button>}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filtered.length === 0 && <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--gray-400)', fontSize: 13 }}>No goals match filter</div>}
      </div>
    </div>
  );
}
