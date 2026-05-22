import { useEffect, useState } from 'react';
import api from '../../lib/api';
import { downloadCSV } from '../../lib/api';

const THRUST = ['Technology','Delivery','Quality','Learning & Development','People','Customer','Finance'];
const UOM_L  = { percent:'%', numeric:'Num', timeline:'Date', zero:'Zero', max:'Max' };

export default function AdminGoals() {
  const [team,    setTeam]   = useState([]);
  const [filter,  setFilter] = useState('all');
  const [search,  setSearch] = useState('');
  const [editing, setEditing] = useState(null);   // { goal, draft }
  const [saving,  setSaving] = useState(false);
  const [toast,   setToast]  = useState('');
  const [exporting, setExporting] = useState(false);

  const load = () => api.get('/goals/team').then(r => setTeam(r.data));
  useEffect(() => { load(); }, []);

  const showToast = msg => { setToast(msg); setTimeout(()=>setToast(''), 3500); };

  const allGoals = team.flatMap(m => m.goals.map(g => ({ ...g, employee: m.user })));
  const filtered = allGoals.filter(g => {
    const ms = filter==='all' || g.status===filter;
    const mq = !search || g.title.toLowerCase().includes(search.toLowerCase()) || g.employee?.name.toLowerCase().includes(search.toLowerCase());
    return ms && mq;
  });

  const act = async (goalId, status) => {
    try { await api.put(`/goals/${goalId}`, { status }); load(); showToast(status==='approved'?'Goal approved':'Status updated'); }
    catch(e) { showToast(e.response?.data?.error||'Action failed'); }
  };

  const startEdit = goal => setEditing({ goal, draft: { title:goal.title, description:goal.description||'', thrustArea:goal.thrustArea, uom:goal.uom, target:goal.target, weightage:goal.weightage } });

  const saveEdit = async () => {
    if (!editing) return;
    setSaving(true);
    try {
      await api.put(`/goals/${editing.goal.id}`, { ...editing.draft, target:Number(editing.draft.target), weightage:Number(editing.draft.weightage) });
      setEditing(null); load(); showToast('Goal updated by Admin ✓');
    } catch(e) { showToast(e.response?.data?.error||'Save failed'); }
    finally { setSaving(false); }
  };

  const doExport = async () => {
    setExporting(true);
    try { await downloadCSV(); showToast('CSV downloaded ✓'); }
    catch { showToast('Export failed — check you are logged in'); }
    finally { setExporting(false); }
  };

  const SC = { approved:'var(--teal-light)', submitted:'var(--amber-light)', draft:'var(--gray-100)' };
  const ST = { approved:'var(--teal-dark)',  submitted:'var(--amber-text)',  draft:'var(--gray-600)' };
  const inp = { width:'100%', padding:'8px 10px', border:'0.5px solid #D3D1C7', borderRadius:6, fontSize:13, outline:'none', background:'#fff' };

  return (
    <div style={{ padding:28 }}>

      {toast && <div style={{ position:'fixed', top:20, left:'50%', transform:'translateX(-50%)', background:'#1A1A18', color:'#fff', padding:'9px 20px', borderRadius:8, fontSize:13, zIndex:999, boxShadow:'0 4px 20px rgba(0,0,0,0.2)' }}>{toast}</div>}

      {/* Edit modal */}
      {editing && (
        <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.4)', zIndex:500, display:'flex', alignItems:'center', justifyContent:'center', padding:24 }}>
          <div style={{ background:'#fff', borderRadius:16, padding:28, width:'100%', maxWidth:540, boxShadow:'0 8px 48px rgba(0,0,0,0.2)' }}>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:6 }}>
              <h2 style={{ fontSize:16, fontWeight:700 }}>Edit goal (Admin)</h2>
              <button onClick={()=>setEditing(null)} style={{ background:'none', border:'none', fontSize:22, cursor:'pointer', color:'var(--gray-600)', lineHeight:1 }}>×</button>
            </div>
            <div style={{ padding:'7px 12px', background:'var(--amber-light)', borderRadius:7, fontSize:12, color:'var(--amber-text)', marginBottom:16 }}>
              ⚠ This goal is <strong>{editing.goal.status}</strong>. As Admin you can edit any property at any time.
            </div>
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:11 }}>
              <div style={{ gridColumn:'1/-1' }}>
                <label style={{ fontSize:11, fontWeight:600, color:'var(--gray-600)', display:'block', marginBottom:4 }}>Title</label>
                <input style={inp} value={editing.draft.title} onChange={e=>setEditing(ed=>({...ed,draft:{...ed.draft,title:e.target.value}}))} />
              </div>
              <div style={{ gridColumn:'1/-1' }}>
                <label style={{ fontSize:11, fontWeight:600, color:'var(--gray-600)', display:'block', marginBottom:4 }}>Description</label>
                <textarea style={{...inp,resize:'none'}} rows={2} value={editing.draft.description} onChange={e=>setEditing(ed=>({...ed,draft:{...ed.draft,description:e.target.value}}))} />
              </div>
              <div>
                <label style={{ fontSize:11, fontWeight:600, color:'var(--gray-600)', display:'block', marginBottom:4 }}>Thrust area</label>
                <select style={{...inp,cursor:'pointer'}} value={editing.draft.thrustArea} onChange={e=>setEditing(ed=>({...ed,draft:{...ed.draft,thrustArea:e.target.value}}))}>
                  {THRUST.map(t=><option key={t}>{t}</option>)}
                </select>
              </div>
              <div>
                <label style={{ fontSize:11, fontWeight:600, color:'var(--gray-600)', display:'block', marginBottom:4 }}>Unit of measure</label>
                <select style={{...inp,cursor:'pointer'}} value={editing.draft.uom} onChange={e=>setEditing(ed=>({...ed,draft:{...ed.draft,uom:e.target.value}}))}>
                  {Object.entries(UOM_L).map(([k,v])=><option key={k} value={k}>{v}</option>)}
                </select>
              </div>
              <div>
                <label style={{ fontSize:11, fontWeight:600, color:'var(--gray-600)', display:'block', marginBottom:4 }}>Target</label>
                <input style={inp} value={editing.draft.target} onChange={e=>setEditing(ed=>({...ed,draft:{...ed.draft,target:e.target.value}}))} />
              </div>
              <div>
                <label style={{ fontSize:11, fontWeight:600, color:'var(--gray-600)', display:'block', marginBottom:4 }}>Weightage %</label>
                <input style={inp} type="number" min={10} max={100} value={editing.draft.weightage} onChange={e=>setEditing(ed=>({...ed,draft:{...ed.draft,weightage:Number(e.target.value)}}))} />
              </div>
            </div>
            <div style={{ display:'flex', gap:9, marginTop:18 }}>
              <button onClick={saveEdit} disabled={saving}
                style={{ flex:1, padding:'10px', background:'var(--teal)', color:'#fff', border:'none', borderRadius:7, fontWeight:700, fontSize:14, cursor:'pointer' }}>
                {saving?'Saving…':'Save changes'}
              </button>
              <button onClick={()=>setEditing(null)}
                style={{ padding:'10px 18px', background:'none', border:'var(--border)', borderRadius:7, fontSize:13, cursor:'pointer' }}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Page header */}
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:22 }}>
        <div>
          <h1 style={{ fontSize:20, fontWeight:600 }}>All goals</h1>
          <p style={{ fontSize:13, color:'var(--gray-600)', marginTop:3 }}>{allGoals.length} goals across {team.length} employees</p>
        </div>
        <button onClick={doExport} disabled={exporting}
          style={{ display:'flex', alignItems:'center', gap:7, padding:'9px 18px', background:exporting?'var(--gray-200)':'var(--teal)', color:exporting?'var(--gray-600)':'#fff', border:'none', borderRadius:'var(--radius-sm)', fontWeight:600, fontSize:13, cursor:'pointer' }}>
          {exporting?'Exporting…':'↓ Export CSV'}
        </button>
      </div>

      {/* Filters */}
      <div style={{ display:'flex', gap:9, marginBottom:16, flexWrap:'wrap' }}>
        <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search by goal or employee…"
          style={{ flex:1, minWidth:200, padding:'8px 12px', border:'var(--border)', borderRadius:'var(--radius-sm)', fontSize:13, background:'#fff', outline:'none' }} />
        {['all','draft','submitted','approved'].map(s=>(
          <button key={s} onClick={()=>setFilter(s)}
            style={{ padding:'7px 14px', borderRadius:'var(--radius-sm)', fontSize:12, fontWeight:500, cursor:'pointer', border:filter===s?'1.5px solid var(--teal)':'var(--border)', background:filter===s?'var(--teal-light)':'#fff', color:filter===s?'var(--teal-dark)':'var(--gray-600)' }}>
            {s.charAt(0).toUpperCase()+s.slice(1)}
          </button>
        ))}
      </div>

      {/* Table */}
      <div style={{ background:'#fff', border:'var(--border)', borderRadius:'var(--radius)', overflow:'hidden' }}>
        <table style={{ width:'100%', borderCollapse:'collapse' }}>
          <thead>
            <tr style={{ background:'var(--gray-50)', borderBottom:'var(--border)' }}>
              {['Employee','Goal','Thrust','Weight','Status','Actions'].map(h=>(
                <th key={h} style={{ padding:'10px 14px', textAlign:'left', fontSize:11, fontWeight:600, color:'var(--gray-600)', letterSpacing:'.3px' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map((g,i)=>(
              <tr key={g.id} style={{ borderBottom:i<filtered.length-1?'var(--border)':'none' }}>
                <td style={{ padding:'11px 14px' }}>
                  <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                    <div style={{ width:26, height:26, borderRadius:'50%', background:'var(--teal-light)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:10, fontWeight:700, color:'var(--teal-dark)', flexShrink:0 }}>
                      {g.employee?.name.split(' ').map(n=>n[0]).join('').slice(0,2)}
                    </div>
                    <div>
                      <div style={{ fontSize:12, fontWeight:500 }}>{g.employee?.name}</div>
                      <div style={{ fontSize:10, color:'var(--gray-400)' }}>{g.employee?.department}</div>
                    </div>
                  </div>
                </td>
                <td style={{ padding:'11px 14px', maxWidth:220 }}>
                  <div style={{ fontSize:12, fontWeight:500, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{g.title}</div>
                  <div style={{ fontSize:11, color:'var(--gray-400)' }}>Target: {g.target} · {UOM_L[g.uom]}</div>
                </td>
                <td style={{ padding:'11px 14px' }}>
                  <span style={{ fontSize:11, padding:'2px 8px', borderRadius:20, background:'var(--purple-light)', color:'var(--purple)' }}>{g.thrustArea}</span>
                </td>
                <td style={{ padding:'11px 14px', fontSize:13, fontWeight:600 }}>{g.weightage}%</td>
                <td style={{ padding:'11px 14px' }}>
                  <span style={{ fontSize:11, padding:'2px 8px', borderRadius:20, fontWeight:500, background:SC[g.status]||'var(--gray-100)', color:ST[g.status]||'var(--gray-600)' }}>{g.status}</span>
                </td>
                <td style={{ padding:'11px 14px' }}>
                  <div style={{ display:'flex', gap:5, flexWrap:'wrap' }}>
                    {/* Admin can always edit */}
                    <button onClick={()=>startEdit(g)}
                      style={{ fontSize:11, padding:'3px 10px', background:'var(--purple-light)', color:'var(--purple)', border:'0.5px solid var(--purple-mid)', borderRadius:'var(--radius-sm)', cursor:'pointer', fontWeight:500 }}>
                      Edit
                    </button>
                    {g.status==='submitted' && (
                      <button onClick={()=>act(g.id,'approved')}
                        style={{ fontSize:11, padding:'3px 10px', background:'var(--teal)', color:'#fff', border:'none', borderRadius:'var(--radius-sm)', cursor:'pointer', fontWeight:500 }}>
                        Approve
                      </button>
                    )}
                    {g.status==='submitted' && (
                      <button onClick={()=>act(g.id,'draft')}
                        style={{ fontSize:11, padding:'3px 10px', background:'var(--red-light)', color:'var(--red)', border:'0.5px solid var(--red)', borderRadius:'var(--radius-sm)', cursor:'pointer', fontWeight:500 }}>
                        Return
                      </button>
                    )}
                    {g.status==='approved' && (
                      <button onClick={()=>act(g.id,'draft')}
                        style={{ fontSize:11, padding:'3px 10px', background:'var(--amber-light)', color:'var(--amber)', border:'0.5px solid var(--amber)', borderRadius:'var(--radius-sm)', cursor:'pointer', fontWeight:500 }}>
                        Unlock
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filtered.length===0 && (
          <div style={{ textAlign:'center', padding:'40px 0', color:'var(--gray-400)', fontSize:13 }}>No goals match the current filter</div>
        )}
      </div>
    </div>
  );
}
