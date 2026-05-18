import { useState } from 'react';
import api from '../../lib/api';

const UOM_LABELS = { percent: '%', numeric: 'Number', timeline: 'Date', zero: 'Zero-based', max: 'Lower is better' };

export default function AIAssistant() {
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [improving, setImproving] = useState(null);
  const [improveForm, setImproveForm] = useState({ title: '', description: '', uom: 'percent', target: '' });
  const [improveResult, setImproveResult] = useState(null);
  const [addingId, setAddingId] = useState(null);
  const [added, setAdded] = useState({});

  const fetchSuggestions = async () => {
    setLoading(true); setError(''); setSuggestions([]);
    try {
      const { data } = await api.post('/ai/suggest-goals');
      setSuggestions(data.suggestions || []);
    } catch (e) {
      setError(e.response?.data?.detail || 'Failed to get suggestions. Make sure GROQ_API_KEY is set.');
    } finally { setLoading(false); }
  };

  const addGoal = async (s) => {
    setAddingId(s.title);
    try {
      await api.post('/goals', { title: s.title, description: s.description, thrustArea: s.thrustArea, uom: s.uom, target: Number(s.target), weightage: s.weightage });
      setAdded(prev => ({ ...prev, [s.title]: true }));
    } catch (e) {
      alert(e.response?.data?.error || 'Failed to add goal');
    } finally { setAddingId(null); }
  };

  const runImprove = async () => {
    setImproving(true); setImproveResult(null);
    try {
      const { data } = await api.post('/ai/improve-goal', improveForm);
      setImproveResult(data);
    } catch { setImproveResult({ error: true }); }
    finally { setImproving(false); }
  };

  return (
    <div style={{ padding: 28, maxWidth: 820 }}>
      <div style={{ marginBottom: 24 }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 7, background: 'var(--purple-light)', color: 'var(--purple)', padding: '4px 12px', borderRadius: 20, fontSize: 11, fontWeight: 500, marginBottom: 10, border: '0.5px solid var(--purple-mid)' }}>✦ AI Feature</div>
        <h1 style={{ fontSize: 20, fontWeight: 600 }}>AI Goal Assistant</h1>
        <p style={{ color: 'var(--gray-600)', marginTop: 4, fontSize: 13 }}>Powered by Groq · Llama 3.3 70B</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 28 }}>
        <div style={{ background: '#fff', border: 'var(--border)', borderRadius: 'var(--radius)', padding: 22 }}>
          <h2 style={{ fontSize: 15, fontWeight: 600, marginBottom: 8 }}>✦ Suggest goals for me</h2>
          <p style={{ fontSize: 13, color: 'var(--gray-600)', marginBottom: 16, lineHeight: 1.6 }}>AI analyzes your role, department, and existing goals to suggest 3 new SMART goals tailored to you.</p>
          <button onClick={fetchSuggestions} disabled={loading}
            style={{ width: '100%', padding: '10px', background: loading ? 'var(--gray-200)' : 'var(--purple)', color: loading ? 'var(--gray-600)' : '#fff', border: 'none', borderRadius: 'var(--radius-sm)', fontWeight: 600, fontSize: 14 }}>
            {loading ? '⟳ Thinking with Groq…' : '✦ Generate suggestions'}
          </button>
          {error && <p style={{ marginTop: 10, color: 'var(--red)', fontSize: 12, background: 'var(--red-light)', padding: '8px 12px', borderRadius: 'var(--radius-sm)' }}>{error}</p>}
        </div>

        <div style={{ background: '#fff', border: 'var(--border)', borderRadius: 'var(--radius)', padding: 22 }}>
          <h2 style={{ fontSize: 15, fontWeight: 600, marginBottom: 8 }}>◎ Improve a goal</h2>
          <p style={{ fontSize: 13, color: 'var(--gray-600)', marginBottom: 14, lineHeight: 1.6 }}>Paste any goal and AI will make it sharper, clearer, and more measurable.</p>
          <input value={improveForm.title} onChange={e => setImproveForm(f => ({ ...f, title: e.target.value }))} placeholder="Goal title" style={{ width: '100%', padding: '8px 10px', border: 'var(--border)', borderRadius: 'var(--radius-sm)', fontSize: 13, marginBottom: 8 }} />
          <textarea value={improveForm.description} onChange={e => setImproveForm(f => ({ ...f, description: e.target.value }))} placeholder="Description (optional)" rows={2} style={{ width: '100%', padding: '8px 10px', border: 'var(--border)', borderRadius: 'var(--radius-sm)', fontSize: 13, marginBottom: 8, resize: 'none' }} />
          <div style={{ display: 'flex', gap: 8, marginBottom: 10 }}>
            <select value={improveForm.uom} onChange={e => setImproveForm(f => ({ ...f, uom: e.target.value }))} style={{ flex: 1, padding: '7px', border: 'var(--border)', borderRadius: 'var(--radius-sm)', fontSize: 13 }}>
              {Object.entries(UOM_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
            </select>
            <input value={improveForm.target} onChange={e => setImproveForm(f => ({ ...f, target: e.target.value }))} placeholder="Target" style={{ width: 90, padding: '7px 10px', border: 'var(--border)', borderRadius: 'var(--radius-sm)', fontSize: 13 }} />
          </div>
          <button onClick={runImprove} disabled={!improveForm.title || improving}
            style={{ width: '100%', padding: '9px', background: improveForm.title ? 'var(--teal)' : 'var(--gray-200)', color: improveForm.title ? '#fff' : 'var(--gray-600)', border: 'none', borderRadius: 'var(--radius-sm)', fontWeight: 600, fontSize: 13 }}>
            {improving ? '⟳ Improving…' : '◎ Improve with AI'}
          </button>
        </div>
      </div>

      {improveResult && !improveResult.error && (
        <div style={{ background: 'var(--teal-light)', border: '0.5px solid var(--teal)', borderRadius: 'var(--radius)', padding: 20, marginBottom: 24 }}>
          <div style={{ fontSize: 12, color: 'var(--teal-dark)', fontWeight: 600, marginBottom: 10 }}>✓ AI improved your goal</div>
          <div style={{ marginBottom: 8 }}>
            <div style={{ fontSize: 11, color: 'var(--gray-600)', marginBottom: 3 }}>Improved title</div>
            <div style={{ fontSize: 14, fontWeight: 500, color: 'var(--gray-900)' }}>{improveResult.improvedTitle}</div>
          </div>
          <div style={{ marginBottom: 10 }}>
            <div style={{ fontSize: 11, color: 'var(--gray-600)', marginBottom: 3 }}>Improved description</div>
            <div style={{ fontSize: 13, color: 'var(--gray-900)', lineHeight: 1.6 }}>{improveResult.improvedDescription}</div>
          </div>
          <div>
            <div style={{ fontSize: 11, color: 'var(--gray-600)', marginBottom: 5 }}>Tips</div>
            {(improveResult.suggestions || []).map((s, i) => (
              <div key={i} style={{ fontSize: 12, color: 'var(--teal-text)', display: 'flex', gap: 6, marginBottom: 4 }}>
                <span>→</span><span>{s}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {suggestions.length > 0 && (
        <div>
          <h2 style={{ fontSize: 15, fontWeight: 600, marginBottom: 14 }}>✦ AI suggestions for you</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {suggestions.map((s, i) => (
              <div key={i} style={{ background: '#fff', border: 'var(--border)', borderRadius: 'var(--radius)', padding: 20 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12, marginBottom: 10 }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--gray-900)', marginBottom: 4 }}>{s.title}</div>
                    <div style={{ fontSize: 12, color: 'var(--gray-600)', lineHeight: 1.5 }}>{s.description}</div>
                  </div>
                  <button onClick={() => addGoal(s)} disabled={!!added[s.title] || addingId === s.title}
                    style={{ padding: '7px 16px', background: added[s.title] ? 'var(--teal-light)' : 'var(--teal)', color: added[s.title] ? 'var(--teal-dark)' : '#fff', border: added[s.title] ? '1px solid var(--teal)' : 'none', borderRadius: 'var(--radius-sm)', fontSize: 12, fontWeight: 600, flexShrink: 0 }}>
                    {added[s.title] ? '✓ Added' : addingId === s.title ? '…' : '+ Add goal'}
                  </button>
                </div>
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                  <span style={{ fontSize: 11, padding: '2px 9px', borderRadius: 20, background: 'var(--purple-light)', color: 'var(--purple)', fontWeight: 500 }}>{s.thrustArea}</span>
                  <span style={{ fontSize: 11, padding: '2px 9px', borderRadius: 20, background: 'var(--gray-100)', color: 'var(--gray-600)' }}>UoM: {UOM_LABELS[s.uom]}</span>
                  <span style={{ fontSize: 11, padding: '2px 9px', borderRadius: 20, background: 'var(--gray-100)', color: 'var(--gray-600)' }}>Target: {s.target}</span>
                  <span style={{ fontSize: 11, padding: '2px 9px', borderRadius: 20, background: 'var(--teal-light)', color: 'var(--teal-dark)', fontWeight: 500 }}>Weight: {s.weightage}%</span>
                </div>
                <div style={{ marginTop: 10, padding: '8px 12px', background: 'var(--gray-100)', borderRadius: 'var(--radius-sm)', fontSize: 12, color: 'var(--gray-600)', borderLeft: '3px solid var(--purple)' }}>
                  <strong style={{ color: 'var(--purple)' }}>Why this goal:</strong> {s.rationale}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
