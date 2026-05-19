import Groq from 'groq-sdk';

const MODEL = 'llama-3.3-70b-versatile';

function getGroq() {
  const key = process.env.GROQ_API_KEY;
  if (!key) throw new Error('GROQ_API_KEY is not set. Add it to your Vercel environment variables. Get a free key at console.groq.com');
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
  const prompt = `You are an expert OKR coach helping an employee set annual goals.

Employee role: ${role}
Department: ${department}
Already has these goals: ${existing}

Suggest 3 new, specific, measurable goals that:
- Are distinct from existing goals
- Follow SMART criteria
- Include a recommended weightage (10-30%) and unit of measurement
- Suit someone in ${department}

Respond ONLY with valid JSON:
{
  "suggestions": [
    {
      "title": "...",
      "description": "...",
      "thrustArea": "Technology|Delivery|Quality|Learning & Development|People|Customer|Finance",
      "uom": "percent|numeric|timeline|zero|max",
      "target": 50,
      "weightage": 20,
      "rationale": "one sentence why this goal matters"
    }
  ]
}`;
  const raw = await chat([{ role: 'user', content: prompt }], true);
  return JSON.parse(raw);
}

export async function improveGoal({ title, description, uom, target }) {
  const prompt = `You are an OKR expert. Improve this employee goal to make it clearer and more measurable.

Current title: ${title}
Current description: ${description}
Unit of measure: ${uom}
Target: ${target}

Respond ONLY with valid JSON:
{
  "improvedTitle": "...",
  "improvedDescription": "...",
  "suggestions": ["tip 1", "tip 2", "tip 3"]
}`;
  const raw = await chat([{ role: 'user', content: prompt }], true);
  return JSON.parse(raw);
}

export async function predictRisk(goals) {
  const goalSummary = goals.map(g => ({
    title: g.title,
    uom: g.uom,
    target: g.target,
    weightage: g.weightage,
    q1Achievement: g.achievements.q1,
    q2Achievement: g.achievements.q2,
    q1Status: g.checkInStatus.q1,
    q2Status: g.checkInStatus.q2,
  }));

  const prompt = `You are a performance analytics AI. Analyze these employee goals and predict year-end risk.

Goals data:
${JSON.stringify(goalSummary, null, 2)}

For each goal, predict:
1. Estimated year-end achievement percentage (0-100)
2. Risk level: "on-track" | "at-risk" | "critical"
3. A brief reason (1 sentence)
4. One actionable recommendation

Respond ONLY with valid JSON:
{
  "overallRisk": "on-track|at-risk|critical",
  "overallScore": 72,
  "summary": "one sentence overall assessment",
  "goals": [
    {
      "title": "...",
      "predictedAchievement": 85,
      "risk": "on-track|at-risk|critical",
      "reason": "...",
      "recommendation": "..."
    }
  ]
}`;
  const raw = await chat([{ role: 'user', content: prompt }], true);
  return JSON.parse(raw);
}

export async function teamRiskSummary(teamGoals) {
  const prompt = `You are a team performance AI. Analyze this team's goal data and provide a manager-level summary.

Team goals data:
${JSON.stringify(teamGoals, null, 2)}

Respond ONLY with valid JSON:
{
  "teamHealth": "healthy|needs-attention|critical",
  "atRiskCount": 2,
  "insights": ["insight 1", "insight 2", "insight 3"],
  "recommendedActions": ["action 1", "action 2"]
}`;
  const raw = await chat([{ role: 'user', content: prompt }], true);
  return JSON.parse(raw);
}
