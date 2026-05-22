import { useState, useEffect } from 'react';
import api from '../../lib/api';

const UOM   = ['percent','numeric','timeline','zero','max'];
const UOM_L = { percent:'% (higher=better)', numeric:'Number (higher=better)', timeline:'Timeline/Date', zero:'Zero-based (0 = win)', max:'Lower=better' };
const THRUST = ['Technology','Delivery','Quality','Learning & Development','People','Customer','Finance'];
const Q_LABELS = { q1:'Q1 Jul', q2:'Q2 Oct', q3:'Q3 Jan', q4:'Q4 Apr' };
const STATUS_OPTS = ['Not Started','On Track','Completed'];

function scoreGoal(g, q) {
  const a = g.achievements[q];
  if (a === null || a === undefined) return null;
  if (g.uom==='percent'||g.uom==='numeric') return Math.min(100,Math.round(a/g.target*100));
  if (g.uom==='max') return a===0?100:Math.min(100,Math.round(g.target/a*100));
  if (g.uom==='zero') return a===0?100:0;
  return 100;
}

export default function Goals() {
  const [goals,    setGoals]   = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [form,     setForm]    = useState({ title:'', description:'', thrustArea:'Technology', uom:'percent', target:'', weightage:'' });
  const [saving,   setSaving]  = useState(false);
  const [error,    setError]   = useState('');
  const [toast,    setToast]   = useState('');

  const load = () => api.get('/goals').then(r => setGoals(r.data));
  useEffect(() => { load(); }, []);

  const showToast = msg => { setToast(msg); setTimeout(()=>setToast(''), 3000); };
  const totalWeight = goals.reduce((s,g) => s+g.weightage, 0);

  const submit = async e => {
    e.preventDefault(); setSaving(true); setError('');
    try {
      await api.post('/goals', { ...form, target:Number(form.target), weightage:Number(form.weightage) });
      setForm({ title:'', description:'', thrustArea:'Technology', uom:'percent', target:'', weightage:'' });
      setShowForm(false); load(); showToast('Goal added ✓');
    } catch(err) { setError(err.response?.data?.error || 'Failed to save'); }
    finally { setSaving(false); }
  };

  const submitAll = async () => {
    try { await api.post('/goals/submit-all'); load(); showToast('All goals submitted for approval ✓'); }
    catch(err) { showToast(err.response?.data?.error || 'Cannot submit'); }
  };

  const updateAchievement = async (goal, q, val) => {
    try {
      await api.put(`/goals/${goal.id}`, { achievements:{ ...goal.achievements, [q]:val===''?null:Number(val) } });
      load();
    } catch(e) { showToast(e.response?.data?.error || 'Update failed'); }
  };

  const updateStatus = async (goal, q, status) => {
    try { await api.put(`/goals/${goal.id}`, { checkInStatus:{ ...goal.checkInStatus, [q]:status } }); load(); }
    catch {}
  };

  const deleteGoal = async id => {
    if (!confirm('Delete this goal?')) return;
    try { await api.delete(`/goals/${id}`); load(); showToast('Goal deleted'); }
    catch(e) { showToast(e.response?.data?.error || 'Cannot delete'); }
  };

  const inp = { width:'100%', padding:'8px 10px', border:'0.5px solid #D3D1C7', borderRadius:6, fontSize:13, outline:'none', background:'#fff' };

  return (
    <div style={{ padding:28 }}>

      {toast && <div style={{ position:'fixed', top:20, left:'50%', transform:'translateX(-50%)', background:'#1A1A18', color:'#fff', padding:'9px 20px', borderRadius:8, fontSize:13, zIndex:999, boxShadow:'0 4px 20px rgba(0,0,0,0.2)' }}>{toast}</div>}

      {/* Header */}
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:20 }}>
        <div>
          <h1 style={{ fontSize:20, fontWeight:600 }}>My goals</h1>
          <p style={{ fontSize:13, color:'var(--gray-600)', marginTop:3 }}>
            {goals.length}/8 goals · Weightage: {' '}
            <strong style={{ color: totalWeight===100?'var(--teal)':totalWeight>100?'var(--red)':'var(--amber)' }}>{totalWeight}%</strong>
            {totalWeight!==100 && <span style={{ color:'var(--gray-400)', fontSize:12 }}> (needs to equal 100% before submitting)</span>}
          </p>
        </div>
        <div style={{ display:'flex', gap:8 }}>
          {goals.some(g=>g.status==='draft') && (
            <button onClick={submitAll}
              style={{ padding:'8px 16px', background:'var(--teal-light)', color:'var(--teal-dark)', border:'1px solid var(--teal)', borderRadius:'var(--radius-sm)', fontSize:13, fontWeight:600, cursor:'pointer' }}>
              Submit all for approval
            </button>
          )}
          <button onClick={() => setShowForm(s=>!s)}
            style={{ padding:'8px 18px', background:'var(--teal)', color:'#fff', border:'none', borderRadius:'var(--radius-sm)', fontSize:13, fontWeight:700, cursor:'pointer' }}>
            {showForm ? '✕ Cancel' : '+ Add goal'}
          </button>
        </div>
      </div>

      {/* Add goal form */}
      {showForm && (
        <div style={{ background:'#fff', border:'1.5px solid var(--teal)', borderRadius:'var(--radius)', padding:22, marginBottom:18 }}>
          <h2 style={{ fontSize:14, fontWeight:600, marginBottom:16 }}>New goal</h2>
          <form onSubmit={submit}>
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12, marginBottom:12 }}>
              <div style={{ gridColumn:'1/-1' }}>
                <label style={{ fontSize:11, fontWeight:600, color:'var(--gray-600)', display:'block', marginBottom:4 }}>Goal title *</label>
                <input value={form.title} onChange={e=>setForm(f=>({...f,title:e.target.value}))} required placeholder="e.g. Increase API response time efficiency by 40%" style={inp} />
              </div>
              <div style={{ gridColumn:'1/-1' }}>
                <label style={{ fontSize:11, fontWeight:600, color:'var(--gray-600)', display:'block', marginBottom:4 }}>Description</label>
                <textarea value={form.description} onChange={e=>setForm(f=>({...f,description:e.target.value}))} rows={2} placeholder="What does success look like?" style={{...inp,resize:'none'}} />
              </div>
              <div>
                <label style={{ fontSize:11, fontWeight:600, color:'var(--gray-600)', display:'block', marginBottom:4 }}>Thrust area *</label>
                <select value={form.thrustArea} onChange={e=>setForm(f=>({...f,thrustArea:e.target.value}))} style={{...inp,cursor:'pointer'}}>
                  {THRUST.map(t=><option key={t}>{t}</option>)}
                </select>
              </div>
              <div>
                <label style={{ fontSize:11, fontWeight:600, color:'var(--gray-600)', display:'block', marginBottom:4 }}>Unit of measure *</label>
                <select value={form.uom} onChange={e=>setForm(f=>({...f,uom:e.target.value}))} style={{...inp,cursor:'pointer'}}>
                  {UOM.map(u=><option key={u} value={u}>{UOM_L[u]}</option>)}
                </select>
              </div>
              <div>
                <label style={{ fontSize:11, fontWeight:600, color:'var(--gray-600)', display:'block', marginBottom:4 }}>Target *</label>
                <input value={form.target} onChange={e=>setForm(f=>({...f,target:e.target.value}))} required placeholder={form.uom==='timeline'?'2025-09-30':'e.g. 40'} style={inp} />
              </div>
              <div>
                <label style={{ fontSize:11, fontWeight:600, color:'var(--gray-600)', display:'block', marginBottom:4 }}>Weightage % (min 10%) *</label>
                <input value={form.weightage} onChange={e=>setForm(f=>({...f,weightage:e.target.value}))} required type="number" min={10} max={100} placeholder="e.g. 25" style={inp} />
              </div>
            </div>
            {error && <p style={{ color:'var(--red)', fontSize:12, marginBottom:10 }}>{error}</p>}
            <div style={{ display:'flex', gap:8 }}>
              <button type="submit" disabled={saving}
                style={{ padding:'9px 22px', background:'var(--teal)', color:'#fff', border:'none', borderRadius:6, fontSize:13, fontWeight:700, cursor:'pointer' }}>
                {saving?'Saving…':'Save goal'}
              </button>
              <button type="button" onClick={()=>setShowForm(false)}
                style={{ padding:'9px 16px', background:'none', border:'var(--border)', borderRadius:6, fontSize:13, color:'var(--gray-600)', cursor:'pointer' }}>
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Goals list */}
      <div style={{ display:'flex', flexDirection:'column', gap:14 }}>
        {goals.map(g => {
          const locked   = g.status === 'approved';
          const isShared = g.isShared;
          return (
            <div key={g.id} style={{ background:'#fff', border:'var(--border)', borderRadius:'var(--radius)', padding:20 }}>
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:12 }}>
                <div style={{ flex:1 }}>
                  <div style={{ display:'flex', alignItems:'center', gap:7, marginBottom:4, flexWrap:'wrap' }}>
                    <span style={{ fontSize:14, fontWeight:700 }}>{g.title}</span>
                    <span style={{ fontSize:10, padding:'2px 8px', borderRadius:20, fontWeight:600,
                      background: g.status==='approved'?'var(--teal-light)':g.status==='submitted'?'var(--amber-light)':'var(--gray-100)',
                      color:      g.status==='approved'?'var(--teal-dark)':g.status==='submitted'?'var(--amber-text)':'var(--gray-600)' }}>
                      {g.status}
                    </span>
                    {isShared && <span style={{ fontSize:10, padding:'2px 8px', borderRadius:20, background:'var(--purple-light)', color:'var(--purple)', fontWeight:500 }}>Shared KPI</span>}
                    {locked    && <span style={{ fontSize:10, padding:'2px 7px', borderRadius:20, background:'#F1EFE8', color:'var(--gray-600)' }}>🔒 Locked</span>}
                  </div>
                  {g.description && <div style={{ fontSize:12, color:'var(--gray-600)', marginBottom:4, lineHeight:1.5 }}>{g.description}</div>}
                  <div style={{ fontSize:11, color:'var(--gray-400)' }}>{g.thrustArea} · Target: {g.target} ({g.uom}) · Weight: {g.weightage}%</div>
                </div>
                {g.status==='draft' && (
                  <button onClick={()=>deleteGoal(g.id)}
                    style={{ color:'var(--red)', background:'none', border:'none', fontSize:20, cursor:'pointer', padding:'0 4px', lineHeight:1 }}>×</button>
                )}
              </div>

              {/* Quarterly grid */}
              <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:8 }}>
                {Object.entries(Q_LABELS).map(([q,label]) => {
                  const s   = scoreGoal(g,q);
                  const val = g.achievements[q];
                  const canEdit = locked && (!isShared || g.userId === g.userId); // employee can always enter actuals on approved goals
                  return (
                    <div key={q} style={{ background:'var(--gray-50)', borderRadius:'var(--radius-sm)', padding:'10px 11px', border:'var(--border)' }}>
                      <div style={{ fontSize:10, fontWeight:600, color:'var(--gray-400)', marginBottom:5 }}>{label}</div>
                      {locked ? (
                        <input
                          type="number"
                          defaultValue={val??''}
                          placeholder="Enter actual"
                          onBlur={e => {
                            const newVal = e.target.value===''?null:Number(e.target.value);
                            if (newVal !== (val??null)) updateAchievement(g, q, e.target.value);
                          }}
                          style={{ width:'100%', padding:'4px 7px', border:'var(--border)', borderRadius:4, fontSize:12, background:'#fff', outline:'none' }}
                        />
                      ) : (
                        <div style={{ fontSize:13, color:'var(--gray-400)', fontStyle:'italic', paddingTop:2 }}>Pending approval</div>
                      )}
                      {s!==null && (
                        <>
                          <div style={{ height:3, background:'var(--gray-200)', borderRadius:2, marginTop:5 }}>
                            <div style={{ height:'100%', width:`${Math.min(s,100)}%`, borderRadius:2, background:s>=70?'var(--teal)':s>=50?'var(--amber)':'var(--red)' }} />
                          </div>
                          <div style={{ fontSize:10, fontWeight:600, marginTop:3, color:s>=70?'var(--teal)':s>=50?'var(--amber)':'var(--red)' }}>{s}%</div>
                        </>
                      )}
                      {locked && (
                        <select value={g.checkInStatus[q]} onChange={e=>updateStatus(g,q,e.target.value)}
                          style={{ width:'100%', fontSize:10, padding:'3px 4px', border:'var(--border)', borderRadius:4, background:'#fff', marginTop:4 }}>
                          {STATUS_OPTS.map(o=><option key={o}>{o}</option>)}
                        </select>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Shared goal info */}
              {isShared && (
                <div style={{ marginTop:10, padding:'7px 11px', background:'var(--purple-light)', borderRadius:'var(--radius-sm)', fontSize:11, color:'var(--purple)', display:'flex', alignItems:'center', gap:6 }}>
                  <span>ℹ</span>
                  This is a shared KPI — title and target are set by your manager. You can only adjust the weightage.
                  Achievements sync with the team.
                </div>
              )}
            </div>
          );
        })}

        {goals.length===0 && (
          <div style={{ textAlign:'center', padding:'60px 0', color:'var(--gray-400)' }}>
            <div style={{ fontSize:36, marginBottom:10 }}>◎</div>
            <div style={{ fontSize:15, fontWeight:500, marginBottom:4 }}>No goals yet</div>
            <div style={{ fontSize:13, marginBottom:18 }}>Click "Add goal" to get started, or use the AI Assistant</div>
            <button onClick={()=>setShowForm(true)}
              style={{ padding:'9px 22px', background:'var(--teal)', color:'#fff', border:'none', borderRadius:6, fontSize:13, fontWeight:600, cursor:'pointer' }}>
              + Add your first goal
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
