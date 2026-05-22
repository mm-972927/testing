import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

const DEMO_USERS = [
  { label: 'Employee',   email: 'employee@demo.com', color: '#1D9E75', bg: '#E1F5EE' },
  { label: 'Manager',    email: 'manager@demo.com',  color: '#BA7517', bg: '#FAEEDA' },
  { label: 'Admin',      email: 'admin@demo.com',    color: '#534AB7', bg: '#EEEDFE' },
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
  const [ssoToast, setSsoToast] = useState('');

  const doLogin = async (em, pw) => {
    setError('');
    try {
      const user = await login(em, pw);
      navigate(user.role === 'employee' ? '/employee' : user.role === 'manager' ? '/manager' : '/admin');
    } catch {
      setError('Invalid email or password. Demo password: demo123');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault(); setLoading(true);
    await doLogin(email, password);
    setLoading(false);
  };

  const handleDemo = async (d) => {
    setDemoLoading(d.email); setError('');
    await doLogin(d.email, 'demo123');
    setDemoLoading(null);
  };

  const showSsoToast = (provider) => {
    setSsoToast(`${provider} SSO is configured via environment variables. Contact your admin to enable.`);
    setTimeout(() => setSsoToast(''), 4000);
  };

  const inp = {
    width:'100%', padding:'10px 12px', border:'0.5px solid #D3D1C7',
    borderRadius:6, fontSize:14, outline:'none', background:'#FAFAF8',
  };

  return (
    <div style={{ minHeight:'100vh', display:'flex', background:'#F8F8F6' }}>

      {/* SSO toast */}
      {ssoToast && (
        <div style={{ position:'fixed', top:20, left:'50%', transform:'translateX(-50%)', background:'#1A1A18', color:'#fff', padding:'10px 20px', borderRadius:8, fontSize:12, zIndex:999, maxWidth:400, textAlign:'center', boxShadow:'0 4px 20px rgba(0,0,0,0.2)' }}>
          {ssoToast}
        </div>
      )}

      {/* ── Left hero ── */}
      <div style={{ flex:1, display:'flex', flexDirection:'column', justifyContent:'center', alignItems:'center', padding:48, background:'linear-gradient(145deg, #083D2E 0%, #1D9E75 60%, #2EC68E 100%)' }}>
        <div style={{ maxWidth:400, color:'#fff' }}>
          <div style={{ width:52, height:52, background:'rgba(255,255,255,0.15)', borderRadius:14, display:'flex', alignItems:'center', justifyContent:'center', marginBottom:24, border:'1px solid rgba(255,255,255,0.2)' }}>
            <svg width="26" height="26" fill="none" viewBox="0 0 24 24">
              <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <div style={{ fontSize:10, fontWeight:700, letterSpacing:'2.5px', textTransform:'uppercase', opacity:0.65, marginBottom:10 }}>AtomQuest Hackathon 1.0</div>
          <h1 style={{ fontSize:34, fontWeight:800, marginBottom:12, lineHeight:1.15, letterSpacing:'-0.5px' }}>AI-Powered<br/>Goal Portal</h1>
          <p style={{ fontSize:14, opacity:0.82, lineHeight:1.8, marginBottom:32 }}>
            Set, track, and achieve annual goals with intelligent insights. Built for organisations that move fast.
          </p>
          <div style={{ display:'flex', flexDirection:'column', gap:9, marginBottom:36 }}>
            {FEATURES.map(f => (
              <div key={f.text} style={{ display:'flex', alignItems:'center', gap:11, fontSize:13, opacity:0.88 }}>
                <div style={{ width:26, height:26, background:'rgba(255,255,255,0.12)', borderRadius:7, display:'flex', alignItems:'center', justifyContent:'center', fontSize:12, flexShrink:0 }}>{f.icon}</div>
                {f.text}
              </div>
            ))}
          </div>
          <div style={{ padding:'12px 16px', background:'rgba(255,255,255,0.08)', borderRadius:10, fontSize:12, border:'0.5px solid rgba(255,255,255,0.15)', lineHeight:1.6 }}>
            Powered by <strong>Groq · Llama 3.3 70B Versatile</strong>
          </div>
        </div>
      </div>

      {/* ── Right panel ── */}
      <div style={{ width:480, display:'flex', flexDirection:'column', justifyContent:'center', padding:'48px 44px', background:'#fff', overflowY:'auto' }}>
        <div style={{ maxWidth:390, width:'100%', margin:'0 auto' }}>

          <h2 style={{ fontSize:22, fontWeight:800, color:'#1A1A18', marginBottom:3, letterSpacing:'-0.4px' }}>Sign in</h2>
          <p style={{ fontSize:13, color:'#5F5E5A', marginBottom:24 }}>
            New here? <Link to="/register" style={{ color:'#1D9E75', fontWeight:600, textDecoration:'none' }}>Create an account →</Link>
          </p>

          {/* Demo cards */}
          <div style={{ marginBottom:22 }}>
            <p style={{ fontSize:10, fontWeight:700, color:'#888780', marginBottom:9, textTransform:'uppercase', letterSpacing:'0.8px' }}>⚡ Quick demo access</p>
            <div style={{ display:'flex', gap:8 }}>
              {DEMO_USERS.map(d => (
                <button key={d.email} onClick={() => handleDemo(d)} disabled={!!demoLoading}
                  style={{ flex:1, padding:'11px 4px', borderRadius:7, border:`1.5px solid ${d.color}20`, background: demoLoading === d.email ? d.bg : '#fff', cursor:'pointer', transition:'all 0.12s', opacity: demoLoading && demoLoading !== d.email ? 0.45 : 1 }}
                  onMouseEnter={e => e.currentTarget.style.background = d.bg}
                  onMouseLeave={e => { if (demoLoading !== d.email) e.currentTarget.style.background = '#fff'; }}>
                  <div style={{ fontSize:12, fontWeight:700, color: demoLoading === d.email ? d.color : '#1A1A18', marginBottom:2 }}>
                    {demoLoading === d.email ? 'Signing in…' : d.label}
                  </div>
                  <div style={{ fontSize:10, color: d.color, fontWeight:500 }}>demo123</div>
                </button>
              ))}
            </div>
          </div>

          {/* Divider */}
          <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:18 }}>
            <div style={{ flex:1, height:'0.5px', background:'#E4E2D8' }} />
            <span style={{ fontSize:11, color:'#888780', fontWeight:500 }}>or continue with</span>
            <div style={{ flex:1, height:'0.5px', background:'#E4E2D8' }} />
          </div>

          {/* SSO buttons */}
          <div style={{ display:'flex', gap:8, marginBottom:18 }}>
            <button onClick={() => showSsoToast('Google')}
              style={{ flex:1, display:'flex', alignItems:'center', justifyContent:'center', gap:8, padding:'9px', border:'0.5px solid #D3D1C7', borderRadius:6, background:'#fff', cursor:'pointer', fontSize:13, fontWeight:500, color:'#444441' }}
              onMouseEnter={e => e.currentTarget.style.background='#F8F8F6'}
              onMouseLeave={e => e.currentTarget.style.background='#fff'}>
              <svg width="17" height="17" viewBox="0 0 24 24">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
              </svg>
              Google
            </button>
            <button onClick={() => showSsoToast('Microsoft')}
              style={{ flex:1, display:'flex', alignItems:'center', justifyContent:'center', gap:8, padding:'9px', border:'0.5px solid #D3D1C7', borderRadius:6, background:'#fff', cursor:'pointer', fontSize:13, fontWeight:500, color:'#444441' }}
              onMouseEnter={e => e.currentTarget.style.background='#F8F8F6'}
              onMouseLeave={e => e.currentTarget.style.background='#fff'}>
              <svg width="17" height="17" viewBox="0 0 24 24">
                <path d="M11.5 2H2v9.5h9.5V2z" fill="#F25022"/>
                <path d="M22 2h-9.5v9.5H22V2z" fill="#7FBA00"/>
                <path d="M11.5 12.5H2V22h9.5v-9.5z" fill="#00A4EF"/>
                <path d="M22 12.5h-9.5V22H22v-9.5z" fill="#FFB900"/>
              </svg>
              Microsoft
            </button>
          </div>

          <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:18 }}>
            <div style={{ flex:1, height:'0.5px', background:'#E4E2D8' }} />
            <span style={{ fontSize:11, color:'#888780', fontWeight:500 }}>or email & password</span>
            <div style={{ flex:1, height:'0.5px', background:'#E4E2D8' }} />
          </div>

          {/* Email form */}
          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom:13 }}>
              <label style={{ fontSize:12, fontWeight:600, color:'#444441', display:'block', marginBottom:5 }}>Email address</label>
              <input value={email} onChange={e => setEmail(e.target.value)} type="email" placeholder="you@company.com" required style={inp}
                onFocus={e => e.target.style.borderColor='#1D9E75'}
                onBlur={e => e.target.style.borderColor='#D3D1C7'} />
            </div>
            <div style={{ marginBottom:18 }}>
              <div style={{ display:'flex', justifyContent:'space-between', marginBottom:5 }}>
                <label style={{ fontSize:12, fontWeight:600, color:'#444441' }}>Password</label>
                <span style={{ fontSize:11, color:'#1D9E75', cursor:'pointer', fontWeight:500 }}>Forgot password?</span>
              </div>
              <input value={password} onChange={e => setPassword(e.target.value)} type="password" placeholder="••••••••" required style={inp}
                onFocus={e => e.target.style.borderColor='#1D9E75'}
                onBlur={e => e.target.style.borderColor='#D3D1C7'} />
            </div>

            {error && (
              <div style={{ marginBottom:13, padding:'9px 12px', background:'#FCEBEB', border:'0.5px solid #E24B4A', borderRadius:6, fontSize:12, color:'#791F1F' }}>{error}</div>
            )}

            <button type="submit" disabled={loading}
              style={{ width:'100%', padding:'11px', background: loading ? '#D3D1C7' : '#1D9E75', color: loading ? '#5F5E5A' : '#fff', border:'none', borderRadius:6, fontSize:14, fontWeight:700, cursor: loading ? 'default' : 'pointer' }}>
              {loading ? 'Signing in…' : 'Sign in →'}
            </button>
          </form>

          <p style={{ textAlign:'center', fontSize:11, color:'#888780', marginTop:22, lineHeight:1.6 }}>
            Don't have an account?{' '}
            <Link to="/register" style={{ color:'#1D9E75', fontWeight:600, textDecoration:'none' }}>Create one →</Link>
          </p>

          <p style={{ textAlign:'center', fontSize:10, color:'#C0BEB5', marginTop:16 }}>
            AtomQuest Hackathon 1.0 · React · Express · Groq AI
          </p>
        </div>
      </div>
    </div>
  );
}
