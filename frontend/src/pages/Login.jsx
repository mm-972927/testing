import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

const DEMO = [
  { label: 'Employee', email: 'employee@demo.com' },
  { label: 'Manager', email: 'manager@demo.com' },
  { label: 'Admin / HR', email: 'admin@demo.com' },
];

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const submit = async (e) => {
    e?.preventDefault();
    setError(''); setLoading(true);
    try {
      const user = await login(email, password);
      navigate(user.role === 'employee' ? '/employee' : user.role === 'manager' ? '/manager' : '/admin');
    } catch {
      setError('Invalid email or password');
    } finally { setLoading(false); }
  };

  const quickLogin = (em) => { setEmail(em); setPassword('demo123'); };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--gray-50)', padding: 20 }}>
      <div style={{ width: '100%', maxWidth: 420 }}>
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <div style={{ width: 44, height: 44, background: 'var(--teal)', borderRadius: 12, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', marginBottom: 12 }}>
            <svg width="22" height="22" fill="none" viewBox="0 0 24 24"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
          </div>
          <h1 style={{ fontSize: 22, fontWeight: 600, color: 'var(--gray-900)' }}>AtomQuest Portal</h1>
          <p style={{ color: 'var(--gray-600)', marginTop: 4, fontSize: 13 }}>Goal Setting & Tracking — AI Powered</p>
        </div>

        <div style={{ background: '#fff', border: 'var(--border)', borderRadius: 'var(--radius-lg)', padding: '28px 28px' }}>
          <div style={{ marginBottom: 20 }}>
            <p style={{ fontSize: 12, color: 'var(--gray-600)', marginBottom: 8, fontWeight: 500 }}>Quick demo login</p>
            <div style={{ display: 'flex', gap: 8 }}>
              {DEMO.map(d => (
                <button key={d.email} onClick={() => quickLogin(d.email)}
                  style={{ flex: 1, padding: '6px 4px', fontSize: 11, fontWeight: 500, background: email === d.email ? 'var(--teal-light)' : 'var(--gray-100)', border: email === d.email ? '1px solid var(--teal)' : 'var(--border)', borderRadius: 'var(--radius-sm)', color: email === d.email ? 'var(--teal-dark)' : 'var(--gray-600)' }}>
                  {d.label}
                </button>
              ))}
            </div>
          </div>

          <form onSubmit={submit}>
            <div style={{ marginBottom: 14 }}>
              <label style={{ fontSize: 12, fontWeight: 500, color: 'var(--gray-600)', display: 'block', marginBottom: 5 }}>Email</label>
              <input value={email} onChange={e => setEmail(e.target.value)} type="email" placeholder="you@company.com" required
                style={{ width: '100%', padding: '9px 12px', border: 'var(--border)', borderRadius: 'var(--radius-sm)', fontSize: 14, outline: 'none', background: 'var(--gray-50)' }} />
            </div>
            <div style={{ marginBottom: 20 }}>
              <label style={{ fontSize: 12, fontWeight: 500, color: 'var(--gray-600)', display: 'block', marginBottom: 5 }}>Password</label>
              <input value={password} onChange={e => setPassword(e.target.value)} type="password" placeholder="••••••••" required
                style={{ width: '100%', padding: '9px 12px', border: 'var(--border)', borderRadius: 'var(--radius-sm)', fontSize: 14, outline: 'none', background: 'var(--gray-50)' }} />
            </div>
            {error && <p style={{ color: 'var(--red)', fontSize: 12, marginBottom: 12 }}>{error}</p>}
            <button type="submit" disabled={loading}
              style={{ width: '100%', padding: '10px', background: 'var(--teal)', color: '#fff', border: 'none', borderRadius: 'var(--radius-sm)', fontSize: 14, fontWeight: 600 }}>
              {loading ? 'Signing in…' : 'Sign in'}
            </button>
          </form>
        </div>
        <p style={{ textAlign: 'center', fontSize: 11, color: 'var(--gray-400)', marginTop: 16 }}>Demo password: demo123</p>
      </div>
    </div>
  );
}
