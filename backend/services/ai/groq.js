import Groq from 'groq-sdk';

const MODEL = 'llama-3.3-70b-versatile';

function getGroq() {
  const key = process.env.GROQ_API_KEY;
  if (!key) throw new Error('GROQ_API_KEY is not set. Add it to Vercel → Project Settings → Environment Variables. Get a free key at console.groq.com');
  return new Groq({ apiKey: key });
}

async function chat(messages, json = false) {
  const groq = getGroq();
  const res = await groq.chat.completions.create({
    model: MODEL,
    messages,
    temperature: 0.4,
    max_tokens: 1024,
    ...(json ? { response_format: { type: 'json_object' } } : {}),
  });
  return res.choices[0].message.content;
}

export async function suggestGoals({ role, department, existingGoals }) {
  const existing = existingGoals.map(g => g.title).join(', ') || 'none yet';
  const raw = await chat([{ role: 'user', content: `You are an OKR coach. Suggest 3 SMART goals for a ${role} in ${department}. Existing goals: ${existing}. Respond ONLY valid JSON: {"suggestions":[{"title":"...","description":"...","thrustArea":"Technology|Delivery|Quality|Learning & Development|People|Customer|Finance","uom":"percent|numeric|timeline|zero|max","target":50,"weightage":20,"rationale":"..."}]}` }], true);
  return JSON.parse(raw);
}

export async function improveGoal({ title, description, uom, target }) {
  const raw = await chat([{ role: 'user', content: `Improve this goal. Title: ${title}. Description: ${description}. UoM: ${uom}. Target: ${target}. Respond ONLY valid JSON: {"improvedTitle":"...","improvedDescription":"...","suggestions":["tip1","tip2","tip3"]}` }], true);
  return JSON.parse(raw);
}

export async function predictRisk(goals) {
  const summary = goals.map(g => ({ title: g.title, uom: g.uom, target: g.target, weightage: g.weightage, q1: g.achievements.q1, q2: g.achievements.q2, q1Status: g.checkInStatus.q1, q2Status: g.checkInStatus.q2 }));
  const raw = await chat([{ role: 'user', content: `Analyze these goals and predict year-end risk. Goals: ${JSON.stringify(summary)}. Respond ONLY valid JSON: {"overallRisk":"on-track|at-risk|critical","overallScore":72,"summary":"...","goals":[{"title":"...","predictedAchievement":85,"risk":"on-track|at-risk|critical","reason":"...","recommendation":"..."}]}` }], true);
  return JSON.parse(raw);
}

export async function teamRiskSummary(teamGoals) {
  const raw = await chat([{ role: 'user', content: `Analyze team goals: ${JSON.stringify(teamGoals)}. Respond ONLY valid JSON: {"teamHealth":"healthy|needs-attention|critical","atRiskCount":2,"insights":["...","...","..."],"recommendedActions":["...","..."]}` }], true);
  return JSON.parse(raw);
}

export async function chatWithGoalAssistant(systemPrompt, userMessage) {
  const messages = [
    { role: 'system', content: systemPrompt || 'You are a helpful AI goal assistant. Be concise, practical and specific.' },
    { role: 'user', content: userMessage },
  ];
  return await chat(messages, false);
}
