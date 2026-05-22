import { useState, useRef, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import api from '../../lib/api';

const QUICK = [
  { label: 'Suggest 3 goals for me', msg: 'Based on my role and department, suggest 3 specific SMART goals I should set this year.' },
  { label: 'Which goals are at risk?', msg: 'Based on my Q1 and Q2 actuals, which goals are at risk of not being achieved?' },
  { label: 'Improve my weakest goal', msg: 'Review my current goals and improve the one that is least well-defined or measurable.' },
  { label: 'What to focus on this quarter?', msg: 'What should I focus on most this quarter to improve my overall performance score?' },
];

const MODELS = [
  { value: 'llama-3.3-70b-versatile', label: 'Llama 3.3 70B (Best)' },
  { value: 'llama-3.1-8b-instant',    label: 'Llama 3.1 8B (Fast)' },
  { value: 'mixtral-8x7b-32768',      label: 'Mixtral 8x7B' },
];

export default function AIWidget() {
  const { user } = useAuth();
  const [open,    setOpen]    = useState(false);
  const [view,    setView]    = useState('chat'); // 'chat' | 'settings'
  const [msgs,    setMsgs]    = useState([
    { role: 'ai', text: `Hi ${user?.name?.split(' ')[0] || 'there'}! I'm your AI goal assistant powered by Groq. Ask me anything about your goals, or tap a quick action below.` }
  ]);
  const [input,   setInput]   = useState('');
  const [loading, setLoading] = useState(false);
  const [settings, setSettings] = useState({ model: 'llama-3.3-70b-versatile', tone: 'professional', language: 'English' });
  const [groqError, setGroqError] = useState(false);
  const bottomRef = useRef(null);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [msgs, open]);

  const addMsg = (role, text) => setMsgs(m => [...m, { role, text }]);

  const send = async (text) => {
    const t = (text || input).trim();
    if (!t || loading) return;
    setInput('');
    addMsg('user', t);
    setLoading(true);
    setGroqError(false);
    try {
      const goalsRes  = await api.get('/goals').catch(() => ({ data: [] }));
      const goals     = goalsRes.data || [];
      const goalLines = goals.length
        ? goals.map(g => `- ${g.title} (${g.weightage}% weight, status: ${g.status}, Q1: ${g.achievements?.q1 ?? '—'}, Q2: ${g.achievements?.q2 ?? '—'})`).join('\n')
        : 'No goals set yet.';

      const systemPrompt = `You are an AI goal coach for ${user?.name} (${user?.role} in ${user?.department}).
Their FY2025 goals:\n${goalLines}
Tone: ${settings.tone}. Language: ${settings.language}. Be specific, concise (3-4 sentences max unless asked more).`;

      const { data } = await api.post('/ai/chat', { systemPrompt, userMessage: t });
      addMsg('ai', data.reply || 'Could not get a response. Please try again.');
    } catch (err) {
      const detail = err.response?.data?.detail || err.response?.data?.error || '';
      if (detail.toLowerCase().includes('groq') || detail.toLowerCase().includes('api key') || err.response?.status === 500) {
        setGroqError(true);
        addMsg('ai', '⚠️ Groq API key is not configured on the server.\n\nTo fix: Go to Vercel → your backend project → Settings → Environment Variables → add GROQ_API_KEY.\n\nGet a free key at console.groq.com');
      } else {
        addMsg('ai', 'Something went wrong. Please try again.');
      }
    } finally { setLoading(false); }
  };

  const onKey = (e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(); } };

  if (!user) return null;

  const initials = user.name?.split(' ').map(n => n[0]).join('').slice(0, 2) || 'U';

  return (
    <>
      {/* Floating button */}
      <button onClick={() => setOpen(o => !o)}
        style={{ position:'fixed', bottom:26, right:26, width:52, height:52, borderRadius:'50%', background: open?'#3C3489':'#534AB7', color:'#fff', border:'2px solid rgba(255,255,255,0.2)', cursor:'pointer', boxShadow:'0 4px 20px rgba(83,74,183,0.5)', zIndex:1000, fontSize:open?18:20, display:'flex', alignItems:'center', justifyContent:'center', transition:'all 0.2s' }}
        title="AI Goal Assistant">
        {open ? '✕' : '✦'}
      </button>

      {/* Widget */}
      {open && (
        <div style={{ position:'fixed', bottom:90, right:26, width:364, height:530, background:'#fff', borderRadius:16, boxShadow:'0 8px 48px rgba(0,0,0,0.18)', zIndex:1000, display:'flex', flexDirection:'column', border:'0.5px solid #E4E2D8', overflow:'hidden' }}>

          {/* Header */}
          <div style={{ padding:'13px 15px 11px', background:'linear-gradient(135deg,#3C3489,#534AB7)', display:'flex', alignItems:'center', justifyContent:'space-between', flexShrink:0 }}>
            <div style={{ display:'flex', alignItems:'center', gap:9 }}>
              <div style={{ width:30, height:30, background:'rgba(255,255,255,0.15)', borderRadius:8, display:'flex', alignItems:'center', justifyContent:'center', fontSize:15 }}>✦</div>
              <div>
                <div style={{ fontSize:13, fontWeight:700, color:'#fff' }}>AI Goal Assistant</div>
                <div style={{ fontSize:10, color:'rgba(255,255,255,0.65)' }}>Groq · {MODELS.find(m=>m.value===settings.model)?.label}</div>
              </div>
            </div>
            <div style={{ display:'flex', gap:6 }}>
              <button onClick={() => setView(v => v==='settings'?'chat':'settings')} title="Settings"
                style={{ width:28, height:28, borderRadius:6, background:'rgba(255,255,255,0.15)', border:'none', color:'#fff', cursor:'pointer', fontSize:14, display:'flex', alignItems:'center', justifyContent:'center' }}>
                {view==='settings' ? '←' : '⚙'}
              </button>
            </div>
          </div>

          {/* Settings panel */}
          {view === 'settings' ? (
            <div style={{ flex:1, padding:18, overflowY:'auto' }}>
              <div style={{ fontSize:13, fontWeight:700, color:'#1A1A18', marginBottom:16 }}>Widget settings</div>

              <div style={{ marginBottom:14 }}>
                <label style={{ fontSize:11, fontWeight:600, color:'#5F5E5A', display:'block', marginBottom:5 }}>AI Model</label>
                <select value={settings.model} onChange={e=>setSettings(s=>({...s,model:e.target.value}))}
                  style={{ width:'100%', padding:'8px 10px', border:'0.5px solid #D3D1C7', borderRadius:6, fontSize:13, background:'#fff' }}>
                  {MODELS.map(m=><option key={m.value} value={m.value}>{m.label}</option>)}
                </select>
              </div>

              <div style={{ marginBottom:14 }}>
                <label style={{ fontSize:11, fontWeight:600, color:'#5F5E5A', display:'block', marginBottom:6 }}>Response tone</label>
                <div style={{ display:'flex', gap:7 }}>
                  {['Professional','Friendly','Concise'].map(t=>(
                    <button key={t} onClick={()=>setSettings(s=>({...s,tone:t.toLowerCase()}))}
                      style={{ flex:1, padding:'7px 4px', borderRadius:6, fontSize:11, fontWeight:600, cursor:'pointer', border: settings.tone===t.toLowerCase()?'1.5px solid #534AB7':'0.5px solid #D3D1C7', background: settings.tone===t.toLowerCase()?'#EEEDFE':'#fff', color: settings.tone===t.toLowerCase()?'#534AB7':'#5F5E5A' }}>
                      {t}
                    </button>
                  ))}
                </div>
              </div>

              <div style={{ marginBottom:16 }}>
                <label style={{ fontSize:11, fontWeight:600, color:'#5F5E5A', display:'block', marginBottom:5 }}>Language</label>
                <select value={settings.language} onChange={e=>setSettings(s=>({...s,language:e.target.value}))}
                  style={{ width:'100%', padding:'8px 10px', border:'0.5px solid #D3D1C7', borderRadius:6, fontSize:13, background:'#fff' }}>
                  {['English','Hindi','Telugu','Tamil','Kannada','Marathi','Bengali'].map(l=><option key={l}>{l}</option>)}
                </select>
              </div>

              {groqError && (
                <div style={{ padding:'12px', background:'#FAEEDA', borderRadius:8, border:'0.5px solid #FAC775', fontSize:12, color:'#633806', lineHeight:1.6 }}>
                  <strong>⚠ Groq API key missing</strong><br/>
                  Add <code style={{ background:'rgba(0,0,0,0.07)', padding:'1px 5px', borderRadius:3, fontSize:11 }}>GROQ_API_KEY</code> in Vercel backend environment variables.<br/>
                  Free key at <a href="https://console.groq.com" target="_blank" rel="noreferrer" style={{ color:'#854F0B', fontWeight:600 }}>console.groq.com</a>
                </div>
              )}

              <div style={{ marginTop:16, padding:'10px 12px', background:'#F8F8F6', borderRadius:8, fontSize:11, color:'#5F5E5A', lineHeight:1.6, border:'0.5px solid #E4E2D8' }}>
                <strong>Tip:</strong> The AI reads your live goal data — it knows your current Q1/Q2 actuals and can give personalised advice.
              </div>

              <button onClick={() => setView('chat')}
                style={{ width:'100%', marginTop:14, padding:'9px', background:'#534AB7', color:'#fff', border:'none', borderRadius:6, fontSize:13, fontWeight:600, cursor:'pointer' }}>
                ← Back to chat
              </button>
            </div>
          ) : (
            <>
              {/* Messages */}
              <div style={{ flex:1, overflowY:'auto', padding:'12px 13px 6px' }}>
                {msgs.map((m, i) => (
                  <div key={i} style={{ display:'flex', gap:7, marginBottom:10, flexDirection:m.role==='user'?'row-reverse':'row' }}>
                    <div style={{ width:24, height:24, borderRadius:'50%', flexShrink:0, display:'flex', alignItems:'center', justifyContent:'center', fontSize:10, fontWeight:700, background:m.role==='ai'?'#EEEDFE':'#1D9E75', color:m.role==='ai'?'#534AB7':'#fff' }}>
                      {m.role==='ai' ? '✦' : initials}
                    </div>
                    <div style={{ maxWidth:'82%', padding:'8px 11px', borderRadius:m.role==='user'?'11px 11px 3px 11px':'11px 11px 11px 3px', fontSize:12, lineHeight:1.6, whiteSpace:'pre-wrap', background:m.role==='user'?'#1D9E75':'#F8F8F6', color:m.role==='user'?'#fff':'#1A1A18', border:m.role==='ai'?'0.5px solid #E4E2D8':'none' }}>
                      {m.text}
                    </div>
                  </div>
                ))}
                {loading && (
                  <div style={{ display:'flex', gap:7, marginBottom:10 }}>
                    <div style={{ width:24, height:24, borderRadius:'50%', background:'#EEEDFE', display:'flex', alignItems:'center', justifyContent:'center', fontSize:10, color:'#534AB7', fontWeight:700 }}>✦</div>
                    <div style={{ padding:'10px 14px', background:'#F8F8F6', borderRadius:'11px 11px 11px 3px', border:'0.5px solid #E4E2D8', display:'flex', gap:4, alignItems:'center' }}>
                      {[0,1,2].map(i=><div key={i} style={{ width:6, height:6, borderRadius:'50%', background:'#534AB7', animation:`bounce 0.9s ${i*0.18}s infinite` }} />)}
                    </div>
                  </div>
                )}
                <div ref={bottomRef} />
              </div>

              {/* Quick prompts */}
              <div style={{ padding:'4px 10px 6px', display:'flex', gap:5, flexWrap:'wrap', borderTop:'0.5px solid #F1EFE8', flexShrink:0 }}>
                {QUICK.map(q=>(
                  <button key={q.label} onClick={()=>send(q.msg)} disabled={loading}
                    style={{ padding:'4px 9px', borderRadius:20, fontSize:10, fontWeight:500, background:'#EEEDFE', color:'#534AB7', border:'0.5px solid #AFA9EC', cursor:'pointer', opacity:loading?0.5:1, whiteSpace:'nowrap' }}>
                    {q.label}
                  </button>
                ))}
              </div>

              {/* Input */}
              <div style={{ padding:'7px 11px 11px', display:'flex', gap:7, alignItems:'flex-end', flexShrink:0 }}>
                <textarea value={input} onChange={e=>setInput(e.target.value)} onKeyDown={onKey}
                  placeholder="Ask about your goals…" rows={1}
                  style={{ flex:1, padding:'8px 10px', border:'0.5px solid #D3D1C7', borderRadius:8, fontSize:12, resize:'none', outline:'none', lineHeight:1.45, fontFamily:'inherit', maxHeight:76, overflowY:'auto' }} />
                <button onClick={()=>send()} disabled={loading||!input.trim()}
                  style={{ width:34, height:34, borderRadius:8, background:!input.trim()||loading?'#D3D1C7':'#534AB7', color:'#fff', border:'none', cursor:!input.trim()||loading?'default':'pointer', fontSize:15, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                  ↑
                </button>
              </div>
            </>
          )}
        </div>
      )}
      <style>{`@keyframes bounce{0%,80%,100%{transform:translateY(0)}40%{transform:translateY(-5px)}}`}</style>
    </>
  );
}
