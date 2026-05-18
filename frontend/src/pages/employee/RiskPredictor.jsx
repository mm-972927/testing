import { useState } from 'react';
import api from '../../lib/api';

const RISK_COLOR = { 'on-track': 'var(--teal)', 'at-risk': 'var(--amber)', 'critical': 'var(--red)' };
const RISK_BG = { 'on-track': 'var(--teal-light)', 'at-risk': 'var(--amber-light)', 'critical': 'var(--red-light)' };
const RISK_LABEL = { 'on-track': '✓ On track', 'at-risk': '⚠ At risk', 'critical': '✕ Critical' };

export default function RiskPredictor() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const run = async () => {
    setLoading(true); setError(''); setData(null);
    try {
      const { data: d } = await api.get('/ai/predict-risk');
      setData(d);
    } catch (e) {
      setError(e.response?.data?.detail || 'AI prediction failed. Ensure GROQ_API_KEY is configured.');
    } finally { setLoading(false); }
  };

  return (
    <div style={{ padding: 28, maxWidth: 820 }}>
      <div style={{ marginBottom: 24 }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 7, background: 'var(--amber-light)', color: 'var(--amber)', padding: '4px 12px', borderRadius: 20, fontSize: 11, fontWeight: 500, marginBottom: 10, border: '0.5px solid #FAC775' }}>◈ AI Feature</div>
        <h1 style={{ fontSize: 20, fontWeight: 600 }}>Risk Predictor</h1>
        <p style={{ color: 'var(--gray-600)', marginTop: 4, fontSize: 13 }}>AI forecasts your year-end achievement based on Q1 & Q2 progress · Groq / Llama 3.3 70B</p>
      </div>

      <div style={{ background: '#fff', border: 'var(--border)', borderRadius: 'var(--radius)', padding: 24, marginBottom: 24 }}>
        <h2 style={{ fontSize: 15, fontWeight: 600, marginBottom: 8 }}>How it works</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 14, marginBottom: 18 }}>
          {['Reads your Q1 & Q2 actuals vs targets', 'Models trajectory using goal type & weightage', 'Flags at-risk goals with specific actions'].map((t, i) => (
            <div key={i} style={{ padding: '12px 14px', background: 'var(--gray-50)', borderRadius: 'var(--radius-sm)', border: 'var(--border)' }}>
              <div style={{ fontSize: 18, fontWeight: 700, color: 'var(--amber)', marginBottom: 4 }}>0{i + 1}</div>
              <div style={{ fontSize: 12, color: 'var(--gray-600)', lineHeight: 1.5 }}>{t}</div>
            </div>
          ))}
        </div>
        <button onClick={run} disabled={loading}
          style={{ padding: '11px 28px', background: loading ? 'var(--gray-200)' : 'var(--amber)', color: loading ? 'var(--gray-600)' : '#fff', border: 'none', borderRadius: 'var(--radius-sm)', fontWeight: 600, fontSize: 14 }}>
          {loading ? '⟳ Analyzing with Groq…' : '◈ Run risk prediction'}
        </button>
        {error && <p style={{ marginTop: 12, color: 'var(--red)', fontSize: 12, background: 'var(--red-light)', padding: '8px 12px', borderRadius: 'var(--radius-sm)' }}>{error}</p>}
      </div>

      {data && (
        <div>
          <div style={{ background: RISK_BG[data.overallRisk], border: `1px solid ${RISK_COLOR[data.overallRisk]}`, borderRadius: 'var(--radius)', padding: 20, marginBottom: 20, display: 'flex', alignItems: 'center', gap: 16 }}>
            <div style={{ fontSize: 40, fontWeight: 700, color: RISK_COLOR[data.overallRisk], minWidth: 70 }}>{data.overallScore}%</div>
            <div>
              <div style={{ fontSize: 16, fontWeight: 600, color: RISK_COLOR[data.overallRisk] }}>{RISK_LABEL[data.overallRisk]}</div>
              <div style={{ fontSize: 13, color: 'var(--gray-700)', marginTop: 3 }}>{data.summary}</div>
            </div>
          </div>

          <h2 style={{ fontSize: 14, fontWeight: 600, marginBottom: 12 }}>Goal-level predictions</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {(data.goals || []).map((g, i) => (
              <div key={i} style={{ background: '#fff', border: `0.5px solid ${RISK_COLOR[g.risk]}`, borderRadius: 'var(--radius)', padding: 18 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 4 }}>{g.title}</div>
                    <div style={{ fontSize: 12, color: 'var(--gray-600)' }}>{g.reason}</div>
                  </div>
                  <div style={{ textAlign: 'right', flexShrink: 0, marginLeft: 16 }}>
                    <div style={{ fontSize: 22, fontWeight: 700, color: RISK_COLOR[g.risk] }}>{g.predictedAchievement}%</div>
                    <span style={{ fontSize: 10, padding: '2px 8px', borderRadius: 20, background: RISK_BG[g.risk], color: RISK_COLOR[g.risk], fontWeight: 600 }}>{RISK_LABEL[g.risk]}</span>
                  </div>
                </div>
                <div style={{ background: 'var(--gray-50)', borderRadius: 'var(--radius-sm)', padding: '8px 12px', fontSize: 12, color: 'var(--gray-700)', borderLeft: `3px solid ${RISK_COLOR[g.risk]}` }}>
                  <strong>Recommendation:</strong> {g.recommendation}
                </div>
                <div style={{ marginTop: 10, height: 6, background: 'var(--gray-100)', borderRadius: 3, overflow: 'hidden' }}>
                  <div style={{ height: '100%', width: `${Math.min(g.predictedAchievement, 100)}%`, background: RISK_COLOR[g.risk], borderRadius: 3, transition: 'width 0.6s ease' }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
