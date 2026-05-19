import { Router } from 'express';
import { auth, requireRole } from '../middleware/auth.js';
import { db } from '../models/store.js';

const router = Router();
router.use(auth);

// ── helpers ──────────────────────────────────────────────
function scoreGoal(g, q) {
  const a = g.achievements[q];
  if (a === null || a === undefined) return null;
  if (g.uom === 'percent' || g.uom === 'numeric') return Math.min(100, Math.round((a / g.target) * 100));
  if (g.uom === 'max')      return a === 0 ? 100 : Math.min(100, Math.round((g.target / a) * 100));
  if (g.uom === 'zero')     return a === 0 ? 100 : 0;
  if (g.uom === 'timeline') return 100;
  return null;
}

function auditLog(goalId, action, user, extra = {}) {
  db.auditLog.push({ goalId, action, by: user.id, byName: user.name, at: new Date().toISOString(), ...extra });
}

// ── GET /goals — my goals ─────────────────────────────────
router.get('/', (req, res) => {
  const { userId } = req.query;
  const id = userId || req.user.id;
  if (userId && req.user.role === 'employee' && userId !== req.user.id)
    return res.status(403).json({ error: 'Forbidden' });
  res.json(db.goals.filter(g => g.userId === id));
});

// ── GET /goals/team ───────────────────────────────────────
router.get('/team', requireRole('manager', 'admin'), (req, res) => {
  const filtered = req.user.role === 'manager'
    ? db.goals.filter(g => { const u = db.users.find(u => u.id === g.userId); return u && u.managerId === req.user.id; })
    : db.goals;
  const grouped = {};
  filtered.forEach(g => {
    if (!grouped[g.userId]) grouped[g.userId] = { user: db.users.find(u => u.id === g.userId), goals: [] };
    grouped[g.userId].goals.push(g);
  });
  res.json(Object.values(grouped));
});

// ── POST /goals ───────────────────────────────────────────
router.post('/', requireRole('employee', 'admin'), (req, res) => {
  const { title, description, thrustArea, uom, target, weightage } = req.body;
  const userGoals = db.goals.filter(g => g.userId === req.user.id && g.status !== 'rejected');
  if (userGoals.length >= 8) return res.status(400).json({ error: 'Maximum 8 goals allowed' });
  if (weightage < 10) return res.status(400).json({ error: 'Minimum weightage per goal is 10%' });
  const totalWeight = userGoals.reduce((s, g) => s + g.weightage, 0) + weightage;
  if (totalWeight > 100) return res.status(400).json({ error: `Total weightage cannot exceed 100%. Current: ${totalWeight - weightage}%` });

  const goal = {
    id: `g${db.nextGoalId++}`,
    userId: req.user.id,
    title, description, thrustArea, uom,
    target: Number(target), weightage: Number(weightage),
    status: 'draft', lockedAt: null,
    achievements:   { q1: null, q2: null, q3: null, q4: null },
    checkInStatus:  { q1: 'Not Started', q2: 'Not Started', q3: 'Not Started', q4: 'Not Started' },
    checkInComments: { q1: '', q2: '', q3: '', q4: '' },   // ← NEW
    isShared: false, sharedFrom: null,                      // ← NEW
  };
  db.goals.push(goal);
  auditLog(goal.id, 'created', req.user);
  res.status(201).json(goal);
});

// ── PUT /goals/:id ────────────────────────────────────────
router.put('/:id', (req, res) => {
  const goal = db.goals.find(g => g.id === req.params.id);
  if (!goal) return res.status(404).json({ error: 'Goal not found' });
  const role = req.user.role;

  if (role === 'employee') {
    if (goal.userId !== req.user.id) return res.status(403).json({ error: 'Forbidden' });
    if (goal.status === 'approved') return res.status(403).json({ error: 'Goal is locked. Ask your manager to unlock it.' });
  }
  if (role === 'manager') {
    const owner = db.users.find(u => u.id === goal.userId);
    const isDirect = owner && owner.managerId === req.user.id;
    const isOwn   = goal.userId === req.user.id;
    if (!isDirect && !isOwn) return res.status(403).json({ error: 'You can only edit goals of your direct reports.' });
  }

  const allowed = ['title', 'description', 'thrustArea', 'uom', 'target', 'weightage',
                   'status', 'achievements', 'checkInStatus', 'checkInComments'];
  const changed = [];
  allowed.forEach(k => {
    if (req.body[k] !== undefined && JSON.stringify(req.body[k]) !== JSON.stringify(goal[k])) {
      changed.push(k);
      goal[k] = req.body[k];
    }
  });

  if (req.body.status === 'approved') {
    goal.lockedAt = new Date().toISOString().split('T')[0];
    auditLog(goal.id, 'approved', req.user);
  } else if (req.body.status === 'submitted') {
    auditLog(goal.id, 'submitted', req.user);
  } else if (req.body.status === 'draft' && goal.lockedAt) {
    goal.lockedAt = null;
    auditLog(goal.id, 'unlocked/returned', req.user);
  } else if (changed.length) {
    auditLog(goal.id, `edited [${changed.join(', ')}]`, req.user);
  }

  res.json(goal);
});

// ── POST /goals/:id/submit ────────────────────────────────
router.post('/:id/submit', requireRole('employee'), (req, res) => {
  const goal = db.goals.find(g => g.id === req.params.id && g.userId === req.user.id);
  if (!goal) return res.status(404).json({ error: 'Goal not found' });
  goal.status = 'submitted';
  auditLog(goal.id, 'submitted', req.user);
  res.json(goal);
});

// ── POST /goals/submit-all ────────────────────────────────
router.post('/submit-all', requireRole('employee'), (req, res) => {
  const myGoals  = db.goals.filter(g => g.userId === req.user.id);
  const drafts   = myGoals.filter(g => g.status === 'draft');
  const totalW   = myGoals.reduce((s, g) => s + g.weightage, 0);
  if (totalW !== 100) return res.status(400).json({ error: `Total weightage must equal 100%. Current: ${totalW}%` });
  drafts.forEach(g => { g.status = 'submitted'; auditLog(g.id, 'submitted', req.user); });
  res.json({ submitted: drafts.length });
});

// ── POST /goals/shared — push shared KPI ─────────────────
router.post('/shared', requireRole('manager', 'admin'), (req, res) => {
  const { title, description, thrustArea, uom, target, userIds } = req.body;
  if (!userIds || !userIds.length) return res.status(400).json({ error: 'No recipients specified' });
  const created = [];
  for (const uid of userIds) {
    const userGoals = db.goals.filter(g => g.userId === uid && g.status !== 'rejected');
    if (userGoals.length >= 8) continue; // skip if maxed
    const totalW = userGoals.reduce((s, g) => s + g.weightage, 0);
    const remaining = 100 - totalW;
    const defaultWeight = Math.max(10, Math.min(remaining, 20));
    const goal = {
      id: `g${db.nextGoalId++}`,
      userId: uid,
      title, description, thrustArea, uom,
      target: Number(target), weightage: defaultWeight,
      status: 'draft', lockedAt: null,
      isShared: true, sharedFrom: req.user.id,
      achievements:    { q1: null, q2: null, q3: null, q4: null },
      checkInStatus:   { q1: 'Not Started', q2: 'Not Started', q3: 'Not Started', q4: 'Not Started' },
      checkInComments: { q1: '', q2: '', q3: '', q4: '' },
    };
    db.goals.push(goal);
    created.push(goal);
    auditLog(goal.id, `shared goal pushed by ${req.user.name}`, req.user);
  }
  res.status(201).json({ pushed: created.length, goals: created });
});

// ── DELETE /goals/:id ─────────────────────────────────────
router.delete('/:id', (req, res) => {
  const idx  = db.goals.findIndex(g => g.id === req.params.id);
  if (idx === -1) return res.status(404).json({ error: 'Not found' });
  const goal = db.goals[idx];
  if (req.user.role === 'employee' && goal.userId !== req.user.id) return res.status(403).json({ error: 'Forbidden' });
  if (goal.status === 'approved' && req.user.role !== 'admin') return res.status(403).json({ error: 'Cannot delete an approved goal' });
  db.goals.splice(idx, 1);
  res.json({ ok: true });
});

// ── GET /goals/audit ──────────────────────────────────────
router.get('/audit', requireRole('admin'), (req, res) => res.json(db.auditLog));

// ── GET /goals/export — CSV export ───────────────────────
router.get('/export', requireRole('manager', 'admin'), (req, res) => {
  const goals = req.user.role === 'admin'
    ? db.goals
    : db.goals.filter(g => { const u = db.users.find(u => u.id === g.userId); return u && u.managerId === req.user.id; });

  const rows = ['Employee,Department,Goal Title,Thrust Area,UoM,Target,Weightage,Status,Q1 Actual,Q1 Score,Q2 Actual,Q2 Score,Q3 Actual,Q3 Score,Q4 Actual,Q4 Score'];

  goals.forEach(g => {
    const user = db.users.find(u => u.id === g.userId);
    const sc = (q) => { const a = g.achievements[q]; if (a===null||a===undefined) return ''; const s = g.uom==='percent'||g.uom==='numeric'?Math.min(100,Math.round(a/g.target*100)):g.uom==='max'&&a!==0?Math.min(100,Math.round(g.target/a*100)):g.uom==='zero'?a===0?100:0:100; return s+'%'; };
    rows.push([
      `"${user?.name||''}"`, `"${user?.department||''}"`,
      `"${g.title}"`, g.thrustArea, g.uom, g.target, g.weightage+'%', g.status,
      g.achievements.q1??'', sc('q1'), g.achievements.q2??'', sc('q2'),
      g.achievements.q3??'', sc('q3'), g.achievements.q4??'', sc('q4'),
    ].join(','));
  });

  res.setHeader('Content-Type', 'text/csv');
  res.setHeader('Content-Disposition', 'attachment; filename="achievement-report.csv"');
  res.send(rows.join('\n'));
});

// ── GET /goals/completion-dashboard ──────────────────────
router.get('/completion-dashboard', requireRole('manager', 'admin'), (req, res) => {
  const employees = req.user.role === 'manager'
    ? db.users.filter(u => u.managerId === req.user.id)
    : db.users.filter(u => u.role === 'employee');

  const quarters = ['q1','q2','q3','q4'];
  const data = employees.map(emp => {
    const goals = db.goals.filter(g => g.userId === emp.id && g.status === 'approved');
    const checkins = {};
    quarters.forEach(q => {
      const total   = goals.length;
      const updated = goals.filter(g => g.achievements[q] !== null && g.achievements[q] !== undefined).length;
      checkins[q] = { total, updated, pct: total ? Math.round(updated/total*100) : 0 };
    });
    return { employee: { id: emp.id, name: emp.name, department: emp.department }, goalsCount: goals.length, checkins };
  });

  res.json(data);
});

export default router;
