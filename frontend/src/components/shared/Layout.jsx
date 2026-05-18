import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';

const NAV = {
  employee: [
    { to: '/employee', label: 'Dashboard', icon: '⊞' },
    { to: '/employee/goals', label: 'My Goals', icon: '◎' },
    { to: '/employee/ai-assist', label: 'AI Assistant', icon: '✦', ai: true },
    { to: '/employee/risk', label: 'Risk Predictor', icon: '◈', ai: true },
  ],
  manager: [
    { to: '/manager', label: 'Dashboard', icon: '⊞' },
    { to: '/manager/team', label: 'Team Goals', icon: '◉' },
    { to: '/manager/approvals', label: 'Approvals', icon: '✓' },
    { to: '/manager/risk', label: 'Team Risk AI', icon: '◈', ai: true },
  ],
  admin: [
    { to: '/admin', label: 'Dashboard', icon: '⊞' },
    { to: '/admin/users', label: 'All Employees', icon: '◉' },
    { to: '/admin/goals', label: 'All Goals', icon: '◎' },
    { to: '/admin/risk', label: 'Org Risk AI', icon: '◈', ai: true },
    { to: '/admin/audit', label: 'Audit Log', icon: '≡' },
  ],
};

export default function Layout({ children }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const navItems = NAV[user?.role] || [];

  const handleLogout = () => { logout(); navigate('/login'); };

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--gray-50)' }}>
      <aside style={{ width: 220, background: '#fff', borderRight: 'var(--border)', display: 'flex', flexDirection: 'column', position: 'sticky', top: 0, height: '100vh', flexShrink: 0 }}>
        <div style={{ padding: '20px 16px 16px', borderBottom: 'var(--border)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
            <div style={{ width: 30, height: 30, background: 'var(--teal)', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <svg width="16" height="16" fill="none" viewBox="0 0 24 24"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
            </div>
            <div>
              <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--gray-900)' }}>AtomQuest</div>
              <div style={{ fontSize: 10, color: 'var(--gray-400)' }}>Goal Portal</div>
            </div>
          </div>
          <div style={{ marginTop: 10, display: 'inline-flex', alignItems: 'center', gap: 5, background: 'var(--purple-light)', color: 'var(--purple)', padding: '3px 9px', borderRadius: 20, fontSize: 10, fontWeight: 500, border: '0.5px solid var(--purple-mid)' }}>
            ✦ AI Powered
          </div>
        </div>

        <nav style={{ padding: '10px 8px', flex: 1, overflowY: 'auto' }}>
          <div style={{ fontSize: 10, color: 'var(--gray-400)', padding: '6px 8px 3px', letterSpacing: '0.4px', textTransform: 'uppercase' }}>Navigation</div>
          {navItems.map(item => (
            <NavLink key={item.to} to={item.to} end={item.to.split('/').length === 2}
              style={({ isActive }) => ({
                display: 'flex', alignItems: 'center', gap: 9, padding: '8px 9px',
                borderRadius: 'var(--radius-sm)', textDecoration: 'none', fontSize: 13,
                fontWeight: isActive ? 500 : 400, marginBottom: 2,
                background: isActive ? 'var(--teal-light)' : 'transparent',
                color: isActive ? 'var(--teal-dark)' : 'var(--gray-600)',
              })}>
              <span style={{ fontSize: 15 }}>{item.icon}</span>
              {item.label}
              {item.ai && <span style={{ marginLeft: 'auto', fontSize: 9, background: 'var(--purple-light)', color: 'var(--purple)', padding: '1px 5px', borderRadius: 8, fontWeight: 500 }}>AI</span>}
            </NavLink>
          ))}
        </nav>

        <div style={{ padding: '12px 16px', borderTop: 'var(--border)', display: 'flex', alignItems: 'center', gap: 9 }}>
          <div style={{ width: 30, height: 30, borderRadius: '50%', background: 'var(--teal-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 600, color: 'var(--teal-dark)', flexShrink: 0 }}>
            {user?.name?.split(' ').map(n => n[0]).join('').slice(0, 2)}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 12, fontWeight: 500, color: 'var(--gray-900)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{user?.name}</div>
            <div style={{ fontSize: 10, color: 'var(--gray-400)', textTransform: 'capitalize' }}>{user?.role}</div>
          </div>
          <button onClick={handleLogout} title="Logout" style={{ background: 'none', border: 'none', color: 'var(--gray-400)', fontSize: 16, cursor: 'pointer', padding: 4 }}>⏻</button>
        </div>
      </aside>

      <main style={{ flex: 1, overflowY: 'auto', minHeight: '100vh' }}>
        {children}
      </main>
    </div>
  );
}
