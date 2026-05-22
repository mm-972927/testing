import { createContext, useContext, useState, useEffect } from 'react';
import api from '../lib/api';

const AuthCtx = createContext(null);

export function AuthProvider({ children }) {
  const [user,    setUser]    = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('aq_token');
    if (!token) {
      setLoading(false);
      return;
    }
    // Verify token with backend
    api.get('/auth/me')
      .then(r => setUser(r.data))
      .catch(() => {
        // Token invalid or backend unreachable — clear it but don't hard-redirect
        // The Guard component will handle the redirect gracefully
        localStorage.removeItem('aq_token');
      })
      .finally(() => setLoading(false));
  }, []);

  const login = async (email, password) => {
    const { data } = await api.post('/auth/login', { email, password });
    localStorage.setItem('aq_token', data.token);
    setUser(data.user);
    return data.user;
  };

  const logout = () => {
    localStorage.removeItem('aq_token');
    setUser(null);
  };

  return (
    <AuthCtx.Provider value={{ user, login, logout, loading }}>
      {children}
    </AuthCtx.Provider>
  );
}

export const useAuth = () => useContext(AuthCtx);
