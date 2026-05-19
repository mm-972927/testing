import { useEffect, useState } from 'react';
import api from '../../lib/api';

const THRUST = ['Technology','Delivery','Quality','Learning & Development','People','Customer','Finance'];
const UOM_LABELS = { percent:'% (higher better)', numeric:'Number', timeline:'Timeline/Date', zero:'Zero-based', max:'Lower is better' };

export default function SharedGoals() {
  const [team, setTeam] = useState([]);
  const [form, setForm] = useState({ title:'', description:'', thrustArea:'Technology', uom:'percent', target:'', userIds:[] });
  const [saving, setSaving] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError]   = useState('');

  useEffect(() => { api.get('/users').then(r => setTeam(r.data)); }, []);

  const toggleUser = (id) => setForm(f => ({
    ...f, userIds: f.userIds.includes(id) ? f.userIds.filter(x=>x!==id) : [...f.userIds, id]
  }));

  const push = async () => {
    if (!form.title || !form.target || !form.userIds.length) return setError('Fill all fields and select at least one recipient.');
    setSaving(true); setError(''); setResult(null);
    try {
      const { data } = await api.post('/goals/shared', { ...form, target: Number(form.target) });
      setResult(data);
      setForm(f => ({ ...f, title:'', description:'', target:'', userIds:[] }));
    } catch(e) { setError(e.response?.data?.error || 'Failed to push shared goal'); }
    finally { setSaving(false); }
  };

  return (
    <div style={{ padding: 28, maxWidth: 780 }}>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 20, fontWeight: 600 }}>Push shared KPI</h1>
        <p style={{ fontSize: 13, color: 'var(--gray-600)', marginTop: 3 }}>Push a departmental KPI goal to multiple employees. Recipients can only adjust weightage.</p>
      </div>

      {result && (
        <div style={{ background: 'var(--teal-light)', border: '1px solid var(--teal)', borderRadius: 'var(--radius)', padding: '12px 16px', marginBottom: 20, fontSize: 13, color: 'var(--teal-dark)', fontWeight: 500 }}>
          ✓ Shared KPI pushed to {result.pushed} employee{result.pushed!==1?'s':''}
        </div>
      )}

      <div style={{ background: '#fff', border: 'var(--border)', borderRadius: 'var(--radius)', padding: 24 }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 14 }}>
          <div style={{ gridColumn: '1/-1' }}>
            <label style={{ fontSize: 11, fontWeight: 600, color: 'var(--gray-600)', display: 'block', marginBottom: 4 }}>Goal title *</label>
            <input value={form.title} onChange={e=>setForm(f=>({...f,title:e.target.value}))} placeholder="e.g. Achieve Q2 customer NPS target"
              style={{ width:'100%', padding:'9px 11px', border:'var(--border)', borderRadius:'var(--radius-sm)', fontSize:13 }} />
          </div>
          <div style={{ gridColumn: '1/-1' }}>
            <label style={{ fontSize: 11, fontWeight: 600, color: 'var(--gray-600)', display: 'block', marginBottom: 4 }}>Description</label>
            <textarea value={form.description} onChange={e=>setForm(f=>({...f,description:e.target.value}))} rows={2} placeholder="What does success look like?"
              style={{ width:'100%', padding:'9px 11px', border:'var(--border)', borderRadius:'var(--radius-sm)', fontSize:13, resize:'none' }} />
          </div>
          <div>
            <label style={{ fontSize: 11, fontWeight: 600, color: 'var(--gray-600)', display: 'block', marginBottom: 4 }}>Thrust area</label>
            <select value={form.thrustArea} onChange={e=>setForm(f=>({...f,thrustArea:e.target.value}))} style={{ width:'100%', padding:'9px 11px', border:'var(--border)', borderRadius:'var(--radius-sm)', fontSize:13 }}>
              {THRUST.map(t=><option key={t}>{t}</option>)}
            </select>
          </div>
          <div>
            <label style={{ fontSize: 11, fontWeight: 600, color: 'var(--gray-600)', display: 'block', marginBottom: 4 }}>Unit of measure</label>
            <select value={form.uom} onChange={e=>setForm(f=>({...f,uom:e.target.value}))} style={{ width:'100%', padding:'9px 11px', border:'var(--border)', borderRadius:'var(--radius-sm)', fontSize:13 }}>
              {Object.entries(UOM_LABELS).map(([k,v])=><option key={k} value={k}>{v}</option>)}
            </select>
          </div>
          <div>
            <label style={{ fontSize: 11, fontWeight: 600, color: 'var(--gray-600)', display: 'block', marginBottom: 4 }}>Target *</label>
            <input value={form.target} onChange={e=>setForm(f=>({...f,target:e.target.value}))} placeholder="e.g. 80"
              style={{ width:'100%', padding:'9px 11px', border:'var(--border)', borderRadius:'var(--radius-sm)', fontSize:13 }} />
          </div>
          <div style={{ display:'flex', alignItems:'center', gap:6, paddingTop:20 }}>
            <div style={{ width:10, height:10, borderRadius:'50%', background:'var(--purple)', flexShrink:0 }} />
            <span style={{ fontSize:12, color:'var(--gray-600)' }}>Recipients can only adjust weightage — title & target are locked</span>
          </div>
        </div>

        <div style={{ marginBottom: 16 }}>
          <label style={{ fontSize: 11, fontWeight: 600, color: 'var(--gray-600)', display: 'block', marginBottom: 8 }}>Select recipients * ({form.userIds.length} selected)</label>
          <div style={{ display:'flex', flexWrap:'wrap', gap:8 }}>
            {team.filter(u=>u.role==='employee').map(u => (
              <div key={u.id} onClick={()=>toggleUser(u.id)}
                style={{ display:'flex', alignItems:'center', gap:7, padding:'7px 12px', borderRadius:'var(--radius-sm)', cursor:'pointer', border: form.userIds.includes(u.id)?'1.5px solid var(--teal)':'var(--border)', background:form.userIds.includes(u.id)?'var(--teal-light)':'#fff' }}>
                <div style={{ width:22, height:22, borderRadius:'50%', background:form.userIds.includes(u.id)?'var(--teal)':'var(--gray-100)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:9, fontWeight:700, color:form.userIds.includes(u.id)?'#fff':'var(--gray-600)' }}>
                  {u.name.split(' ').map(n=>n[0]).join('').slice(0,2)}
                </div>
                <span style={{ fontSize:12, fontWeight:500, color:form.userIds.includes(u.id)?'var(--teal-dark)':'var(--gray-700)' }}>{u.name}</span>
              </div>
            ))}
          </div>
        </div>

        {error && <p style={{ fontSize:12, color:'var(--red)', marginBottom:12 }}>{error}</p>}

        <button onClick={push} disabled={saving}
          style={{ padding:'10px 24px', background:saving?'var(--gray-200)':'var(--teal)', color:saving?'var(--gray-600)':'#fff', border:'none', borderRadius:'var(--radius-sm)', fontWeight:700, fontSize:13, cursor:'pointer' }}>
          {saving ? 'Pushing…' : '↑ Push KPI to selected employees'}
        </button>
      </div>
    </div>
  );
}
