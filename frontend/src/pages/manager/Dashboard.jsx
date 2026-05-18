import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../lib/api';

export default function ManagerDashboard() {
  const [team, setTeam] = useState([]);
  const [teamRisk, setTeamRisk] = useState(null);
  const [riskLoading, setRiskLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => { api.get('/goals/team').then(r => setTeam(r.data)); }, []);

  const pending = team.flatMap(m => m.goals.filter(g => g.status === 'submitted'));
  const totalGoals = team.flatMap(m => m.goals).length;
  const approvedGoals = team.flatMap(m => m.goals.filter(g => g.status === 'approved')).length;

  const runTeamRisk = async () => {
    setRiskLoading(true);
    try { const { data } = await api.get('/ai/team-risk'); setTeamRisk(data); }
    catch { alert('AI risk analysis failed — check GROQ_API_KEY'); }
    finally { setRiskLoading(false); }
  };

  const HEALTH_COLOR = { healthy: 'var(--teal)', 'needs-attention': 'var(--amber)', critical: 'var(--red)' };
  const HEALTH_BG = { healthy: 'var(--teal-light)', 'needs-attention': 'var(--amber-light)', critical: 'var(--red-light)' };

  return (
    <div style={{ padding: 28 }}>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 20, fontWeight: 600 }}>Team dashboard</h1>
        <p style={{ fontSize: 13, color: 'var(--gray-600)', marginTop: 3 }}>FY 2025 · Q2 Check-in period</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginBottom: 24 }}>
        {[
          { label: 'Team members', val: team.length },
          { label: 'Total goals', val: totalGoals },
          { label: 'Approved', val: approvedGoals, color: 'var(--teal)' },
          { label: 'Pending approval', val: pending.length, color: pending.length > 0 ? 'var(--amber)' : 'var(--gray-900)' },
        ].map(s => (
          <div key={s.label} style={{ background: '#fff', border: 'var(--border)', borderRadius: 'var(--radius)', padding: '16px' }}>
            <div style={{ fontSize: 11, color: 'var(--gray-600)', marginBottom: 6 }}>{s.label}</div>
            <div style={{ fontSize: 24, fontWeight: 600, color: s.color || 'var(--gray-900)' }}>{s.val}</div>
          </div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
        {pending.length > 0 && (
          <div style={{ background: '#fff', border: 'var(--border)', borderRadius: 'var(--radius)', padding: 20 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 14 }}>
              <h2 style={{ fontSize: 14, fontWeight: 600 }}>Pending approvals</h2>
              <button onClick={() => navigate('/manager/approvals')} style={{ fontSize: 12, color: 'var(--teal)', background: 'none', border: 'none', fontWeight: 500 }}>Review all →</button>
            </div>
            {pending.slice(0, 4).map(g => (
              <div key={g.id} style={{ padding: '9px 0', borderBottom: 'var(--border)', display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--amber)', flexShrink: 0 }} />
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 12, fontWeight: 500 }}>{g.title}</div>
                  <div style={{ fontSize: 11, color: 'var(--gray-400)' }}>{g.thrustArea} · {g.weightage}%</div>
                </div>
              </div>
            ))}
          </div>
        )}

        <div style={{ background: 'var(--purple-light)', border: '0.5px solid var(--purple-mid)', borderRadius: 'var(--radius)', padding: 20 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
            <div style={{ width: 32, height: 32, background: 'var(--purple)', borderRadius: 9, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: 16 }}>◈</div>
            <div>
              <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--purple-text)' }}>AI Team Risk Analysis</div>
              <div style={{ fontSize: 11, color: 'var(--purple)' }}>Groq · Llama 3.3 70B</div>
            </div>
          </div>
          <p style={{ fontSize: 12, color: 'var(--purple)', lineHeight: 1.6, marginBottom: 14 }}>
            AI analyzes every team member's goal progress and surfaces who needs your attention this quarter.
          </p>
          <button onClick={runTeamRisk} disabled={riskLoading}
            style={{ padding: '9px 18px', background: riskLoading ? 'var(--purple-mid)' : 'var(--purple)', color: '#fff', border: 'none', borderRadius: 'var(--radius-sm)', fontWeight: 600, fontSize: 13 }}>
            {riskLoading ? '⟳ Analyzing…' : '◈ Run team risk AI'}
          </button>

          {teamRisk && (
            <div style={{ marginTop: 16, background: HEALTH_BG[teamRisk.teamHealth], borderRadius: 'var(--radius-sm)', padding: '12px 14px', border: `0.5px solid ${HEALTH_COLOR[teamRisk.teamHealth]}` }}>
              <div style={{ fontSize: 13, fontWeight: 600, color: HEALTH_COLOR[teamRisk.teamHealth], marginBottom: 6, textTransform: 'capitalize' }}>{teamRisk.teamHealth.replace('-', ' ')} · {teamRisk.atRiskCount} at risk</div>
              {(teamRisk.insights || []).map((ins, i) => (
                <div key={i} style={{ fontSize: 12, color: 'var(--gray-700)', display: 'flex', gap: 5, marginBottom: 3 }}><span>•</span>{ins}</div>
              ))}
              {(teamRisk.recommendedActions || []).map((a, i) => (
                <div key={i} style={{ fontSize: 12, color: HEALTH_COLOR[teamRisk.teamHealth], display: 'flex', gap: 5, marginTop: 5, fontWeight: 500 }}><span>→</span>{a}</div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div style={{ background: '#fff', border: 'var(--border)', borderRadius: 'var(--radius)', padding: 20 }}>
        <h2 style={{ fontSize: 14, fontWeight: 600, marginBottom: 14 }}>Team members</h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {team.map(m => {
            const approved = m.goals.filter(g => g.status === 'approved').length;
            const pending = m.goals.filter(g => g.status === 'submitted').length;
            return (
              <div key={m.user.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 14px', background: 'var(--gray-50)', borderRadius: 'var(--radius-sm)', border: 'var(--border)' }}>
                <div style={{ width: 34, height: 34, borderRadius: '50%', background: 'var(--teal-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 600, color: 'var(--teal-dark)', flexShrink: 0 }}>
                  {m.user.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 13, fontWeight: 500 }}>{m.user.name}</div>
                  <div style={{ fontSize: 11, color: 'var(--gray-400)' }}>{m.user.department} · {m.goals.length} goals</div>
                </div>
                <div style={{ display: 'flex', gap: 6 }}>
                  {approved > 0 && <span style={{ fontSize: 11, padding: '2px 8px', borderRadius: 20, background: 'var(--teal-light)', color: 'var(--teal-dark)', fontWeight: 500 }}>{approved} approved</span>}
                  {pending > 0 && <span style={{ fontSize: 11, padding: '2px 8px', borderRadius: 20, background: 'var(--amber-light)', color: 'var(--amber-text)', fontWeight: 500 }}>{pending} pending</span>}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
