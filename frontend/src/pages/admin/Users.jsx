import { useEffect, useState } from 'react';
import api from '../../lib/api';

export default function AdminUsers() {
  const [users, setUsers] = useState([]);
  useEffect(() => { api.get('/users').then(r => setUsers(r.data)); }, []);

  return (
    <div style={{ padding: 28 }}>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 20, fontWeight: 600 }}>All employees</h1>
        <p style={{ fontSize: 13, color: 'var(--gray-600)', marginTop: 3 }}>{users.length} users in system</p>
      </div>
      <div style={{ background: '#fff', border: 'var(--border)', borderRadius: 'var(--radius)', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: 'var(--gray-50)', borderBottom: 'var(--border)' }}>
              {['Name', 'Email', 'Role', 'Department', 'Manager'].map(h => (
                <th key={h} style={{ padding: '10px 16px', textAlign: 'left', fontSize: 11, fontWeight: 600, color: 'var(--gray-600)' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {users.map((u, i) => {
              const manager = users.find(m => m.id === u.managerId);
              return (
                <tr key={u.id} style={{ borderBottom: i < users.length - 1 ? 'var(--border)' : 'none' }}>
                  <td style={{ padding: '12px 16px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <div style={{ width: 30, height: 30, borderRadius: '50%', background: 'var(--teal-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 600, color: 'var(--teal-dark)' }}>
                        {u.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                      </div>
                      <span style={{ fontSize: 13, fontWeight: 500 }}>{u.name}</span>
                    </div>
                  </td>
                  <td style={{ padding: '12px 16px', fontSize: 13, color: 'var(--gray-600)' }}>{u.email}</td>
                  <td style={{ padding: '12px 16px' }}>
                    <span style={{ fontSize: 11, padding: '2px 9px', borderRadius: 20, fontWeight: 500,
                      background: u.role === 'admin' ? 'var(--purple-light)' : u.role === 'manager' ? 'var(--amber-light)' : 'var(--teal-light)',
                      color: u.role === 'admin' ? 'var(--purple)' : u.role === 'manager' ? 'var(--amber-text)' : 'var(--teal-dark)' }}>
                      {u.role}
                    </span>
                  </td>
                  <td style={{ padding: '12px 16px', fontSize: 13, color: 'var(--gray-600)' }}>{u.department}</td>
                  <td style={{ padding: '12px 16px', fontSize: 13, color: 'var(--gray-600)' }}>{manager?.name || '—'}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
