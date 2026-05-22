import { useEffect, useState } from 'react';
import api from '../../lib/api';

const THRUST = ['Technology','Delivery','Quality','Learning & Development','People','Customer','Finance'];
const UOM_L  = { percent:'%', numeric:'Number', timeline:'Date', zero:'Zero-based', max:'Lower=better' };

export default function Approvals() {
  const [team,    setTeam]    = useState([]);
  const [editing, setEditing] = useState({});   // goalId → {title,desc,...}
  const [acting,  setActing]  = useState({});
  const [toast,   setToast]   = useState('');

  const load = () => api.get('/goals/team').then(r => setTeam(r.data));
  useEffect(() => { load(); }, []);

  const pending = team.flatMap(m =>
    m.goals.filter(g => g.status === 'submitted').map(g => ({ ...g, employee: m.user }))
  );

  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(''), 3000); };

  const startEdit = g => setEditing(e => ({
    ...e, [g.id]: { title: g.title, description: g.description||'', thrustArea: g.thrustArea, uom: g.uom, target: g.target, weightage: g.weightage }
  }));
  const cancelEdit = id => setEditing(e => { const n={...e}; delete n[id]; return n; });

  const saveEdit = async (goalId) => {
    setActing(a=>({...a,[goalId]:'saving'}));
    try {
      await api.put(`/goals/${goalId}`, { ...editing[goalId], target: Number(editing[goalId].target), weightage: Number(editing[goalId].weightage) });
      cancelEdit(goalId); load(); showToast('Changes saved');
    } catch(e) { showToast(e.response?.data?.error || 'Save failed'); }
    finally { setActing(a=>({...a,[goalId]:null})); }
  };

  const act = async (goalId, status) => {
    setActing(a=>({...a,[goalId]:status}));
    try { await api.put(`/goals/${goalId}`, { status }); load(); showToast(status==='approved'?'Goal approved ✓':'Returned for rework'); }
    catch(e) { showToast(e.response?.data?.error || 'Action failed'); }
    finally { setActing(a=>({...a,[goalId]:null})); }
  };

  const inp = { padding:'7px 10px', border:'0.5px solid #D3D1C7', borderRadius:6, fontSize:13, width:'100%', background:'#fff', outline:'none' };

  return (
    <div style={{ padding:28 }}>
      {/* Toast */}
      {toast && (
        <div style={{ position:'fixed', top:20, left:'50%', transform:'translateX(-50%)', background:'#1A1A18', color:'#fff', padding:'9px 20px', borderRadius:8, fontSize:13, zIndex:999, boxShadow:'0 4px 20px rgba(0,0,0,0.2)' }}>
          {toast}
        </div>
      )}

      <div style={{ marginBottom:24 }}>
        <h1 style={{ fontSize:20, fontWeight:600 }}>Goal approvals</h1>
        <p style={{ fontSize:13, color:'var(--gray-600)', marginTop:3 }}>
          {pending.length} goal{pending.length!==1?'s':''} awaiting review · Edit any field inline before approving
        </p>
      </div>

      {pending.length === 0 ? (
        <div style={{ textAlign:'center', padding:'72px 0', color:'var(--gray-400)' }}>
          <div style={{ fontSize:36, marginBottom:10 }}>✓</div>
          <div style={{ fontSize:15, fontWeight:500, marginBottom:4 }}>All caught up!</div>
          <div style={{ fontSize:13 }}>No pending goal approvals.</div>
        </div>
      ) : (
        <div style={{ display:'flex', flexDirection:'column', gap:16 }}>
          {pending.map(g => {
            const isEditing = !!editing[g.id];
            const ed = editing[g.id] || {};
            return (
              <div key={g.id} style={{ background:'#fff', border: isEditing?'1.5px solid var(--teal)':'var(--border)', borderRadius:'var(--radius)', padding:22, transition:'border .15s' }}>

                {/* Header row */}
                <div style={{ display:'flex', alignItems:'flex-start', justifyContent:'space-between', marginBottom:14, gap:12 }}>
                  <div style={{ display:'flex', alignItems:'center', gap:9 }}>
                    <div style={{ width:32, height:32, borderRadius:'50%', background:'var(--teal-light)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:11, fontWeight:700, color:'var(--teal-dark)' }}>
                      {g.employee.name.split(' ').map(n=>n[0]).join('').slice(0,2)}
                    </div>
                    <div>
                      <div style={{ fontSize:13, fontWeight:600, color:'var(--gray-900)' }}>{g.employee.name}</div>
                      <div style={{ fontSize:11, color:'var(--gray-400)' }}>{g.employee.department}</div>
                    </div>
                  </div>

                  <div style={{ display:'flex', gap:7, flexShrink:0 }}>
                    {!isEditing ? (
                      <button onClick={()=>startEdit(g)}
                        style={{ padding:'7px 13px', background:'var(--gray-100)', color:'var(--gray-700)', border:'var(--border)', borderRadius:'var(--radius-sm)', fontSize:12, fontWeight:500, cursor:'pointer' }}>
                        ✎ Edit inline
                      </button>
                    ) : (
                      <>
                        <button onClick={()=>saveEdit(g.id)} disabled={acting[g.id]==='saving'}
                          style={{ padding:'7px 13px', background:'var(--teal)', color:'#fff', border:'none', borderRadius:'var(--radius-sm)', fontSize:12, fontWeight:600, cursor:'pointer' }}>
                          {acting[g.id]==='saving'?'Saving…':'✓ Save'}
                        </button>
                        <button onClick={()=>cancelEdit(g.id)}
                          style={{ padding:'7px 11px', background:'none', border:'var(--border)', borderRadius:'var(--radius-sm)', fontSize:12, cursor:'pointer', color:'var(--gray-600)' }}>
                          Cancel
                        </button>
                      </>
                    )}
                    <button onClick={()=>act(g.id,'draft')} disabled={!!acting[g.id]}
                      style={{ padding:'7px 13px', background:'var(--red-light)', color:'var(--red)', border:'0.5px solid var(--red)', borderRadius:'var(--radius-sm)', fontSize:12, fontWeight:500, cursor:'pointer' }}>
                      Return
                    </button>
                    <button onClick={()=>act(g.id,'approved')} disabled={!!acting[g.id]}
                      style={{ padding:'7px 18px', background:'var(--teal)', color:'#fff', border:'none', borderRadius:'var(--radius-sm)', fontSize:12, fontWeight:700, cursor:'pointer' }}>
                      {acting[g.id]==='approved'?'Approving…':'✓ Approve'}
                    </button>
                  </div>
                </div>

                {/* Content */}
                {!isEditing ? (
                  <>
                    <div style={{ fontSize:15, fontWeight:700, marginBottom:5 }}>{g.title}</div>
                    {g.description && <p style={{ fontSize:13, color:'var(--gray-600)', lineHeight:1.6, marginBottom:10 }}>{g.description}</p>}
                    <div style={{ display:'flex', gap:8, flexWrap:'wrap' }}>
                      <span style={{ fontSize:11, padding:'2px 9px', borderRadius:20, background:'var(--purple-light)', color:'var(--purple)', fontWeight:500 }}>{g.thrustArea}</span>
                      <span style={{ fontSize:11, padding:'2px 9px', borderRadius:20, background:'var(--gray-100)', color:'var(--gray-600)' }}>UoM: {UOM_L[g.uom]}</span>
                      <span style={{ fontSize:11, padding:'2px 9px', borderRadius:20, background:'var(--gray-100)', color:'var(--gray-600)' }}>Target: {g.target}</span>
                      <span style={{ fontSize:11, padding:'2px 9px', borderRadius:20, background:'var(--teal-light)', color:'var(--teal-dark)', fontWeight:600 }}>Weight: {g.weightage}%</span>
                      {g.isShared && <span style={{ fontSize:11, padding:'2px 9px', borderRadius:20, background:'var(--purple-light)', color:'var(--purple)' }}>Shared KPI</span>}
                    </div>
                  </>
                ) : (
                  /* Inline edit form — manager can edit ANY property before approving */
                  <div>
                    <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10, marginBottom:10 }}>
                      <div style={{ gridColumn:'1/-1' }}>
                        <label style={{ fontSize:11, fontWeight:600, color:'var(--gray-600)', display:'block', marginBottom:4 }}>Goal title</label>
                        <input style={inp} value={ed.title} onChange={e=>setEditing(ev=>({...ev,[g.id]:{...ed,title:e.target.value}}))} />
                      </div>
                      <div style={{ gridColumn:'1/-1' }}>
                        <label style={{ fontSize:11, fontWeight:600, color:'var(--gray-600)', display:'block', marginBottom:4 }}>Description</label>
                        <textarea style={{...inp,resize:'none'}} rows={2} value={ed.description} onChange={e=>setEditing(ev=>({...ev,[g.id]:{...ed,description:e.target.value}}))} />
                      </div>
                      <div>
                        <label style={{ fontSize:11, fontWeight:600, color:'var(--gray-600)', display:'block', marginBottom:4 }}>Thrust area</label>
                        <select style={{...inp,cursor:'pointer'}} value={ed.thrustArea} onChange={e=>setEditing(ev=>({...ev,[g.id]:{...ed,thrustArea:e.target.value}}))}>
                          {THRUST.map(t=><option key={t}>{t}</option>)}
                        </select>
                      </div>
                      <div>
                        <label style={{ fontSize:11, fontWeight:600, color:'var(--gray-600)', display:'block', marginBottom:4 }}>Unit of measure</label>
                        <select style={{...inp,cursor:'pointer'}} value={ed.uom} onChange={e=>setEditing(ev=>({...ev,[g.id]:{...ed,uom:e.target.value}}))}>
                          {Object.entries(UOM_L).map(([k,v])=><option key={k} value={k}>{v}</option>)}
                        </select>
                      </div>
                      <div>
                        <label style={{ fontSize:11, fontWeight:600, color:'var(--gray-600)', display:'block', marginBottom:4 }}>Target</label>
                        <input style={inp} value={ed.target} onChange={e=>setEditing(ev=>({...ev,[g.id]:{...ed,target:e.target.value}}))} />
                      </div>
                      <div>
                        <label style={{ fontSize:11, fontWeight:600, color:'var(--gray-600)', display:'block', marginBottom:4 }}>Weightage %</label>
                        <input style={inp} type="number" min={10} max={100} value={ed.weightage} onChange={e=>setEditing(ev=>({...ev,[g.id]:{...ed,weightage:Number(e.target.value)}}))} />
                      </div>
                    </div>
                    <div style={{ padding:'8px 12px', background:'#EEEDFE', borderRadius:'var(--radius-sm)', fontSize:11, color:'var(--purple)' }}>
                      ℹ Manager can edit any field before approving. Once approved, only Admin can modify goal properties.
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
