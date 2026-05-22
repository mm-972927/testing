import { useState, useRef, useEffect } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import AIWidget from '../ai/AIWidget';

const NAV = {
  employee: [
    { to:'/employee',           label:'Dashboard',      icon:'⊞' },
    { to:'/employee/goals',     label:'My Goals',       icon:'◎' },
    { to:'/employee/ai-assist', label:'AI Assistant',   icon:'✦', ai:true },
    { to:'/employee/risk',      label:'Risk Predictor', icon:'◈', ai:true },
  ],
  manager: [
    { to:'/manager',           label:'Dashboard',   icon:'⊞' },
    { to:'/manager/team',      label:'Check-ins',   icon:'✓' },
    { to:'/manager/approvals', label:'Approvals',   icon:'◉' },
    { to:'/manager/shared',    label:'Push KPI',    icon:'↑' },
    { to:'/manager/risk',      label:'Team Risk AI',icon:'◈', ai:true },
  ],
  admin: [
    { to:'/admin',            label:'Dashboard',   icon:'⊞' },
    { to:'/admin/users',      label:'Employees',   icon:'◉' },
    { to:'/admin/goals',      label:'All Goals',   icon:'◎' },
    { to:'/admin/completion', label:'Completion',  icon:'▦' },
    { to:'/admin/risk',       label:'Org Risk AI', icon:'◈', ai:true },
    { to:'/admin/audit',      label:'Audit Trail', icon:'≡' },
  ],
};

const RS = {
  employee: { bg:'#E1F5EE', text:'#0F6E56',  label:'Employee'  },
  manager:  { bg:'#FAEEDA', text:'#854F0B',  label:'Manager'   },
  admin:    { bg:'#EEEDFE', text:'#3C3489',  label:'Admin / HR'},
};

export default function Layout({ children }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [drop, setDrop]   = useState(false);
  const dropRef           = useRef(null);
  const navItems          = NAV[user?.role] || [];
  const rs                = RS[user?.role]  || RS.employee;
  const initials          = user?.name?.split(' ').map(n=>n[0]).join('').slice(0,2) || '??';

  useEffect(() => {
    const h = e => { if (dropRef.current && !dropRef.current.contains(e.target)) setDrop(false); };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, []);

  const handleLogout = () => { setDrop(false); logout(); navigate('/signout'); };

  return (
    <div style={{ display:'flex', minHeight:'100vh', background:'var(--gray-50)' }}>

      {/* Sidebar */}
      <aside style={{ width:216, background:'#fff', borderRight:'var(--border)', display:'flex', flexDirection:'column', position:'sticky', top:0, height:'100vh', flexShrink:0, zIndex:10 }}>

        {/* Brand */}
        <div style={{ padding:'17px 15px 13px', borderBottom:'var(--border)' }}>
          <div style={{ display:'flex', alignItems:'center', gap:9 }}>
            <div style={{ width:30, height:30, background:'var(--teal)', borderRadius:8, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
              <svg width="16" height="16" fill="none" viewBox="0 0 24 24">
                <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <div>
              <div style={{ fontSize:13, fontWeight:700, color:'var(--gray-900)', letterSpacing:'-0.3px' }}>AtomQuest</div>
              <div style={{ fontSize:10, color:'var(--gray-400)' }}>Goal Portal 1.0</div>
            </div>
          </div>
          <div style={{ marginTop:9, display:'inline-flex', alignItems:'center', gap:5, background:'var(--purple-light)', color:'var(--purple)', padding:'3px 9px', borderRadius:20, fontSize:10, fontWeight:600, border:'0.5px solid var(--purple-mid)' }}>
            ✦ AI · Groq
          </div>
        </div>

        {/* Nav */}
        <nav style={{ padding:'8px 7px', flex:1, overflowY:'auto' }}>
          <div style={{ fontSize:9, color:'var(--gray-400)', padding:'5px 7px 3px', letterSpacing:'0.6px', textTransform:'uppercase', fontWeight:600 }}>Menu</div>
          {navItems.map(item => (
            <NavLink key={item.to} to={item.to} end={item.to.split('/').length === 2}
              style={({ isActive }) => ({
                display:'flex', alignItems:'center', gap:8, padding:'7px 9px',
                borderRadius:'var(--radius-sm)', textDecoration:'none', fontSize:13,
                fontWeight: isActive ? 600 : 400, marginBottom:1,
                background: isActive ? 'var(--teal-light)' : 'transparent',
                color:      isActive ? 'var(--teal-dark)'  : 'var(--gray-600)',
                transition:'background 0.12s',
              })}>
              <span style={{ fontSize:14, width:17, textAlign:'center', flexShrink:0 }}>{item.icon}</span>
              <span style={{ flex:1 }}>{item.label}</span>
              {item.ai && <span style={{ fontSize:9, background:'var(--purple-light)', color:'var(--purple)', padding:'1px 5px', borderRadius:7, fontWeight:600, border:'0.5px solid var(--purple-mid)' }}>AI</span>}
            </NavLink>
          ))}
        </nav>

        {/* User dropdown */}
        <div style={{ padding:'9px 9px 13px', borderTop:'var(--border)', position:'relative' }} ref={dropRef}>

          {drop && (
            <div style={{ position:'absolute', bottom:'calc(100% + 4px)', left:9, right:9, background:'#fff', border:'var(--border)', borderRadius:'var(--radius-sm)', boxShadow:'0 -6px 24px rgba(0,0,0,0.10)', zIndex:200, overflow:'hidden' }}>
              <div style={{ padding:'13px 13px 11px', background:rs.bg, borderBottom:'var(--border)' }}>
                <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                  <div style={{ width:34, height:34, borderRadius:'50%', background:'#fff', display:'flex', alignItems:'center', justifyContent:'center', fontSize:12, fontWeight:700, color:rs.text, flexShrink:0 }}>{initials}</div>
                  <div style={{ minWidth:0 }}>
                    <div style={{ fontSize:13, fontWeight:600, color:rs.text, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{user?.name}</div>
                    <div style={{ fontSize:11, color:rs.text, opacity:0.7, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{user?.email}</div>
                  </div>
                </div>
                <div style={{ marginTop:8, display:'flex', gap:5 }}>
                  <span style={{ fontSize:10, padding:'2px 8px', borderRadius:20, background:'rgba(255,255,255,0.7)', color:rs.text, fontWeight:600 }}>{rs.label}</span>
                  <span style={{ fontSize:10, padding:'2px 8px', borderRadius:20, background:'rgba(255,255,255,0.7)', color:rs.text }}>{user?.department}</span>
                </div>
              </div>
              <div style={{ padding:'6px' }}>
                <div style={{ padding:'7px 9px', fontSize:12, color:'var(--gray-600)', display:'flex', alignItems:'center', gap:7 }}>
                  <span>📅</span> FY 2025 · Q2 Active
                </div>
                <div style={{ height:'0.5px', background:'var(--gray-200)', margin:'3px 0' }} />
                <button onClick={handleLogout} style={{ width:'100%', padding:'9px 10px', fontSize:13, fontWeight:600, color:'#fff', background:'var(--red)', border:'none', borderRadius:4, textAlign:'left', cursor:'pointer', display:'flex', alignItems:'center', gap:8 }}>
                  <span>⏻</span> Sign out
                </button>
              </div>
            </div>
          )}

          <button onClick={() => setDrop(o=>!o)}
            style={{ width:'100%', display:'flex', alignItems:'center', gap:8, padding:'8px 9px', background:drop?rs.bg:'var(--gray-50)', border:drop?`1px solid ${rs.text}25`:'var(--border)', borderRadius:'var(--radius-sm)', cursor:'pointer', transition:'all 0.15s' }}>
            <div style={{ width:28, height:28, borderRadius:'50%', background:rs.bg, display:'flex', alignItems:'center', justifyContent:'center', fontSize:10, fontWeight:700, color:rs.text, flexShrink:0, border:`1.5px solid ${rs.text}25` }}>{initials}</div>
            <div style={{ flex:1, minWidth:0, textAlign:'left' }}>
              <div style={{ fontSize:12, fontWeight:600, color:'var(--gray-900)', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{user?.name}</div>
              <div style={{ fontSize:10, color:'var(--gray-400)' }}>{rs.label}</div>
            </div>
            <div style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:1 }}>
              <span style={{ fontSize:13, color:drop?'var(--red)':'var(--gray-400)' }}>⏻</span>
              <span style={{ fontSize:7, color:'var(--gray-400)', transform:drop?'rotate(180deg)':'none', transition:'transform 0.2s' }}>▾</span>
            </div>
          </button>
        </div>
      </aside>

      {/* Main */}
      <main style={{ flex:1, overflowY:'auto', minHeight:'100vh' }}>
        {children}
      </main>

      {/* AI Floating Widget — shown on all pages */}
      <AIWidget />
    </div>
  );
}
