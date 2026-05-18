import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import api from '../../lib/api';

const Q_LABELS = { q1: 'Q1 (Jul)', q2: 'Q2 (Oct)', q3: 'Q3 (Jan)', q4: 'Q4 (Apr)' };
const STATUS_COLOR = { 'Completed': 'var(--teal)', 'On Track': 'var(--amber)', 'Not Started': 'var(--gray-400)' };

function scoreGoal(g, q) {
  const a = g.achievements[q];
  if (a === null || a === undefined) return null;
  if (g.uom === 'percent' || g.uom === 'numeric') return Math.min(100, Math.round((a / g.target) * 100));
  if (g.uom === 'max') return Math.min(100, Math.round((g.target / Math.max(a, 0.01)) * 100));
  if (g.uom === 'zero') return a === 0 ? 100 : 0;
  return 100;
}

export default function EmployeeDashboard() {
  const { user } = useAuth();
  const [goals, setGoals] = useState([]);
  const navigate = useNavigate();

  useEffect(() => { api.get('/goals').then(r => setGoals(r.data)); }, []);

  const approved = goals.filter(g => g.status === 'approved');
  const totalWeight = goals.reduce((s, g) => s + g.weightage, 0);
  const q2Scores = approved.map(g => scoreGoal(g, 'q2')).filter(s => s !== null);
  const avgScore = q2Scores.length ? Math.round(q2Scores.reduce((a, b) => a + b, 0) / q2Scores.length) : 0;

  return (
    <div style={{ padding: 28 }}>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 20, fontWeight: 600 }}>Good morning, {user?.name?.split(' ')[0]} 👋</h1>
        <p style={{ color: 'var(--gray-600)', marginTop: 3, fontSize: 13 }}>FY 2025 · Q2 Check-in period is open</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginBottom: 24 }}>
        {[
          { label: 'Total goals', val: goals.length, sub: `of 8 max`, c: 'var(--gray-900)' },
          { label: 'Approved', val: approved.length, sub: 'locked & active', c: 'var(--teal)' },
          { label: 'Weightage used', val: `${totalWeight}%`, sub: totalWeight === 100 ? '✓ Complete' : `${100 - totalWeight}% remaining`, c: totalWeight === 100 ? 'var(--teal)' : 'var(--amber)' },
          { label: 'Avg Q2 score', val: `${avgScore}%`, sub: 'across approved goals', c: avgScore >= 70 ? 'var(--teal)' : avgScore >= 50 ? 'var(--amber)' : 'var(--red)' },
        ].map(s => (
          <div key={s.label} style={{ background: '#fff', border: 'var(--border)', borderRadius: 'var(--radius)', padding: '16px' }}>
            <div style={{ fontSize: 11, color: 'var(--gray-600)', marginBottom: 6 }}>{s.label}</div>
            <div style={{ fontSize: 24, fontWeight: 600, color: s.c }}>{s.val}</div>
            <div style={{ fontSize: 11, color: 'var(--gray-400)', marginTop: 3 }}>{s.sub}</div>
          </div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        <div style={{ background: '#fff', border: 'var(--border)', borderRadius: 'var(--radius)', padding: 20 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <h2 style={{ fontSize: 14, fontWeight: 600 }}>My goals</h2>
            <button onClick={() => navigate('/employee/goals')} style={{ fontSize: 12, color: 'var(--teal)', background: 'none', border: 'none', fontWeight: 500 }}>View all →</button>
          </div>
          {goals.length === 0 && <p style={{ color: 'var(--gray-400)', fontSize: 13 }}>No goals yet. <button onClick={() => navigate('/employee/goals')} style={{ color: 'var(--teal)', background: 'none', border: 'none', fontWeight: 500 }}>Create your first goal →</button></p>}
          {goals.slice(0, 4).map(g => (
            <div key={g.id} style={{ padding: '10px 0', borderBottom: 'var(--border)', display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{ width: 8, height: 8, borderRadius: '50%', background: g.status === 'approved' ? 'var(--teal)' : g.status === 'submitted' ? 'var(--amber)' : 'var(--gray-400)', flexShrink: 0 }} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 13, fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{g.title}</div>
                <div style={{ fontSize: 11, color: 'var(--gray-400)', marginTop: 2 }}>{g.thrustArea} · {g.weightage}%</div>
              </div>
              <span style={{ fontSize: 10, padding: '2px 8px', borderRadius: 20, background: g.status === 'approved' ? 'var(--teal-light)' : 'var(--gray-100)', color: g.status === 'approved' ? 'var(--teal-dark)' : 'var(--gray-600)', fontWeight: 500, whiteSpace: 'nowrap' }}>
                {g.status}
              </span>
            </div>
          ))}
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div onClick={() => navigate('/employee/ai-assist')} style={{ background: 'var(--purple-light)', border: '0.5px solid var(--purple-mid)', borderRadius: 'var(--radius)', padding: 18, cursor: 'pointer' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
              <div style={{ width: 32, height: 32, background: 'var(--purple)', borderRadius: 9, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: 16 }}>✦</div>
              <div>
                <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--purple-text)' }}>AI Goal Assistant</div>
                <div style={{ fontSize: 11, color: 'var(--purple)' }}>Get smart goal suggestions</div>
              </div>
            </div>
            <p style={{ fontSize: 12, color: 'var(--purple)', lineHeight: 1.5 }}>AI analyzes your role and existing goals to suggest new, high-impact goals with SMART criteria.</p>
          </div>

          <div onClick={() => navigate('/employee/risk')} style={{ background: 'var(--amber-light)', border: '0.5px solid #FAC775', borderRadius: 'var(--radius)', padding: 18, cursor: 'pointer' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
              <div style={{ width: 32, height: 32, background: 'var(--amber)', borderRadius: 9, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: 16 }}>◈</div>
              <div>
                <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--amber-text)' }}>Risk Predictor</div>
                <div style={{ fontSize: 11, color: 'var(--amber)' }}>Year-end forecast</div>
              </div>
            </div>
            <p style={{ fontSize: 12, color: 'var(--amber-text)', lineHeight: 1.5 }}>AI predicts your year-end achievement and flags goals at risk before it's too late.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
