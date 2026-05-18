import { useEffect, useState } from 'react';
import api from '../../lib/api';

const Q_LABELS = { q1: 'Q1', q2: 'Q2', q3: 'Q3', q4: 'Q4' };

export default function TeamGoals() {
  const [team, setTeam] = useState([]);
  const [selected, setSelected] = useState(null);

  useEffect(() => {
    api.get('/goals/team').then(r => { setTeam(r.data); if (r.data.length) setSelected(r.data[0].user.id); });
  }, []);

  const member = team.find(m => m.user.id === selected);

  return (
    <div style={{ padding: 28 }}>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 20, fontWeight: 600 }}>Team goals</h1>
        <p style={{ fontSize: 13, color: 'var(--gray-600)', marginTop: 3 }}>View progress for each team member</p>
      </div>

      <div style={{ display: 'flex', gap: 16 }}>
        <div style={{ width: 200, flexShrink: 0 }}>
          {team.map(m => (
            <div key={m.user.id} onClick={() => setSelected(m.user.id)}
              style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px', borderRadius: 'var(--radius-sm)', cursor: 'pointer', marginBottom: 4, background: selected === m.user.id ? 'var(--teal-light)' : '#fff', border: selected === m.user.id ? '1px solid var(--teal)' : 'var(--border)' }}>
              <div style={{ width: 28, height: 28, borderRadius: '50%', background: 'var(--teal-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontWeight: 600, color: 'var(--teal-dark)', flexShrink: 0 }}>
                {m.user.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
              </div>
              <div>
                <div style={{ fontSize: 12, fontWeight: 500, color: selected === m.user.id ? 'var(--teal-dark)' : 'var(--gray-900)' }}>{m.user.name.split(' ')[0]}</div>
                <div style={{ fontSize: 10, color: 'var(--gray-400)' }}>{m.goals.length} goals</div>
              </div>
            </div>
          ))}
        </div>

        <div style={{ flex: 1 }}>
          {member && (
            <div>
              <div style={{ marginBottom: 16, display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'var(--teal-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 600, color: 'var(--teal-dark)' }}>
                  {member.user.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                </div>
                <div>
                  <div style={{ fontSize: 15, fontWeight: 600 }}>{member.user.name}</div>
                  <div style={{ fontSize: 12, color: 'var(--gray-600)' }}>{member.user.department} · {member.goals.length} goals</div>
                </div>
              </div>

              {member.goals.map(g => (
                <div key={g.id} style={{ background: '#fff', border: 'var(--border)', borderRadius: 'var(--radius)', padding: 18, marginBottom: 12 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
                    <div>
                      <div style={{ fontSize: 13, fontWeight: 600 }}>{g.title}</div>
                      <div style={{ fontSize: 11, color: 'var(--gray-400)', marginTop: 2 }}>{g.thrustArea} · {g.weightage}% weight · Target: {g.target}</div>
                    </div>
                    <span style={{ fontSize: 10, padding: '2px 8px', borderRadius: 20, fontWeight: 500, height: 'fit-content',
                      background: g.status === 'approved' ? 'var(--teal-light)' : 'var(--amber-light)',
                      color: g.status === 'approved' ? 'var(--teal-dark)' : 'var(--amber-text)' }}>
                      {g.status}
                    </span>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 8 }}>
                    {Object.entries(Q_LABELS).map(([q, label]) => {
                      const a = g.achievements[q];
                      const hasData = a !== null && a !== undefined;
                      return (
                        <div key={q} style={{ background: 'var(--gray-50)', borderRadius: 'var(--radius-sm)', padding: '8px 10px', border: 'var(--border)' }}>
                          <div style={{ fontSize: 10, color: 'var(--gray-400)', marginBottom: 3 }}>{label}</div>
                          <div style={{ fontSize: 14, fontWeight: 600, color: hasData ? 'var(--gray-900)' : 'var(--gray-400)' }}>{hasData ? a : '—'}</div>
                          <div style={{ fontSize: 10, color: 'var(--gray-400)', marginTop: 1 }}>{g.checkInStatus[q]}</div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
