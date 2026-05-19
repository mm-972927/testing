import { useEffect, useState } from 'react';
import api from '../../lib/api';

const Q_LABELS = { q1: 'Q1 Jul', q2: 'Q2 Oct', q3: 'Q3 Jan', q4: 'Q4 Apr' };
const STATUS_OPTS = ['Not Started','On Track','Completed'];

function score(g, q) {
  const a = g.achievements[q];
  if (a === null || a === undefined) return null;
  if (g.uom === 'percent' || g.uom === 'numeric') return Math.min(100, Math.round((a / g.target) * 100));
  if (g.uom === 'max') return a === 0 ? 100 : Math.min(100, Math.round((g.target / a) * 100));
  if (g.uom === 'zero') return a === 0 ? 100 : 0;
  return 100;
}

export default function TeamGoals() {
  const [team, setTeam] = useState([]);
  const [selected, setSelected] = useState(null);
  const [saving, setSaving] = useState({});
  const [comments, setComments] = useState({});

  const load = () => api.get('/goals/team').then(r => {
    setTeam(r.data);
    if (r.data.length && !selected) setSelected(r.data[0].user.id);
  });
  useEffect(() => { load(); }, []);

  const member = team.find(m => m.user.id === selected);

  const saveComment = async (goalId, q, comment) => {
    const key = `${goalId}-${q}`;
    setSaving(s => ({ ...s, [key]: true }));
    const goal = member.goals.find(g => g.id === goalId);
    try {
      await api.put(`/goals/${goalId}`, {
        checkInComments: { ...goal.checkInComments, [q]: comment }
      });
      load();
    } finally { setSaving(s => ({ ...s, [key]: false })); }
  };

  const saveStatus = async (goalId, q, status) => {
    const goal = member?.goals.find(g => g.id === goalId);
    if (!goal) return;
    await api.put(`/goals/${goalId}`, { checkInStatus: { ...goal.checkInStatus, [q]: status } });
    load();
  };

  return (
    <div style={{ padding: 28 }}>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 20, fontWeight: 600 }}>Team goals & check-ins</h1>
        <p style={{ fontSize: 13, color: 'var(--gray-600)', marginTop: 3 }}>View progress and add quarterly check-in comments</p>
      </div>

      <div style={{ display: 'flex', gap: 16 }}>
        {/* Member list */}
        <div style={{ width: 190, flexShrink: 0 }}>
          <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--gray-400)', textTransform: 'uppercase', letterSpacing: '.5px', marginBottom: 8 }}>Team members</div>
          {team.map(m => (
            <div key={m.user.id} onClick={() => setSelected(m.user.id)}
              style={{ display: 'flex', alignItems: 'center', gap: 9, padding: '9px 11px', borderRadius: 'var(--radius-sm)', cursor: 'pointer', marginBottom: 4, background: selected === m.user.id ? 'var(--teal-light)' : '#fff', border: selected === m.user.id ? '1px solid var(--teal)' : 'var(--border)' }}>
              <div style={{ width: 28, height: 28, borderRadius: '50%', background: 'var(--teal-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontWeight: 700, color: 'var(--teal-dark)', flexShrink: 0 }}>
                {m.user.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
              </div>
              <div style={{ minWidth: 0 }}>
                <div style={{ fontSize: 12, fontWeight: 500, color: selected === m.user.id ? 'var(--teal-dark)' : 'var(--gray-900)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{m.user.name.split(' ')[0]}</div>
                <div style={{ fontSize: 10, color: 'var(--gray-400)' }}>{m.goals.filter(g=>g.status==='approved').length} active goals</div>
              </div>
            </div>
          ))}
        </div>

        {/* Goal detail */}
        <div style={{ flex: 1 }}>
          {member && (
            <>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 18, padding: '12px 16px', background: '#fff', border: 'var(--border)', borderRadius: 'var(--radius)' }}>
                <div style={{ width: 38, height: 38, borderRadius: '50%', background: 'var(--teal-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 700, color: 'var(--teal-dark)' }}>
                  {member.user.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                </div>
                <div>
                  <div style={{ fontSize: 15, fontWeight: 600 }}>{member.user.name}</div>
                  <div style={{ fontSize: 12, color: 'var(--gray-600)' }}>{member.user.department} · {member.goals.length} goals total · {member.goals.filter(g=>g.status==='approved').length} approved</div>
                </div>
              </div>

              {member.goals.filter(g => g.status === 'approved').length === 0 && (
                <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--gray-400)', fontSize: 13 }}>No approved goals yet</div>
              )}

              {member.goals.filter(g => g.status === 'approved').map(g => (
                <div key={g.id} style={{ background: '#fff', border: 'var(--border)', borderRadius: 'var(--radius)', padding: 18, marginBottom: 14 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 14 }}>
                    <div>
                      <div style={{ fontSize: 14, fontWeight: 600 }}>{g.title}</div>
                      <div style={{ fontSize: 11, color: 'var(--gray-400)', marginTop: 2 }}>{g.thrustArea} · {g.weightage}% weight · Target: {g.target} ({g.uom})</div>
                    </div>
                    {g.isShared && <span style={{ fontSize: 10, padding: '2px 9px', borderRadius: 20, background: 'var(--purple-light)', color: 'var(--purple)', fontWeight: 500, height: 'fit-content' }}>Shared KPI</span>}
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 10 }}>
                    {Object.entries(Q_LABELS).map(([q, label]) => {
                      const a = g.achievements[q];
                      const s = score(g, q);
                      const commentKey = `${g.id}-${q}`;
                      const localComment = comments[commentKey] ?? g.checkInComments?.[q] ?? '';
                      return (
                        <div key={q} style={{ background: 'var(--gray-50)', borderRadius: 'var(--radius-sm)', padding: '10px 12px', border: 'var(--border)' }}>
                          <div style={{ fontSize: 10, fontWeight: 600, color: 'var(--gray-400)', marginBottom: 6 }}>{label}</div>
                          {/* Actual value */}
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 6 }}>
                            <div>
                              <div style={{ fontSize: 11, color: 'var(--gray-600)' }}>Actual</div>
                              <div style={{ fontSize: 16, fontWeight: 600, color: a !== null && a !== undefined ? 'var(--gray-900)' : 'var(--gray-400)' }}>{a !== null && a !== undefined ? a : '—'}</div>
                            </div>
                            {s !== null && (
                              <div style={{ fontSize: 14, fontWeight: 700, color: s >= 80 ? 'var(--teal)' : s >= 50 ? 'var(--amber)' : 'var(--red)' }}>{s}%</div>
                            )}
                          </div>
                          {/* Progress bar */}
                          {s !== null && (
                            <div style={{ height: 4, background: 'var(--gray-200)', borderRadius: 2, marginBottom: 8 }}>
                              <div style={{ height: '100%', width: `${Math.min(s,100)}%`, background: s>=80?'var(--teal)':s>=50?'var(--amber)':'var(--red)', borderRadius: 2 }} />
                            </div>
                          )}
                          {/* Status selector */}
                          <select value={g.checkInStatus[q]} onChange={e => saveStatus(g.id, q, e.target.value)}
                            style={{ width: '100%', fontSize: 10, padding: '3px 4px', border: 'var(--border)', borderRadius: 4, background: '#fff', marginBottom: 6 }}>
                            {STATUS_OPTS.map(o => <option key={o}>{o}</option>)}
                          </select>
                          {/* Manager check-in comment */}
                          <textarea
                            value={localComment}
                            onChange={e => setComments(c => ({ ...c, [commentKey]: e.target.value }))}
                            onBlur={e => { if (e.target.value !== (g.checkInComments?.[q] ?? '')) saveComment(g.id, q, e.target.value); }}
                            placeholder="Add check-in comment…"
                            rows={2}
                            style={{ width: '100%', fontSize: 10, padding: '4px 6px', border: 'var(--border)', borderRadius: 4, resize: 'none', background: '#fff', color: 'var(--gray-700)' }}
                          />
                          {saving[commentKey] && <div style={{ fontSize: 9, color: 'var(--teal)', marginTop: 2 }}>Saving…</div>}
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
