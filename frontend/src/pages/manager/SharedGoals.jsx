import { useEffect, useState } from 'react';
import api from '../../lib/api';

const THRUST = ['Technology','Delivery','Quality','Learning & Development','People','Customer','Finance'];
const UOM_L  = { percent:'% (higher=better)', numeric:'Number (higher=better)', timeline:'Timeline/Date', zero:'Zero-based', max:'Lower=better' };

export default function SharedGoals() {
  const [team,   setTeam]   = useState([]);
  const [form,   setForm]   = useState({ title:'', description:'', thrustArea:'Technology', uom:'percent', target:'', userIds:[] });
  const [saving, setSaving] = useState(false);
  const [result, setResult] = useState(null);
  const [error,  setError]  = useState('');
  const [pushed, setPushed] = useState([]);   // history

  useEffect(() => { api.get('/users').then(r => setTeam(r.data)); }, []);

  const employees = team.filter(u => u.role === 'employee');

  const toggleUser = id => setForm(f => ({
    ...f, userIds: f.userIds.includes(id) ? f.userIds.filter(x=>x!==id) : [...f.userIds, id]
  }));
  const toggleAll = () => setForm(f => ({
    ...f, userIds: f.userIds.length === employees.length ? [] : employees.map(e=>e.id)
  }));

  const push = async () => {
    if (!form.title.trim()) return setError('Goal title is required.');
    if (!form.target)        return setError('Target value is required.');
    if (!form.userIds.length) return setError('Select at least one recipient.');
    setSaving(true); setError(''); setResult(null);
    try {
      const { data } = await api.post('/goals/shared', { ...form, target: Number(form.target) });
      setResult(data);
      setPushed(p => [{ ...form, pushed: data.pushed, at: new Date().toLocaleString() }, ...p]);
      setForm(f => ({ ...f, title:'', description:'', target:'', userIds:[] }));
    } catch(e) { setError(e.response?.data?.error || 'Failed to push shared goal'); }
    finally { setSaving(false); }
  };

  const inp = { width:'100%', padding:'9px 11px', border:'0.5px solid #D3D1C7', borderRadius:6, fontSize:13, outline:'none', background:'#fff' };

  return (
    <div style={{ padding:28 }}>
      <div style={{ marginBottom:24 }}>
        <h1 style={{ fontSize:20, fontWeight:600 }}>Push shared KPI goal</h1>
        <p style={{ fontSize:13, color:'var(--gray-600)', marginTop:3, lineHeight:1.6 }}>
          Push a departmental KPI to multiple employees.<br/>
          <strong>Title</strong> and <strong>Target</strong> are locked for recipients — they can only adjust weightage.
          Achievements sync across all linked copies.
        </p>
      </div>

      {result && (
        <div style={{ background:'var(--teal-light)', border:'1px solid var(--teal)', borderRadius:'var(--radius)', padding:'12px 16px', marginBottom:20, fontSize:13, color:'var(--teal-dark)', fontWeight:500, display:'flex', alignItems:'center', gap:10 }}>
          <span style={{ fontSize:18 }}>✓</span>
          Shared KPI pushed to <strong>{result.pushed}</strong> employee{result.pushed!==1?'s':''}. They can now set their weightage.
        </div>
      )}

      <div style={{ display:'grid', gridTemplateColumns:'1.2fr 1fr', gap:20 }}>

        {/* Form */}
        <div style={{ background:'#fff', border:'var(--border)', borderRadius:'var(--radius)', padding:24 }}>
          <h2 style={{ fontSize:14, fontWeight:600, marginBottom:16 }}>KPI details</h2>

          <div style={{ marginBottom:12 }}>
            <label style={{ fontSize:11, fontWeight:600, color:'var(--gray-600)', display:'block', marginBottom:5 }}>Goal title * <span style={{ fontWeight:400, color:'var(--purple)' }}>(locked for recipients)</span></label>
            <input value={form.title} onChange={e=>setForm(f=>({...f,title:e.target.value}))} placeholder="e.g. Achieve Q3 Customer NPS ≥ 70" style={inp}
              onFocus={e=>e.target.style.borderColor='var(--teal)'} onBlur={e=>e.target.style.borderColor='#D3D1C7'} />
          </div>

          <div style={{ marginBottom:12 }}>
            <label style={{ fontSize:11, fontWeight:600, color:'var(--gray-600)', display:'block', marginBottom:5 }}>Description</label>
            <textarea value={form.description} onChange={e=>setForm(f=>({...f,description:e.target.value}))} rows={2} placeholder="Context or success criteria…"
              style={{...inp, resize:'none'}}
              onFocus={e=>e.target.style.borderColor='var(--teal)'} onBlur={e=>e.target.style.borderColor='#D3D1C7'} />
          </div>

          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10, marginBottom:12 }}>
            <div>
              <label style={{ fontSize:11, fontWeight:600, color:'var(--gray-600)', display:'block', marginBottom:5 }}>Thrust area</label>
              <select value={form.thrustArea} onChange={e=>setForm(f=>({...f,thrustArea:e.target.value}))} style={{...inp,cursor:'pointer'}}>
                {THRUST.map(t=><option key={t}>{t}</option>)}
              </select>
            </div>
            <div>
              <label style={{ fontSize:11, fontWeight:600, color:'var(--gray-600)', display:'block', marginBottom:5 }}>Unit of measure</label>
              <select value={form.uom} onChange={e=>setForm(f=>({...f,uom:e.target.value}))} style={{...inp,cursor:'pointer'}}>
                {Object.entries(UOM_L).map(([k,v])=><option key={k} value={k}>{v}</option>)}
              </select>
            </div>
          </div>

          <div style={{ marginBottom:18 }}>
            <label style={{ fontSize:11, fontWeight:600, color:'var(--gray-600)', display:'block', marginBottom:5 }}>Target * <span style={{ fontWeight:400, color:'var(--purple)' }}>(locked for recipients)</span></label>
            <input value={form.target} onChange={e=>setForm(f=>({...f,target:e.target.value}))} placeholder="e.g. 70"
              style={inp} onFocus={e=>e.target.style.borderColor='var(--teal)'} onBlur={e=>e.target.style.borderColor='#D3D1C7'} />
          </div>

          {/* Info box */}
          <div style={{ padding:'10px 13px', background:'var(--purple-light)', borderRadius:'var(--radius-sm)', border:'0.5px solid var(--purple-mid)', fontSize:12, color:'var(--purple)', lineHeight:1.7, marginBottom:18 }}>
            <strong>How shared goals work:</strong><br/>
            • Recipients see this goal in their goal sheet as read-only (title + target locked)<br/>
            • They can only change <strong>weightage</strong><br/>
            • When one employee updates Q1/Q2 actuals, it syncs to all copies
          </div>

          {error && <div style={{ marginBottom:12, padding:'8px 12px', background:'var(--red-light)', border:'0.5px solid var(--red)', borderRadius:6, fontSize:12, color:'var(--red)' }}>{error}</div>}

          <button onClick={push} disabled={saving}
            style={{ width:'100%', padding:'11px', background:saving?'var(--gray-200)':'var(--teal)', color:saving?'var(--gray-600)':'#fff', border:'none', borderRadius:6, fontWeight:700, fontSize:14, cursor:'pointer' }}>
            {saving ? '↑ Pushing…' : `↑ Push KPI to ${form.userIds.length || 0} employee${form.userIds.length!==1?'s':''}`}
          </button>
        </div>

        {/* Recipients */}
        <div>
          <div style={{ background:'#fff', border:'var(--border)', borderRadius:'var(--radius)', padding:20, marginBottom:14 }}>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:12 }}>
              <h2 style={{ fontSize:14, fontWeight:600 }}>Recipients <span style={{ fontWeight:400, color:'var(--gray-400)', fontSize:12 }}>({form.userIds.length}/{employees.length} selected)</span></h2>
              <button onClick={toggleAll} style={{ fontSize:11, color:'var(--teal)', background:'none', border:'none', cursor:'pointer', fontWeight:600 }}>
                {form.userIds.length === employees.length ? 'Deselect all' : 'Select all'}
              </button>
            </div>
            <div style={{ display:'flex', flexDirection:'column', gap:6 }}>
              {employees.map(u => {
                const sel = form.userIds.includes(u.id);
                return (
                  <div key={u.id} onClick={()=>toggleUser(u.id)}
                    style={{ display:'flex', alignItems:'center', gap:10, padding:'9px 11px', borderRadius:'var(--radius-sm)', cursor:'pointer', border:sel?'1.5px solid var(--teal)':'var(--border)', background:sel?'var(--teal-light)':'#fff', transition:'all .12s' }}>
                    <div style={{ width:10, height:10, borderRadius:3, border:`2px solid ${sel?'var(--teal)':'#D3D1C7'}`, background:sel?'var(--teal)':'transparent', flexShrink:0, display:'flex', alignItems:'center', justifyContent:'center' }}>
                      {sel && <span style={{ color:'#fff', fontSize:8, lineHeight:1 }}>✓</span>}
                    </div>
                    <div style={{ width:26, height:26, borderRadius:'50%', background:sel?'var(--teal)':'var(--gray-100)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:10, fontWeight:700, color:sel?'#fff':'var(--gray-600)', flexShrink:0 }}>
                      {u.name.split(' ').map(n=>n[0]).join('').slice(0,2)}
                    </div>
                    <div style={{ flex:1 }}>
                      <div style={{ fontSize:13, fontWeight:500, color:sel?'var(--teal-dark)':'var(--gray-900)' }}>{u.name}</div>
                      <div style={{ fontSize:11, color:'var(--gray-400)' }}>{u.department}</div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Push history */}
          {pushed.length > 0 && (
            <div style={{ background:'#fff', border:'var(--border)', borderRadius:'var(--radius)', padding:16 }}>
              <h3 style={{ fontSize:12, fontWeight:600, color:'var(--gray-600)', marginBottom:10 }}>Recent pushes</h3>
              {pushed.map((p,i) => (
                <div key={i} style={{ padding:'8px 0', borderBottom: i<pushed.length-1?'var(--border)':'none' }}>
                  <div style={{ fontSize:12, fontWeight:500, color:'var(--gray-900)', marginBottom:2 }}>{p.title}</div>
                  <div style={{ fontSize:11, color:'var(--gray-400)' }}>→ {p.pushed} employee{p.pushed!==1?'s':''} · {p.at}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
