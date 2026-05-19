import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

export default function SignOut() {
  const { logout, user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    // Auto-logout on mount
    logout();
  }, []);

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--gray-50)', padding: 24 }}>
      <div style={{ textAlign: 'center', maxWidth: 400 }}>
        {/* Logo */}
        <div style={{ width: 60, height: 60, background: 'var(--teal)', borderRadius: 16, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px' }}>
          <svg width="30" height="30" fill="none" viewBox="0 0 24 24">
            <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>

        <div style={{ fontSize: 40, marginBottom: 16 }}>👋</div>
        <h1 style={{ fontSize: 24, fontWeight: 700, color: 'var(--gray-900)', marginBottom: 8 }}>You've been signed out</h1>
        <p style={{ fontSize: 14, color: 'var(--gray-600)', lineHeight: 1.6, marginBottom: 32 }}>
          Thanks for using AtomQuest Goal Portal.<br/>Your session has been securely ended.
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <button onClick={() => navigate('/login')}
            style={{ padding: '12px 32px', background: 'var(--teal)', color: '#fff', border: 'none', borderRadius: 'var(--radius-sm)', fontSize: 14, fontWeight: 700, cursor: 'pointer' }}>
            Sign in again →
          </button>
          <p style={{ fontSize: 12, color: 'var(--gray-400)' }}>
            AtomQuest Hackathon 1.0 · AI-Powered Goal Portal
          </p>
        </div>
      </div>
    </div>
  );
}
