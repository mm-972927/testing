import { useEffect, useState } from 'react';
import api from '../../lib/api';

const DEPARTMENTS = ['Engineering','Product','Design','Sales','Marketing','Finance','HR','Operations','Customer Success','General'];
const ROLES = ['employee','manager','admin'];

export default function AdminUsers() {
  const [users,   setUsers]   = useState([]);
  const [showAdd, setShowAdd] = useState(false);
  const [form,    setForm]    = useState({ name:'', email:'', password:'', role:'manager', department:'Engineering', managerId:'' });
  const [saving,  setSaving]  = useState(false);
  const [error,   setError]   = useState('');
  const [toast,   setToast]   = useState('');

  const load = () => api.get('/users').then(r => setUsers(r.data));
  useEffect(() => { load(); }, []);

  const showToast = msg => { setToast(msg); setTimeout(() => setToast(''), 3000); };
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const createUser = async e => {
    e.preventDefault(); setError(''); setSaving(true);
    try {
      await api.post('/auth/create-user', { ...form, managerId: form.managerId || null });
      setShowAdd(false);
      setForm({ name:'', email:'', password:'', role:'manager', department:'Engineering', managerId:'' });
      load(); showToast('User created ✓');
    } catch(err) { setError(err.response?.data?.error || 'Failed to create user'); }
    finally { setSaving(false); }
  };

  const managers = users.filter(u => u.role === 'manager');
  const inp = { width:'100%', padding:'9px 11px', border:'0.5px solid #D3D1C7', borderRadius:6, fontSize:13, outline:'none', background:'#fff' };

  return (
    <div style={{ padding:28 }}>
      {toast && <div style={{ position:'fixed', top:20, left:'50%', transform:'translateX(-50%)', background:'#1A1A18', color:'#fff', padding:'9px 20px', borderRadius:8, fontSize:13, zIndex:999, boxShadow:'0 4px 20px rgba(0,0,0,0.2)' }}>{toast}</div>}

      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:24 }}>
        <div>
          <h1 style={{ fontSize:20, fontWeight:600 }}>All employees</h1>
          <p style={{ fontSize:13, color:'var(--gray-600)', marginTop:3 }}>{users.length} users in system</p>
        </div>
        <button onClick={() => setShowAdd(s => !s)}
          style={{ padding:'9px 18px', background:'var(--teal)', color:'#fff', border:'none', borderRadius:'var(--radius-sm)', fontWeight:600, fontSize:13, cursor:'pointer' }}>
          {showAdd ? '✕ Cancel' : '+ Create user'}
        </button>
      </div>

      {/* Create user form */}
      {showAdd && (
        <div style={{ background:'#fff', border:'1.5px solid var(--teal)', borderRadius:'var(--radius)', padding:24, marginBottom:20 }}>
          <h2 style={{ fontSize:14, fontWeight:600, marginBottom:4 }}>Create new user (Admin only)</h2>
          <p style={{ fontSize:12, color:'var(--gray-600)', marginBottom:16 }}>
            Employees self-register at <strong>/register</strong>. Use this form to create Manager or Admin accounts.
          </p>
          <form onSubmit={createUser}>
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12, marginBottom:12 }}>
              <div>
                <label style={{ fontSize:11, fontWeight:600, color:'var(--gray-600)', display:'block', marginBottom:4 }}>Full name *</label>
                <input value={form.name} onChange={e=>set('name',e.target.value)} required placeholder="Priya Mehta" style={inp} />
              </div>
              <div>
                <label style={{ fontSize:11, fontWeight:600, color:'var(--gray-600)', display:'block', marginBottom:4 }}>Work email *</label>
                <input value={form.email} onChange={e=>set('email',e.target.value)} type="email" required placeholder="priya@company.com" style={inp} />
              </div>
              <div>
                <label style={{ fontSize:11, fontWeight:600, color:'var(--gray-600)', display:'block', marginBottom:4 }}>Password * (min 6)</label>
                <input value={form.password} onChange={e=>set('password',e.target.value)} type="password" required placeholder="Set a secure password" style={inp} />
              </div>
              <div>
                <label style={{ fontSize:11, fontWeight:600, color:'var(--gray-600)', display:'block', marginBottom:4 }}>Role *</label>
                <select value={form.role} onChange={e=>set('role',e.target.value)} style={{...inp,cursor:'pointer'}}>
                  {ROLES.map(r => <option key={r} value={r}>{r.charAt(0).toUpperCase()+r.slice(1)}</option>)}
                </select>
              </div>
              <div>
                <label style={{ fontSize:11, fontWeight:600, color:'var(--gray-600)', display:'block', marginBottom:4 }}>Department</label>
                <select value={form.department} onChange={e=>set('department',e.target.value)} style={{...inp,cursor:'pointer'}}>
                  {DEPARTMENTS.map(d => <option key={d}>{d}</option>)}
                </select>
              </div>
              {form.role === 'employee' && (
                <div>
                  <label style={{ fontSize:11, fontWeight:600, color:'var(--gray-600)', display:'block', marginBottom:4 }}>Reports to (Manager)</label>
                  <select value={form.managerId} onChange={e=>set('managerId',e.target.value)} style={{...inp,cursor:'pointer'}}>
                    <option value="">— Unassigned —</option>
                    {managers.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
                  </select>
                </div>
              )}
            </div>
            {error && <div style={{ marginBottom:12, padding:'8px 12px', background:'var(--red-light)', border:'0.5px solid var(--red)', borderRadius:6, fontSize:12, color:'var(--red)' }}>{error}</div>}
            <button type="submit" disabled={saving}
              style={{ padding:'9px 22px', background:'var(--teal)', color:'#fff', border:'none', borderRadius:6, fontSize:13, fontWeight:700, cursor:'pointer' }}>
              {saving ? 'Creating…' : 'Create user'}
            </button>
          </form>
        </div>
      )}

      {/* Users table */}
      <div style={{ background:'#fff', border:'var(--border)', borderRadius:'var(--radius)', overflow:'hidden' }}>
        <table style={{ width:'100%', borderCollapse:'collapse' }}>
          <thead>
            <tr style={{ background:'var(--gray-50)', borderBottom:'var(--border)' }}>
              {['Name','Email','Role','Department','Manager'].map(h => (
                <th key={h} style={{ padding:'10px 16px', textAlign:'left', fontSize:11, fontWeight:600, color:'var(--gray-600)' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {users.map((u, i) => {
              const mgr = users.find(m => m.id === u.managerId);
              return (
                <tr key={u.id} style={{ borderBottom: i < users.length-1 ? 'var(--border)' : 'none' }}>
                  <td style={{ padding:'12px 16px' }}>
                    <div style={{ display:'flex', alignItems:'center', gap:10 }}>
                      <div style={{ width:30, height:30, borderRadius:'50%', background:'var(--teal-light)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:11, fontWeight:700, color:'var(--teal-dark)', flexShrink:0 }}>
                        {u.name.split(' ').map(n=>n[0]).join('').slice(0,2)}
                      </div>
                      <span style={{ fontSize:13, fontWeight:500 }}>{u.name}</span>
                    </div>
                  </td>
                  <td style={{ padding:'12px 16px', fontSize:13, color:'var(--gray-600)' }}>{u.email}</td>
                  <td style={{ padding:'12px 16px' }}>
                    <span style={{ fontSize:11, padding:'2px 9px', borderRadius:20, fontWeight:500,
                      background: u.role==='admin'?'var(--purple-light)':u.role==='manager'?'var(--amber-light)':'var(--teal-light)',
                      color:      u.role==='admin'?'var(--purple)':u.role==='manager'?'var(--amber-text)':'var(--teal-dark)' }}>
                      {u.role}
                    </span>
                  </td>
                  <td style={{ padding:'12px 16px', fontSize:13, color:'var(--gray-600)' }}>{u.department}</td>
                  <td style={{ padding:'12px 16px', fontSize:13, color:'var(--gray-600)' }}>{mgr?.name || '—'}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
