import { useEffect, useState } from 'react';
import api from '../../lib/api';

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [teamRisk, setTeamRisk] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => { api.get('/users/stats').then(r => setStats(r.data)); }, []);

  const runOrgRisk = async () => {
    setLoading(true);
    try { const { data } = await api.get('/ai/team-risk'); setTeamRisk(data); }
    catch { alert('AI service error — check GROQ_API_KEY'); }
    finally { setLoading(false); }
  };

  const HEALTH_COLOR = { healthy: 'var(--teal)', 'needs-attention': 'var(--amber)', critical: 'var(--red)' };
  const HEALTH_BG = { healthy: 'var(--teal-light)', 'needs-attention': 'var(--amber-light)', critical: 'var(--red-light)' };

  return (
    <div style={{ padding: 28 }}>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 20, fontWeight: 600 }}>Admin dashboard</h1>
        <p style={{ fontSize: 13, color: 'var(--gray-600)', marginTop: 3 }}>Organisation-wide view · FY 2025</p>
      </div>

      {stats && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 12, marginBottom: 24 }}>
          {[
            { label: 'Total employees', val: stats.totalEmployees },
            { label: 'Goals submitted', val: stats.goalsSubmitted, color: 'var(--teal)' },
            { label: 'Goals approved', val: stats.goalsApproved, color: 'var(--teal)' },
            { label: 'Pending approval', val: stats.goalsPending, color: stats.goalsPending > 0 ? 'var(--amber)' : 'var(--gray-900)' },
            { label: 'Approval rate', val: `${stats.completionRate}%`, color: stats.completionRate > 70 ? 'var(--teal)' : 'var(--amber)' },
          ].map(s => (
            <div key={s.label} style={{ background: '#fff', border: 'var(--border)', borderRadius: 'var(--radius)', padding: '16px' }}>
              <div style={{ fontSize: 11, color: 'var(--gray-600)', marginBottom: 6 }}>{s.label}</div>
              <div style={{ fontSize: 22, fontWeight: 600, color: s.color || 'var(--gray-900)' }}>{s.val}</div>
            </div>
          ))}
        </div>
      )}

      <div style={{ background: 'var(--purple-light)', border: '0.5px solid var(--purple-mid)', borderRadius: 'var(--radius)', padding: 24 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
          <div style={{ width: 36, height: 36, background: 'var(--purple)', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: 18 }}>◈</div>
          <div>
            <div style={{ fontSize: 15, fontWeight: 600, color: 'var(--purple-text)' }}>Organisation Risk Intelligence</div>
            <div style={{ fontSize: 12, color: 'var(--purple)' }}>AI analysis across all employees · Groq / Llama 3.3 70B</div>
          </div>
          <button onClick={runOrgRisk} disabled={loading} style={{ marginLeft: 'auto', padding: '9px 20px', background: loading ? 'var(--purple-mid)' : 'var(--purple)', color: '#fff', border: 'none', borderRadius: 'var(--radius-sm)', fontWeight: 600, fontSize: 13 }}>
            {loading ? '⟳ Analyzing…' : '◈ Run org risk AI'}
          </button>
        </div>

        {teamRisk && (
          <div style={{ background: HEALTH_BG[teamRisk.teamHealth], borderRadius: 'var(--radius-sm)', padding: 18, border: `0.5px solid ${HEALTH_COLOR[teamRisk.teamHealth]}` }}>
            <div style={{ fontSize: 14, fontWeight: 600, color: HEALTH_COLOR[teamRisk.teamHealth], marginBottom: 10, textTransform: 'capitalize' }}>
              {teamRisk.teamHealth.replace('-', ' ')} · {teamRisk.atRiskCount} employees at risk
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              <div>
                <div style={{ fontSize: 11, fontWeight: 500, color: 'var(--gray-600)', marginBottom: 6 }}>Key insights</div>
                {(teamRisk.insights || []).map((ins, i) => (
                  <div key={i} style={{ fontSize: 12, color: 'var(--gray-700)', display: 'flex', gap: 5, marginBottom: 4 }}><span>•</span>{ins}</div>
                ))}
              </div>
              <div>
                <div style={{ fontSize: 11, fontWeight: 500, color: 'var(--gray-600)', marginBottom: 6 }}>Recommended actions</div>
                {(teamRisk.recommendedActions || []).map((a, i) => (
                  <div key={i} style={{ fontSize: 12, color: HEALTH_COLOR[teamRisk.teamHealth], display: 'flex', gap: 5, marginBottom: 4, fontWeight: 500 }}><span>→</span>{a}</div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
