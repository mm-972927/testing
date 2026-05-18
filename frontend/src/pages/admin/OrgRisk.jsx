import { useState } from 'react';
import api from '../../lib/api';

const HEALTH_COLOR = { healthy: 'var(--teal)', 'needs-attention': 'var(--amber)', critical: 'var(--red)' };
const HEALTH_BG = { healthy: 'var(--teal-light)', 'needs-attention': 'var(--amber-light)', critical: 'var(--red-light)' };

export default function OrgRisk() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const run = async () => {
    setLoading(true); setError(''); setData(null);
    try { const { data: d } = await api.get('/ai/team-risk'); setData(d); }
    catch (e) { setError(e.response?.data?.detail || 'AI service error — check GROQ_API_KEY'); }
    finally { setLoading(false); }
  };

  return (
    <div style={{ padding: 28, maxWidth: 820 }}>
      <div style={{ marginBottom: 24 }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 7, background: 'var(--purple-light)', color: 'var(--purple)', padding: '4px 12px', borderRadius: 20, fontSize: 11, fontWeight: 500, marginBottom: 10, border: '0.5px solid var(--purple-mid)' }}>◈ AI Feature</div>
        <h1 style={{ fontSize: 20, fontWeight: 600 }}>Organisation Risk AI</h1>
        <p style={{ color: 'var(--gray-600)', marginTop: 4, fontSize: 13 }}>AI analysis across all employees · Groq / Llama 3.3 70B</p>
      </div>

      <div style={{ background: '#fff', border: 'var(--border)', borderRadius: 'var(--radius)', padding: 24, marginBottom: 24 }}>
        <p style={{ fontSize: 13, color: 'var(--gray-600)', lineHeight: 1.6, marginBottom: 16 }}>
          AI aggregates all goal progress data across the organisation, identifies systemic risks, and recommends strategic actions for HR and leadership.
        </p>
        <button onClick={run} disabled={loading}
          style={{ padding: '11px 28px', background: loading ? 'var(--gray-200)' : 'var(--purple)', color: loading ? 'var(--gray-600)' : '#fff', border: 'none', borderRadius: 'var(--radius-sm)', fontWeight: 600, fontSize: 14 }}>
          {loading ? '⟳ Analyzing organisation…' : '◈ Run org risk analysis'}
        </button>
        {error && <p style={{ marginTop: 12, color: 'var(--red)', fontSize: 12, background: 'var(--red-light)', padding: '8px 12px', borderRadius: 'var(--radius-sm)' }}>{error}</p>}
      </div>

      {data && (
        <div>
          <div style={{ background: HEALTH_BG[data.teamHealth] || 'var(--gray-100)', border: `1px solid ${HEALTH_COLOR[data.teamHealth] || 'var(--gray-400)'}`, borderRadius: 'var(--radius)', padding: 24, marginBottom: 20 }}>
            <div style={{ fontSize: 18, fontWeight: 700, color: HEALTH_COLOR[data.teamHealth], marginBottom: 4, textTransform: 'capitalize' }}>
              {data.teamHealth?.replace('-', ' ')}
            </div>
            <div style={{ fontSize: 13, color: 'var(--gray-700)' }}>{data.atRiskCount} employee{data.atRiskCount !== 1 ? 's' : ''} at risk across the organisation</div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <div style={{ background: '#fff', border: 'var(--border)', borderRadius: 'var(--radius)', padding: 20 }}>
              <h2 style={{ fontSize: 14, fontWeight: 600, marginBottom: 12 }}>Key insights</h2>
              {(data.insights || []).map((ins, i) => (
                <div key={i} style={{ display: 'flex', gap: 8, marginBottom: 10, padding: '8px 12px', background: 'var(--gray-50)', borderRadius: 'var(--radius-sm)' }}>
                  <span style={{ color: 'var(--purple)', fontWeight: 700, flexShrink: 0 }}>•</span>
                  <span style={{ fontSize: 13, color: 'var(--gray-700)', lineHeight: 1.5 }}>{ins}</span>
                </div>
              ))}
            </div>
            <div style={{ background: '#fff', border: 'var(--border)', borderRadius: 'var(--radius)', padding: 20 }}>
              <h2 style={{ fontSize: 14, fontWeight: 600, marginBottom: 12 }}>Recommended actions</h2>
              {(data.recommendedActions || []).map((a, i) => (
                <div key={i} style={{ display: 'flex', gap: 8, marginBottom: 10, padding: '8px 12px', background: 'var(--teal-light)', borderRadius: 'var(--radius-sm)', border: '0.5px solid var(--teal)' }}>
                  <span style={{ color: 'var(--teal)', fontWeight: 700, flexShrink: 0 }}>→</span>
                  <span style={{ fontSize: 13, color: 'var(--teal-text)', lineHeight: 1.5 }}>{a}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
