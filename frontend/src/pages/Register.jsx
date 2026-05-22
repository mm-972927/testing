import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';

const DEPARTMENTS = ['Engineering','Product','Design','Sales','Marketing',
                     'Finance','HR','Operations','Customer Success','General'];

const BACKEND = import.meta.env.VITE_API_URL || 'https://testing-vov1.vercel.app/api';

export default function Register() {
  const navigate  = useNavigate();
  const [form,    setForm]    = useState({ name:'', email:'', password:'', confirm:'', department:'Engineering' });
  const [error,   setError]   = useState('');
  const [loading, setLoading] = useState(false);

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleSubmit = async e => {
    e.preventDefault(); setError('');
    if (form.password !== form.confirm) return setError('Passwords do not match');
    if (form.password.length < 6) return setError('Password must be at least 6 characters');
    setLoading(true);
    try {
      const res  = await fetch(`${BACKEND}/auth/register`, {
        method:'POST',
        headers:{'Content-Type':'application/json'},
        body: JSON.stringify({ name:form.name, email:form.email, password:form.password, department:form.department }),
      });
      const data = await res.json();
      if (!res.ok) return setError(data.error || 'Registration failed');
      localStorage.setItem('aq_token', data.token);
      navigate('/employee');
    } catch { setError('Network error — backend may be unreachable'); }
    finally { setLoading(false); }
  };

  const inp = {
    width:'100%', padding:'10px 12px', border:'0.5px solid #D3D1C7',
    borderRadius:6, fontSize:14, outline:'none', background:'#FAFAF8',
  };

  return (
    <div style={{ minHeight:'100vh', display:'flex', background:'#F8F8F6' }}>

      {/* Left hero */}
      <div style={{ flex:1, display:'flex', flexDirection:'column', justifyContent:'center', alignItems:'center', padding:48, background:'linear-gradient(145deg,#083D2E,#1D9E75 60%,#2EC68E)' }}>
        <div style={{ maxWidth:380, color:'#fff' }}>
          <div style={{ width:52, height:52, background:'rgba(255,255,255,0.15)', borderRadius:14, display:'flex', alignItems:'center', justifyContent:'center', marginBottom:24, border:'1px solid rgba(255,255,255,0.2)' }}>
            <svg width="26" height="26" fill="none" viewBox="0 0 24 24">
              <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <div style={{ fontSize:10, fontWeight:700, letterSpacing:'2.5px', textTransform:'uppercase', opacity:.65, marginBottom:10 }}>AtomQuest Hackathon 1.0</div>
          <h1 style={{ fontSize:30, fontWeight:800, marginBottom:12, lineHeight:1.2 }}>Employee<br/>Registration</h1>
          <p style={{ fontSize:14, opacity:.82, lineHeight:1.8, marginBottom:24 }}>
            Create your account to start setting AI-powered annual goals.
          </p>
          {['Set up to 8 SMART goals','AI suggests goals for your role','Track Q1–Q4 progress','Manager check-ins & feedback'].map(t => (
            <div key={t} style={{ display:'flex', alignItems:'center', gap:10, fontSize:13, opacity:.88, marginBottom:10 }}>
              <span style={{ width:18, height:18, background:'rgba(255,255,255,0.2)', borderRadius:5, display:'flex', alignItems:'center', justifyContent:'center', fontSize:10, flexShrink:0 }}>✓</span>
              {t}
            </div>
          ))}
          <div style={{ marginTop:24, padding:'12px 16px', background:'rgba(255,255,255,0.1)', borderRadius:10, fontSize:12, border:'0.5px solid rgba(255,255,255,0.2)', lineHeight:1.7 }}>
            <strong>Manager or Admin?</strong> Your account is created by your organisation's Admin. Contact them for access.
          </div>
        </div>
      </div>

      {/* Right form */}
      <div style={{ width:480, display:'flex', flexDirection:'column', justifyContent:'center', padding:'48px 44px', background:'#fff', overflowY:'auto' }}>
        <div style={{ maxWidth:380, width:'100%', margin:'0 auto' }}>
          <h2 style={{ fontSize:22, fontWeight:800, color:'#1A1A18', marginBottom:3 }}>Create employee account</h2>
          <p style={{ fontSize:13, color:'#5F5E5A', marginBottom:20 }}>
            Already have an account? <Link to="/login" style={{ color:'#1D9E75', fontWeight:600, textDecoration:'none' }}>Sign in →</Link>
          </p>

          <div style={{ marginBottom:20, padding:'10px 14px', background:'#E1F5EE', borderRadius:8, border:'0.5px solid #9FE1CB', fontSize:12, color:'#0F6E56' }}>
            <strong>Employees only.</strong> Manager and Admin accounts are created by your Admin.
          </div>

          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom:13 }}>
              <label style={{ fontSize:12, fontWeight:600, color:'#444441', display:'block', marginBottom:5 }}>Full name *</label>
              <input value={form.name} onChange={e=>set('name',e.target.value)} required placeholder="Arjun Sharma" style={inp}
                onFocus={e=>e.target.style.borderColor='#1D9E75'} onBlur={e=>e.target.style.borderColor='#D3D1C7'} />
            </div>

            <div style={{ marginBottom:13 }}>
              <label style={{ fontSize:12, fontWeight:600, color:'#444441', display:'block', marginBottom:5 }}>Work email *</label>
              <input value={form.email} onChange={e=>set('email',e.target.value)} type="email" required placeholder="you@company.com" style={inp}
                onFocus={e=>e.target.style.borderColor='#1D9E75'} onBlur={e=>e.target.style.borderColor='#D3D1C7'} />
            </div>

            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12, marginBottom:13 }}>
              <div>
                <label style={{ fontSize:12, fontWeight:600, color:'#444441', display:'block', marginBottom:5 }}>Password * (min 6)</label>
                <input value={form.password} onChange={e=>set('password',e.target.value)} type="password" required placeholder="••••••••" style={inp}
                  onFocus={e=>e.target.style.borderColor='#1D9E75'} onBlur={e=>e.target.style.borderColor='#D3D1C7'} />
              </div>
              <div>
                <label style={{ fontSize:12, fontWeight:600, color:'#444441', display:'block', marginBottom:5 }}>Confirm *</label>
                <input value={form.confirm} onChange={e=>set('confirm',e.target.value)} type="password" required placeholder="••••••••" style={inp}
                  onFocus={e=>e.target.style.borderColor='#1D9E75'} onBlur={e=>e.target.style.borderColor='#D3D1C7'} />
              </div>
            </div>

            <div style={{ marginBottom:20 }}>
              <label style={{ fontSize:12, fontWeight:600, color:'#444441', display:'block', marginBottom:5 }}>Department</label>
              <select value={form.department} onChange={e=>set('department',e.target.value)} style={{...inp,cursor:'pointer'}}
                onFocus={e=>e.target.style.borderColor='#1D9E75'} onBlur={e=>e.target.style.borderColor='#D3D1C7'}>
                {DEPARTMENTS.map(d => <option key={d}>{d}</option>)}
              </select>
            </div>

            {error && <div style={{ marginBottom:14, padding:'9px 12px', background:'#FCEBEB', border:'0.5px solid #E24B4A', borderRadius:6, fontSize:12, color:'#791F1F' }}>{error}</div>}

            <button type="submit" disabled={loading}
              style={{ width:'100%', padding:'12px', background:loading?'#D3D1C7':'#1D9E75', color:loading?'#5F5E5A':'#fff', border:'none', borderRadius:6, fontSize:14, fontWeight:700, cursor:loading?'default':'pointer' }}>
              {loading ? 'Creating account…' : 'Create account →'}
            </button>
          </form>

          <p style={{ textAlign:'center', fontSize:10, color:'#C0BEB5', marginTop:20 }}>
            AtomQuest Hackathon 1.0 · Employee self-registration
          </p>
        </div>
      </div>
    </div>
  );
}
