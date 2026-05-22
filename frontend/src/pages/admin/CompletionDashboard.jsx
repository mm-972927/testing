import { useEffect, useState } from 'react';
import api from '../../lib/api';
import { downloadCSV } from '../../lib/api';

const Q = ['q1','q2','q3','q4'];
const Q_L = { q1:'Q1 Jul', q2:'Q2 Oct', q3:'Q3 Jan', q4:'Q4 Apr' };

export default function CompletionDashboard() {
  const [data,      setData]      = useState([]);
  const [loading,   setLoading]   = useState(true);
  const [exporting, setExporting] = useState(false);
  const [toast,     setToast]     = useState('');

  useEffect(() => {
    api.get('/goals/completion-dashboard').then(r=>setData(r.data)).finally(()=>setLoading(false));
  }, []);

  const showToast = msg => { setToast(msg); setTimeout(()=>setToast(''),3000); };

  const doExport = async () => {
    setExporting(true);
    try { await downloadCSV(); showToast('Achievement report downloaded ✓'); }
    catch { showToast('Export failed — check you are logged in as Admin/Manager'); }
    finally { setExporting(false); }
  };

  if (loading) return <div style={{ padding:28, color:'var(--gray-400)' }}>Loading…</div>;

  return (
    <div style={{ padding:28 }}>

      {toast && <div style={{ position:'fixed', top:20, left:'50%', transform:'translateX(-50%)', background:'#1A1A18', color:'#fff', padding:'9px 20px', borderRadius:8, fontSize:13, zIndex:999, boxShadow:'0 4px 20px rgba(0,0,0,0.2)' }}>{toast}</div>}

      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:24 }}>
        <div>
          <h1 style={{ fontSize:20, fontWeight:600 }}>Completion dashboard</h1>
          <p style={{ fontSize:13, color:'var(--gray-600)', marginTop:3 }}>Real-time check-in completion rates across the organisation</p>
        </div>
        <button onClick={doExport} disabled={exporting}
          style={{ display:'flex', alignItems:'center', gap:7, padding:'9px 18px', background:exporting?'var(--gray-200)':'var(--teal)', color:exporting?'var(--gray-600)':'#fff', border:'none', borderRadius:'var(--radius-sm)', fontWeight:600, fontSize:13, cursor:'pointer' }}>
          {exporting?'Exporting…':'↓ Export Achievement Report (CSV)'}
        </button>
      </div>

      {/* Quarter summary */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:12, marginBottom:24 }}>
        {Q.map(q => {
          const total = data.length;
          const done  = data.filter(d=>d.checkins[q]?.pct===100).length;
          const pct   = total ? Math.round(done/total*100) : 0;
          return (
            <div key={q} style={{ background:'#fff', border:'var(--border)', borderRadius:'var(--radius)', padding:16 }}>
              <div style={{ fontSize:11, color:'var(--gray-600)', marginBottom:6 }}>{Q_L[q]}</div>
              <div style={{ fontSize:24, fontWeight:600, color:pct===100?'var(--teal)':pct>=50?'var(--amber)':'var(--red)' }}>{pct}%</div>
              <div style={{ fontSize:11, color:'var(--gray-400)', marginTop:2 }}>{done}/{total} fully complete</div>
              <div style={{ height:4, background:'var(--gray-100)', borderRadius:2, marginTop:8 }}>
                <div style={{ height:'100%', width:`${pct}%`, background:pct===100?'var(--teal)':pct>=50?'var(--amber)':'var(--red)', borderRadius:2, transition:'width .6s' }} />
              </div>
            </div>
          );
        })}
      </div>

      {/* Employee table */}
      <div style={{ background:'#fff', border:'var(--border)', borderRadius:'var(--radius)', overflow:'hidden' }}>
        <table style={{ width:'100%', borderCollapse:'collapse' }}>
          <thead>
            <tr style={{ background:'var(--gray-50)', borderBottom:'var(--border)' }}>
              <th style={{ padding:'10px 16px', textAlign:'left', fontSize:11, fontWeight:600, color:'var(--gray-600)' }}>Employee</th>
              <th style={{ padding:'10px 16px', textAlign:'left', fontSize:11, fontWeight:600, color:'var(--gray-600)' }}>Active goals</th>
              {Q.map(q=><th key={q} style={{ padding:'10px 16px', textAlign:'center', fontSize:11, fontWeight:600, color:'var(--gray-600)' }}>{Q_L[q]}</th>)}
            </tr>
          </thead>
          <tbody>
            {data.map((d,i)=>(
              <tr key={d.employee.id} style={{ borderBottom:i<data.length-1?'var(--border)':'none' }}>
                <td style={{ padding:'11px 16px' }}>
                  <div style={{ display:'flex', alignItems:'center', gap:9 }}>
                    <div style={{ width:28, height:28, borderRadius:'50%', background:'var(--teal-light)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:10, fontWeight:700, color:'var(--teal-dark)' }}>
                      {d.employee.name.split(' ').map(n=>n[0]).join('').slice(0,2)}
                    </div>
                    <div>
                      <div style={{ fontSize:13, fontWeight:500 }}>{d.employee.name}</div>
                      <div style={{ fontSize:11, color:'var(--gray-400)' }}>{d.employee.department}</div>
                    </div>
                  </div>
                </td>
                <td style={{ padding:'11px 16px', fontSize:13, color:'var(--gray-600)' }}>{d.goalsCount}</td>
                {Q.map(q=>{
                  const ci  = d.checkins[q];
                  const pct = ci?.pct??0;
                  return (
                    <td key={q} style={{ padding:'11px 16px', textAlign:'center' }}>
                      <span style={{ fontSize:11, padding:'2px 9px', borderRadius:20, fontWeight:600,
                        background:pct===100?'var(--teal-light)':pct>0?'var(--amber-light)':'var(--gray-100)',
                        color:pct===100?'var(--teal-dark)':pct>0?'var(--amber-text)':'var(--gray-400)' }}>
                        {ci?.updated??0}/{ci?.total??0}
                      </span>
                    </td>
                  );
                })}
              </tr>
            ))}
            {data.length===0 && (
              <tr><td colSpan={6} style={{ padding:'40px 0', textAlign:'center', color:'var(--gray-400)', fontSize:13 }}>No data yet — approve some goals to see check-in completion</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
