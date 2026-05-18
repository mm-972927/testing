import { useState, useEffect } from 'react';
import api from '../../lib/api';

const UOM = ['percent', 'numeric', 'timeline', 'zero', 'max'];
const UOM_LABELS = { percent: '% (higher better)', numeric: 'Number (higher better)', timeline: 'Timeline/Date', zero: 'Zero-based', max: 'Lower is better' };
const THRUST = ['Technology', 'Delivery', 'Quality', 'Learning & Development', 'People', 'Customer', 'Finance'];
const Q_WINDOWS = ['q1', 'q2', 'q3', 'q4'];
const Q_LABELS = { q1: 'Q1 Jul', q2: 'Q2 Oct', q3: 'Q3 Jan', q4: 'Q4 Apr' };

function score(g, q) {
  const a = g.achievements[q];
  if (a === null || a === undefined) return null;
  if (g.uom === 'percent' || g.uom === 'numeric') return Math.min(100, Math.round((a / g.target) * 100));
  if (g.uom === 'max') return Math.min(100, Math.round((g.target / Math.max(a, 0.01)) * 100));
  if (g.uom === 'zero') return a === 0 ? 100 : 0;
  return 100;
}

export default function Goals() {
  const [goals, setGoals] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ title: '', description: '', thrustArea: 'Technology', uom: 'percent', target: '', weightage: '' });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [updating, setUpdating] = useState({});

  const load = () => api.get('/goals').then(r => setGoals(r.data));
  useEffect(() => { load(); }, []);

  const totalWeight = goals.reduce((s, g) => s + g.weightage, 0);

  const submit = async (e) => {
    e.preventDefault(); setSaving(true); setError('');
    try {
      await api.post('/goals', { ...form, target: Number(form.target), weightage: Number(form.weightage) });
      setForm({ title: '', description: '', thrustArea: 'Technology', uom: 'percent', target: '', weightage: '' });
      setShowForm(false); load();
    } catch (err) { setError(err.response?.data?.error || 'Failed to save'); }
    finally { setSaving(false); }
  };

  const submitAll = async () => {
    try { await api.post('/goals/submit-all'); load(); }
    catch (err) { alert(err.response?.data?.error || 'Cannot submit'); }
  };

  const updateAchievement = async (goal, q, val) => {
    const key = `${goal.id}-${q}`;
    setUpdating(u => ({ ...u, [key]: true }));
    try {
      await api.put(`/goals/${goal.id}`, { achievements: { ...goal.achievements, [q]: Number(val) } });
      load();
    } finally { setUpdating(u => ({ ...u, [key]: false })); }
  };

  const deleteGoal = async (id) => {
    if (!confirm('Delete this goal?')) return;
    await api.delete(`/goals/${id}`); load();
  };

  return (
    <div style={{ padding: 28 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24 }}>
        <div>
          <h1 style={{ fontSize: 20, fontWeight: 600 }}>My goals</h1>
          <p style={{ fontSize: 13, color: 'var(--gray-600)', marginTop: 3 }}>
            {goals.length}/8 goals · Weightage: <strong style={{ color: totalWeight === 100 ? 'var(--teal)' : totalWeight > 100 ? 'var(--red)' : 'var(--amber)' }}>{totalWeight}%</strong> / 100%
          </p>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          {goals.some(g => g.status === 'draft') && (
            <button onClick={submitAll} style={{ padding: '8px 16px', background: 'var(--teal-light)', color: 'var(--teal-dark)', border: '1px solid var(--teal)', borderRadius: 'var(--radius-sm)', fontWeight: 500, fontSize: 13 }}>
              Submit all for approval
            </button>
          )}
          <button onClick={() => setShowForm(!showForm)} style={{ padding: '8px 16px', background: 'var(--teal)', color: '#fff', border: 'none', borderRadius: 'var(--radius-sm)', fontWeight: 600, fontSize: 13 }}>
            + Add goal
          </button>
        </div>
      </div>

      {showForm && (
        <div style={{ background: '#fff', border: 'var(--border)', borderRadius: 'var(--radius)', padding: 22, marginBottom: 20 }}>
          <h2 style={{ fontSize: 14, fontWeight: 600, marginBottom: 16 }}>New goal</h2>
          <form onSubmit={submit}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 12 }}>
              <div>
                <label style={{ fontSize: 11, fontWeight: 500, color: 'var(--gray-600)', display: 'block', marginBottom: 4 }}>Goal title *</label>
                <input value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} required placeholder="e.g. Increase sales revenue by 20%" style={{ width: '100%', padding: '8px 10px', border: 'var(--border)', borderRadius: 'var(--radius-sm)', fontSize: 13 }} />
              </div>
              <div>
                <label style={{ fontSize: 11, fontWeight: 500, color: 'var(--gray-600)', display: 'block', marginBottom: 4 }}>Thrust area *</label>
                <select value={form.thrustArea} onChange={e => setForm(f => ({ ...f, thrustArea: e.target.value }))} style={{ width: '100%', padding: '8px 10px', border: 'var(--border)', borderRadius: 'var(--radius-sm)', fontSize: 13 }}>
                  {THRUST.map(t => <option key={t}>{t}</option>)}
                </select>
              </div>
            </div>
            <div style={{ marginBottom: 12 }}>
              <label style={{ fontSize: 11, fontWeight: 500, color: 'var(--gray-600)', display: 'block', marginBottom: 4 }}>Description</label>
              <textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} rows={2} placeholder="What does success look like?" style={{ width: '100%', padding: '8px 10px', border: 'var(--border)', borderRadius: 'var(--radius-sm)', fontSize: 13, resize: 'none' }} />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12, marginBottom: 16 }}>
              <div>
                <label style={{ fontSize: 11, fontWeight: 500, color: 'var(--gray-600)', display: 'block', marginBottom: 4 }}>Unit of measure *</label>
                <select value={form.uom} onChange={e => setForm(f => ({ ...f, uom: e.target.value }))} style={{ width: '100%', padding: '8px 10px', border: 'var(--border)', borderRadius: 'var(--radius-sm)', fontSize: 13 }}>
                  {UOM.map(u => <option key={u} value={u}>{UOM_LABELS[u]}</option>)}
                </select>
              </div>
              <div>
                <label style={{ fontSize: 11, fontWeight: 500, color: 'var(--gray-600)', display: 'block', marginBottom: 4 }}>Target *</label>
                <input value={form.target} onChange={e => setForm(f => ({ ...f, target: e.target.value }))} required placeholder={form.uom === 'timeline' ? '2025-09-30' : '50'} style={{ width: '100%', padding: '8px 10px', border: 'var(--border)', borderRadius: 'var(--radius-sm)', fontSize: 13 }} />
              </div>
              <div>
                <label style={{ fontSize: 11, fontWeight: 500, color: 'var(--gray-600)', display: 'block', marginBottom: 4 }}>Weightage % (min 10%) *</label>
                <input value={form.weightage} onChange={e => setForm(f => ({ ...f, weightage: e.target.value }))} required type="number" min={10} max={100} placeholder="20" style={{ width: '100%', padding: '8px 10px', border: 'var(--border)', borderRadius: 'var(--radius-sm)', fontSize: 13 }} />
              </div>
            </div>
            {error && <p style={{ color: 'var(--red)', fontSize: 12, marginBottom: 10 }}>{error}</p>}
            <div style={{ display: 'flex', gap: 8 }}>
              <button type="submit" disabled={saving} style={{ padding: '8px 20px', background: 'var(--teal)', color: '#fff', border: 'none', borderRadius: 'var(--radius-sm)', fontWeight: 600, fontSize: 13 }}>
                {saving ? 'Saving…' : 'Save goal'}
              </button>
              <button type="button" onClick={() => setShowForm(false)} style={{ padding: '8px 16px', background: 'none', border: 'var(--border)', borderRadius: 'var(--radius-sm)', fontSize: 13, color: 'var(--gray-600)' }}>
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {goals.map(g => (
          <div key={g.id} style={{ background: '#fff', border: 'var(--border)', borderRadius: 'var(--radius)', padding: 20 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                  <span style={{ fontSize: 14, fontWeight: 600 }}>{g.title}</span>
                  <span style={{ fontSize: 10, padding: '2px 8px', borderRadius: 20, fontWeight: 500, background: g.status === 'approved' ? 'var(--teal-light)' : g.status === 'submitted' ? 'var(--amber-light)' : 'var(--gray-100)', color: g.status === 'approved' ? 'var(--teal-dark)' : g.status === 'submitted' ? 'var(--amber-text)' : 'var(--gray-600)' }}>
                    {g.status}
                  </span>
                </div>
                <div style={{ fontSize: 12, color: 'var(--gray-600)' }}>{g.thrustArea} · Target: {g.target} · {g.weightage}%</div>
              </div>
              {g.status === 'draft' && (
                <button onClick={() => deleteGoal(g.id)} style={{ color: 'var(--red)', background: 'none', border: 'none', fontSize: 18, cursor: 'pointer', padding: '0 4px' }}>×</button>
              )}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8 }}>
              {Q_WINDOWS.map(q => {
                const s = score(g, q);
                const key = `${g.id}-${q}`;
                return (
                  <div key={q} style={{ background: 'var(--gray-50)', borderRadius: 'var(--radius-sm)', padding: '10px 12px', border: 'var(--border)' }}>
                    <div style={{ fontSize: 10, color: 'var(--gray-400)', fontWeight: 500, marginBottom: 4 }}>{Q_LABELS[q]}</div>
                    {g.status === 'approved' ? (
                      <input type="number" defaultValue={g.achievements[q] ?? ''} placeholder="Actual"
                        onBlur={e => { if (e.target.value !== String(g.achievements[q] ?? '')) updateAchievement(g, q, e.target.value); }}
                        style={{ width: '100%', padding: '4px 6px', border: 'var(--border)', borderRadius: 4, fontSize: 12, background: '#fff' }} />
                    ) : (
                      <div style={{ fontSize: 13, color: 'var(--gray-400)', fontStyle: 'italic' }}>—</div>
                    )}
                    {s !== null && (
                      <div style={{ marginTop: 4 }}>
                        <div style={{ height: 3, background: 'var(--gray-200)', borderRadius: 2 }}>
                          <div style={{ height: '100%', width: `${Math.min(s, 100)}%`, background: s >= 70 ? 'var(--teal)' : s >= 50 ? 'var(--amber)' : 'var(--red)', borderRadius: 2 }} />
                        </div>
                        <div style={{ fontSize: 10, fontWeight: 600, marginTop: 2, color: s >= 70 ? 'var(--teal)' : s >= 50 ? 'var(--amber)' : 'var(--red)' }}>{s}%</div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        ))}
        {goals.length === 0 && (
          <div style={{ textAlign: 'center', padding: '48px 0', color: 'var(--gray-400)' }}>
            <div style={{ fontSize: 32, marginBottom: 8 }}>◎</div>
            <div style={{ fontSize: 14, marginBottom: 4 }}>No goals yet</div>
            <div style={{ fontSize: 12 }}>Click "Add goal" or use the AI Assistant to get started</div>
          </div>
        )}
      </div>
    </div>
  );
}
