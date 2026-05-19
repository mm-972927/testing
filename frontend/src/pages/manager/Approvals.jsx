import { useEffect, useState } from 'react';
import api from '../../lib/api';

const THRUST = ['Technology', 'Delivery', 'Quality', 'Learning & Development', 'People', 'Customer', 'Finance'];
const UOM_LABELS = { percent: '% (higher better)', numeric: 'Number', timeline: 'Timeline/Date', zero: 'Zero-based', max: 'Lower is better' };

export default function Approvals() {
  const [team, setTeam] = useState([]);
  const [acting, setActing] = useState({});
  const [editing, setEditing] = useState(null); // goalId being edited
  const [editForm, setEditForm] = useState({});
  const [saveMsg, setSaveMsg] = useState('');

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

  const startEdit = (g) => {
    setEditing(g.id);
    setEditForm({ title: g.title, description: g.description, thrustArea: g.thrustArea, uom: g.uom, target: g.target, weightage: g.weightage });
    setSaveMsg('');
  };

  const saveEdit = async (goalId) => {
    try {
      await api.put(`/goals/${goalId}`, { ...editForm, target: Number(editForm.target), weightage: Number(editForm.weightage) });
      setSaveMsg('✓ Saved');
      setTimeout(() => { setSaveMsg(''); setEditing(null); load(); }, 800);
    } catch (e) {
      setSaveMsg('❌ ' + (e.response?.data?.error || 'Save failed'));
    }
  };

  const inputStyle = { width: '100%', padding: '7px 10px', border: 'var(--border)', borderRadius: 'var(--radius-sm)', fontSize: 13, background: '#fff', outline: 'none' };
  const labelStyle = { fontSize: 11, fontWeight: 500, color: 'var(--gray-600)', display: 'block', marginBottom: 4 };

  return (
    <div style={{ padding: 28 }}>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 20, fontWeight: 600 }}>Goal approvals</h1>
        <p style={{ fontSize: 13, color: 'var(--gray-600)', marginTop: 3 }}>
          {pending.length} goal{pending.length !== 1 ? 's' : ''} awaiting your review · You can edit before approving
        </p>
      </div>

      {pending.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--gray-400)' }}>
          <div style={{ fontSize: 40, marginBottom: 10 }}>✓</div>
          <div style={{ fontSize: 15, fontWeight: 500 }}>All caught up</div>
          <div style={{ fontSize: 13, marginTop: 4 }}>No pending approvals right now</div>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {pending.map(g => (
            <div key={g.id} style={{ background: '#fff', border: editing === g.id ? '1.5px solid var(--teal)' : 'var(--border)', borderRadius: 'var(--radius)', padding: 22, transition: 'border 0.2s' }}>

              {/* Header */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 14 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div style={{ width: 30, height: 30, borderRadius: '50%', background: 'var(--teal-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 600, color: 'var(--teal-dark)', flexShrink: 0 }}>
                    {g.employee.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                  </div>
                  <div>
                    <div style={{ fontSize: 12, fontWeight: 500, color: 'var(--gray-900)' }}>{g.employee.name}</div>
                    <div style={{ fontSize: 11, color: 'var(--gray-400)' }}>{g.employee.department}</div>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: 8 }}>
                  {editing !== g.id ? (
                    <>
                      <button onClick={() => startEdit(g)}
                        style={{ padding: '7px 14px', background: 'var(--gray-100)', color: 'var(--gray-700)', border: 'var(--border)', borderRadius: 'var(--radius-sm)', fontSize: 12, fontWeight: 500, cursor: 'pointer' }}>
                        ✏️ Edit
                      </button>
                      <button onClick={() => act(g.id, 'draft')} disabled={!!acting[g.id]}
                        style={{ padding: '7px 14px', background: 'var(--red-light)', color: 'var(--red)', border: '0.5px solid var(--red)', borderRadius: 'var(--radius-sm)', fontSize: 12, fontWeight: 500, cursor: 'pointer' }}>
                        Return
                      </button>
                      <button onClick={() => act(g.id, 'approved')} disabled={!!acting[g.id]}
                        style={{ padding: '7px 18px', background: 'var(--teal)', color: '#fff', border: 'none', borderRadius: 'var(--radius-sm)', fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>
                        {acting[g.id] === 'approved' ? 'Approving…' : '✓ Approve'}
                      </button>
                    </>
                  ) : (
                    <>
                      <button onClick={() => setEditing(null)}
                        style={{ padding: '7px 14px', background: 'var(--gray-100)', color: 'var(--gray-700)', border: 'var(--border)', borderRadius: 'var(--radius-sm)', fontSize: 12, cursor: 'pointer' }}>
                        Cancel
                      </button>
                      <button onClick={() => saveEdit(g.id)}
                        style={{ padding: '7px 18px', background: 'var(--purple)', color: '#fff', border: 'none', borderRadius: 'var(--radius-sm)', fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>
                        💾 Save changes
                      </button>
                    </>
                  )}
                </div>
              </div>

              {saveMsg && editing === g.id && (
                <div style={{ marginBottom: 12, padding: '6px 12px', borderRadius: 'var(--radius-sm)', background: saveMsg.startsWith('✓') ? 'var(--teal-light)' : 'var(--red-light)', color: saveMsg.startsWith('✓') ? 'var(--teal-dark)' : 'var(--red)', fontSize: 12, fontWeight: 500 }}>
                  {saveMsg}
                </div>
              )}

              {/* Read view */}
              {editing !== g.id && (
                <div>
                  <div style={{ fontSize: 15, fontWeight: 600, marginBottom: 6 }}>{g.title}</div>
                  {g.description && <p style={{ fontSize: 13, color: 'var(--gray-600)', lineHeight: 1.6, marginBottom: 10 }}>{g.description}</p>}
                  <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                    <span style={{ fontSize: 11, padding: '2px 9px', borderRadius: 20, background: 'var(--purple-light)', color: 'var(--purple)' }}>{g.thrustArea}</span>
                    <span style={{ fontSize: 11, padding: '2px 9px', borderRadius: 20, background: 'var(--gray-100)', color: 'var(--gray-600)' }}>UoM: {UOM_LABELS[g.uom]}</span>
                    <span style={{ fontSize: 11, padding: '2px 9px', borderRadius: 20, background: 'var(--gray-100)', color: 'var(--gray-600)' }}>Target: {g.target}</span>
                    <span style={{ fontSize: 11, padding: '2px 9px', borderRadius: 20, background: 'var(--teal-light)', color: 'var(--teal-dark)', fontWeight: 500 }}>Weight: {g.weightage}%</span>
                  </div>
                </div>
              )}

              {/* Inline edit form */}
              {editing === g.id && (
                <div style={{ background: 'var(--gray-50)', borderRadius: 'var(--radius-sm)', padding: 16, border: 'var(--border)' }}>
                  <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--purple)', marginBottom: 14 }}>✏️ Editing goal — changes save to employee's record</div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 12 }}>
                    <div style={{ gridColumn: '1 / -1' }}>
                      <label style={labelStyle}>Goal title</label>
                      <input value={editForm.title} onChange={e => setEditForm(f => ({ ...f, title: e.target.value }))} style={inputStyle} />
                    </div>
                    <div style={{ gridColumn: '1 / -1' }}>
                      <label style={labelStyle}>Description</label>
                      <textarea value={editForm.description} onChange={e => setEditForm(f => ({ ...f, description: e.target.value }))} rows={2} style={{ ...inputStyle, resize: 'none' }} />
                    </div>
                    <div>
                      <label style={labelStyle}>Thrust area</label>
                      <select value={editForm.thrustArea} onChange={e => setEditForm(f => ({ ...f, thrustArea: e.target.value }))} style={inputStyle}>
                        {THRUST.map(t => <option key={t}>{t}</option>)}
                      </select>
                    </div>
                    <div>
                      <label style={labelStyle}>Unit of measure</label>
                      <select value={editForm.uom} onChange={e => setEditForm(f => ({ ...f, uom: e.target.value }))} style={inputStyle}>
                        {Object.entries(UOM_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                      </select>
                    </div>
                    <div>
                      <label style={labelStyle}>Target</label>
                      <input value={editForm.target} onChange={e => setEditForm(f => ({ ...f, target: e.target.value }))} style={inputStyle} />
                    </div>
                    <div>
                      <label style={labelStyle}>Weightage %</label>
                      <input type="number" min={10} max={100} value={editForm.weightage} onChange={e => setEditForm(f => ({ ...f, weightage: e.target.value }))} style={inputStyle} />
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
