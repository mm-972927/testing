import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

const DEMO_USERS = [
  { label: 'Employee',  email: 'employee@demo.com', color: '#1D9E75', bg: '#E1F5EE', icon: '👤', desc: 'Create & track goals' },
  { label: 'Manager',   email: 'manager@demo.com',  color: '#BA7517', bg: '#FAEEDA', icon: '👔', desc: 'Approve & review team' },
  { label: 'Admin / HR',email: 'admin@demo.com',    color: '#534AB7', bg: '#EEEDFE', icon: '🛡️', desc: 'Org-wide oversight' },
];

const FEATURES = [
  { icon: '✦', text: 'AI Goal Suggestions via Groq' },
  { icon: '◈', text: 'Year-end Risk Predictor' },
  { icon: '✓', text: 'Manager Approval Workflow' },
  { icon: '≡', text: 'Quarterly Check-ins & Audit Log' },
];

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [error, setError]       = useState('');
  const [loading, setLoading]   = useState(false);
  const [demoLoading, setDemoLoading] = useState(null);

  const doLogin = async (em, pw) => {
    setError('');
    try {
      const user = await login(em, pw);
      navigate(user.role === 'employee' ? '/employee' : user.role === 'manager' ? '/manager' : '/admin');
    } catch {
      setError('Invalid email or password. Demo password is: demo123');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    await doLogin(email, password);
    setLoading(false);
  };

  const handleDemo = async (d) => {
    setDemoLoading(d.email);
    setEmail(d.email);
    setPassword('demo123');
    await doLogin(d.email, 'demo123');
    setDemoLoading(null);
  };

  const inputStyle = {
    width: '100%', padding: '10px 12px', border: 'var(--border)',
    borderRadius: 'var(--radius-sm)', fontSize: 14, outline: 'none',
    background: 'var(--gray-50)', transition: 'border-color 0.15s',
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', background: 'var(--gray-50)' }}>

      {/* ── Left hero panel ── */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', padding: 48, background: 'linear-gradient(140deg, #0A5C48 0%, #1D9E75 55%, #2EC68E 100%)', minHeight: '100vh' }}>
        <div style={{ maxWidth: 420, color: '#fff' }}>
          <div style={{ width: 54, height: 54, background: 'rgba(255,255,255,0.18)', borderRadius: 16, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 28, backdropFilter: 'blur(4px)' }}>
            <svg width="28" height="28" fill="none" viewBox="0 0 24 24">
              <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: '2px', textTransform: 'uppercase', opacity: 0.7, marginBottom: 12 }}>AtomQuest Hackathon 1.0</div>
          <h1 style={{ fontSize: 36, fontWeight: 800, marginBottom: 14, lineHeight: 1.15, letterSpacing: '-0.5px' }}>AI-Powered<br/>Goal Portal</h1>
          <p style={{ fontSize: 15, opacity: 0.85, lineHeight: 1.75, marginBottom: 36 }}>
            Set, track, and achieve your annual goals with intelligent insights. Built for organisations that move fast.
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 40 }}>
            {FEATURES.map(f => (
              <div key={f.text} style={{ display: 'flex', alignItems: 'center', gap: 12, fontSize: 13, opacity: 0.9 }}>
                <div style={{ width: 28, height: 28, background: 'rgba(255,255,255,0.15)', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, flexShrink: 0 }}>{f.icon}</div>
                {f.text}
              </div>
            ))}
          </div>
          <div style={{ padding: '14px 18px', background: 'rgba(255,255,255,0.1)', borderRadius: 12, fontSize: 12, border: '0.5px solid rgba(255,255,255,0.2)' }}>
            Powered by <strong>Groq · Llama 3.3 70B Versatile</strong> — fastest AI inference on the planet
          </div>
        </div>
      </div>

      {/* ── Right login panel ── */}
      <div style={{ width: 500, display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '48px 44px', background: '#fff', overflowY: 'auto' }}>
        <div style={{ maxWidth: 400, width: '100%', margin: '0 auto' }}>

          <h2 style={{ fontSize: 24, fontWeight: 800, color: 'var(--gray-900)', marginBottom: 4, letterSpacing: '-0.4px' }}>Sign in</h2>
          <p style={{ fontSize: 13, color: 'var(--gray-600)', marginBottom: 28 }}>Use a demo account or your email credentials</p>

          {/* ── Demo quick access ── */}
          <div style={{ marginBottom: 24 }}>
            <p style={{ fontSize: 11, fontWeight: 700, color: 'var(--gray-400)', marginBottom: 10, textTransform: 'uppercase', letterSpacing: '0.6px' }}>⚡ Quick demo access</p>
            <div style={{ display: 'flex', gap: 8 }}>
              {DEMO_USERS.map(d => (
                <button key={d.email} onClick={() => handleDemo(d)} disabled={!!demoLoading}
                  style={{ flex: 1, padding: '12px 6px', borderRadius: 'var(--radius-sm)', border: `1.5px solid ${d.color}25`, background: demoLoading === d.email ? d.bg : '#fff', cursor: 'pointer', transition: 'all 0.15s', opacity: demoLoading && demoLoading !== d.email ? 0.5 : 1 }}
                  onMouseEnter={e => e.currentTarget.style.background = d.bg}
                  onMouseLeave={e => { if (demoLoading !== d.email) e.currentTarget.style.background = '#fff'; }}>
                  <div style={{ fontSize: 22, marginBottom: 4 }}>{d.icon}</div>
                  <div style={{ fontSize: 12, fontWeight: 700, color: d.color, marginBottom: 2 }}>
                    {demoLoading === d.email ? 'Signing in…' : d.label}
                  </div>
                  <div style={{ fontSize: 10, color: 'var(--gray-400)', lineHeight: 1.3 }}>{d.desc}</div>
                </button>
              ))}
            </div>
            <p style={{ fontSize: 11, color: 'var(--gray-400)', textAlign: 'center', marginTop: 8 }}>Password for all demo accounts: <strong style={{ color: 'var(--gray-600)' }}>demo123</strong></p>
          </div>

          {/* Divider */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 22 }}>
            <div style={{ flex: 1, height: '0.5px', background: 'var(--gray-200)' }} />
            <span style={{ fontSize: 11, color: 'var(--gray-400)', fontWeight: 500, whiteSpace: 'nowrap' }}>or continue with</span>
            <div style={{ flex: 1, height: '0.5px', background: 'var(--gray-200)' }} />
          </div>

          {/* ── SSO / OAuth buttons ── */}
          <div style={{ display: 'flex', gap: 8, marginBottom: 22 }}>
            {/* Google SSO */}
            <button
              onClick={() => setError('Google SSO: configure VITE_GOOGLE_CLIENT_ID in .env to enable')}
              style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, padding: '10px', border: 'var(--border)', borderRadius: 'var(--radius-sm)', background: '#fff', cursor: 'pointer', fontSize: 13, fontWeight: 500, color: 'var(--gray-700)', transition: 'background 0.15s' }}
              onMouseEnter={e => e.currentTarget.style.background = 'var(--gray-50)'}
              onMouseLeave={e => e.currentTarget.style.background = '#fff'}>
              <svg width="18" height="18" viewBox="0 0 24 24">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
              </svg>
              Google
            </button>
            {/* Microsoft SSO */}
            <button
              onClick={() => setError('Microsoft SSO: configure Azure AD / Entra ID credentials in backend .env to enable')}
              style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, padding: '10px', border: 'var(--border)', borderRadius: 'var(--radius-sm)', background: '#fff', cursor: 'pointer', fontSize: 13, fontWeight: 500, color: 'var(--gray-700)', transition: 'background 0.15s' }}
              onMouseEnter={e => e.currentTarget.style.background = 'var(--gray-50)'}
              onMouseLeave={e => e.currentTarget.style.background = '#fff'}>
              <svg width="18" height="18" viewBox="0 0 24 24">
                <path d="M11.5 2H2v9.5h9.5V2z" fill="#F25022"/>
                <path d="M22 2h-9.5v9.5H22V2z" fill="#7FBA00"/>
                <path d="M11.5 12.5H2V22h9.5v-9.5z" fill="#00A4EF"/>
                <path d="M22 12.5h-9.5V22H22v-9.5z" fill="#FFB900"/>
              </svg>
              Microsoft
            </button>
          </div>

          {/* Divider */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
            <div style={{ flex: 1, height: '0.5px', background: 'var(--gray-200)' }} />
            <span style={{ fontSize: 11, color: 'var(--gray-400)', fontWeight: 500 }}>or email & password</span>
            <div style={{ flex: 1, height: '0.5px', background: 'var(--gray-200)' }} />
          </div>

          {/* ── Email form ── */}
          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: 14 }}>
              <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--gray-700)', display: 'block', marginBottom: 5 }}>Email address</label>
              <input value={email} onChange={e => setEmail(e.target.value)} type="email" placeholder="you@company.com" required style={inputStyle}
                onFocus={e => e.target.style.borderColor = 'var(--teal)'}
                onBlur={e => e.target.style.borderColor = ''} />
            </div>
            <div style={{ marginBottom: 20 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
                <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--gray-700)' }}>Password</label>
                <span style={{ fontSize: 11, color: 'var(--teal)', cursor: 'pointer', fontWeight: 500 }}>Forgot password?</span>
              </div>
              <input value={password} onChange={e => setPassword(e.target.value)} type="password" placeholder="••••••••" required style={inputStyle}
                onFocus={e => e.target.style.borderColor = 'var(--teal)'}
                onBlur={e => e.target.style.borderColor = ''} />
            </div>

            {error && (
              <div style={{ marginBottom: 14, padding: '9px 12px', background: 'var(--red-light)', border: '0.5px solid var(--red)', borderRadius: 'var(--radius-sm)', fontSize: 12, color: 'var(--red)' }}>
                {error}
              </div>
            )}

            <button type="submit" disabled={loading}
              style={{ width: '100%', padding: '12px', background: loading ? 'var(--gray-200)' : 'var(--teal)', color: loading ? 'var(--gray-600)' : '#fff', border: 'none', borderRadius: 'var(--radius-sm)', fontSize: 14, fontWeight: 700, cursor: loading ? 'default' : 'pointer', transition: 'background 0.15s', letterSpacing: '-0.2px' }}>
              {loading ? 'Signing in…' : 'Sign in →'}
            </button>
          </form>

          <p style={{ textAlign: 'center', fontSize: 11, color: 'var(--gray-400)', marginTop: 28, lineHeight: 1.6 }}>
            AtomQuest Hackathon 1.0 · AI-Powered Goal Portal<br/>
            <span style={{ color: 'var(--gray-300)' }}>Built with React · Express · Groq AI</span>
          </p>
        </div>
      </div>
    </div>
  );
}
