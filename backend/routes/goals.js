import { Router } from 'express';
import { auth, requireRole } from '../middleware/auth.js';
import { db } from '../models/store.js';

const router = Router();
router.use(auth);

function auditLog(goalId, action, user, extra = {}) {
  db.auditLog.push({ goalId, action, by: user.id, byName: user.name, at: new Date().toISOString(), ...extra });
}

// Sync achievement across all shared-goal copies
function syncSharedAchievements(sourceGoal) {
  if (!sourceGoal.sharedSourceId) return;
  const siblings = db.goals.filter(g => g.sharedSourceId === sourceGoal.sharedSourceId && g.id !== sourceGoal.id);
  siblings.forEach(g => { g.achievements = { ...sourceGoal.achievements }; });
}

// ── GET my goals ─────────────────────────────────────────
router.get('/', (req, res) => {
  const { userId } = req.query;
  const id = userId || req.user.id;
  if (userId && req.user.role === 'employee' && userId !== req.user.id)
    return res.status(403).json({ error: 'Forbidden' });
  res.json(db.goals.filter(g => g.userId === id));
});

// ── GET team goals ────────────────────────────────────────
router.get('/team', requireRole('manager', 'admin'), (req, res) => {
  const filtered = req.user.role === 'manager'
    ? db.goals.filter(g => { const u = db.users.find(u => u.id === g.userId); return u && u.managerId === req.user.id; })
    : db.goals;
  const grouped = {};
  filtered.forEach(g => {
    if (!grouped[g.userId]) grouped[g.userId] = { user: db.users.find(u => u.id === g.userId), goals: [] };
    grouped[g.userId].goals.push(g);
  });
  res.json(Object.values(grouped).filter(g => g.user));
});

// ── POST create goal (employee) ───────────────────────────
router.post('/', requireRole('employee', 'manager', 'admin'), (req, res) => {
  const { title, description, thrustArea, uom, target, weightage, userId: targetUserId } = req.body;

  // Manager/admin can create on behalf of another user
  const ownerId = (req.user.role !== 'employee' && targetUserId) ? targetUserId : req.user.id;

  // Validate manager is creating for direct report
  if (req.user.role === 'manager' && ownerId !== req.user.id) {
    const owner = db.users.find(u => u.id === ownerId);
    if (!owner || owner.managerId !== req.user.id)
      return res.status(403).json({ error: 'You can only create goals for your direct reports.' });
  }

  const userGoals = db.goals.filter(g => g.userId === ownerId && g.status !== 'rejected');
  if (userGoals.length >= 8) return res.status(400).json({ error: 'Maximum 8 goals allowed' });
  if (Number(weightage) < 10) return res.status(400).json({ error: 'Minimum weightage per goal is 10%' });
  const totalWeight = userGoals.reduce((s, g) => s + g.weightage, 0) + Number(weightage);
  if (totalWeight > 100) return res.status(400).json({ error: `Total weightage cannot exceed 100%. Current: ${totalWeight - Number(weightage)}%` });

  const goal = {
    id: `g${db.nextGoalId++}`,
    userId: ownerId,
    title, description, thrustArea, uom,
    target: Number(target), weightage: Number(weightage),
    status: 'draft', lockedAt: null,
    achievements:    { q1: null, q2: null, q3: null, q4: null },
    checkInStatus:   { q1: 'Not Started', q2: 'Not Started', q3: 'Not Started', q4: 'Not Started' },
    checkInComments: { q1: '', q2: '', q3: '', q4: '' },
    isShared: false, sharedFrom: null, sharedSourceId: null,
  };
  db.goals.push(goal);
  auditLog(goal.id, `created by ${req.user.name}`, req.user);
  res.status(201).json(goal);
});

// ── PUT update goal ───────────────────────────────────────
router.put('/:id', (req, res) => {
  const goal = db.goals.find(g => g.id === req.params.id);
  if (!goal) return res.status(404).json({ error: 'Goal not found' });
  const role = req.user.role;

  // ── Permission matrix ──────────────────────────────────
  // EMPLOYEE: own goal only, only if not approved
  if (role === 'employee') {
    if (goal.userId !== req.user.id) return res.status(403).json({ error: 'Forbidden' });
    if (goal.status === 'approved') return res.status(403).json({ error: 'Goal is locked after approval. Contact your manager.' });
  }

  // MANAGER: direct reports only
  if (role === 'manager') {
    const owner = db.users.find(u => u.id === goal.userId);
    const isDirect = owner && owner.managerId === req.user.id;
    const isOwn    = goal.userId === req.user.id;
    if (!isDirect && !isOwn) return res.status(403).json({ error: 'You can only edit goals of your direct reports.' });

    if (goal.status === 'approved') {
      // After approval: manager can ONLY update check-in fields — no goal property edits
      const allowedAfterApproval = ['checkInStatus', 'checkInComments', 'achievements'];
      const attemptedKeys = Object.keys(req.body);
      const forbidden = attemptedKeys.filter(k => !allowedAfterApproval.includes(k) && k !== 'status');
      if (forbidden.length > 0) {
        return res.status(403).json({ error: `Goal is locked. Managers can only update check-in status, comments and actuals after approval. Contact Admin to edit: ${forbidden.join(', ')}` });
      }
    }
    // Before approval: manager can edit ANY property
  }

  // ADMIN: full access always — can edit anything at any time

  // ── Apply changes ──────────────────────────────────────
  const GOAL_PROPS  = ['title', 'description', 'thrustArea', 'uom', 'target', 'weightage'];
  const CHECKIN_PROPS = ['achievements', 'checkInStatus', 'checkInComments'];
  const allowed = [...GOAL_PROPS, ...CHECKIN_PROPS, 'status'];
  const changed = [];

  allowed.forEach(k => {
    if (req.body[k] !== undefined) {
      if (JSON.stringify(req.body[k]) !== JSON.stringify(goal[k])) changed.push(k);
      goal[k] = req.body[k];
    }
  });

  // Sync achievements across shared goal copies
  if (req.body.achievements) syncSharedAchievements(goal);

  // ── Status transitions ─────────────────────────────────
  if (req.body.status === 'approved') {
    goal.lockedAt = new Date().toISOString().split('T')[0];
    auditLog(goal.id, 'approved', req.user);
  } else if (req.body.status === 'submitted') {
    auditLog(goal.id, 'submitted for approval', req.user);
  } else if (req.body.status === 'draft') {
    if (goal.lockedAt && role === 'admin') { goal.lockedAt = null; auditLog(goal.id, 'unlocked by admin', req.user); }
    else if (!goal.lockedAt) auditLog(goal.id, 'returned for rework', req.user);
  } else if (changed.length) {
    auditLog(goal.id, `edited [${changed.join(', ')}]`, req.user);
  }

  res.json(goal);
});

// ── POST submit single goal ───────────────────────────────
router.post('/:id/submit', requireRole('employee'), (req, res) => {
  const goal = db.goals.find(g => g.id === req.params.id && g.userId === req.user.id);
  if (!goal) return res.status(404).json({ error: 'Goal not found' });
  goal.status = 'submitted';
  auditLog(goal.id, 'submitted for approval', req.user);
  res.json(goal);
});

// ── POST submit all drafts ────────────────────────────────
router.post('/submit-all', requireRole('employee'), (req, res) => {
  const myGoals = db.goals.filter(g => g.userId === req.user.id);
  const drafts  = myGoals.filter(g => g.status === 'draft');
  const totalW  = myGoals.reduce((s, g) => s + g.weightage, 0);
  if (totalW !== 100) return res.status(400).json({ error: `Total weightage must equal 100%. Current: ${totalW}%` });
  drafts.forEach(g => { g.status = 'submitted'; auditLog(g.id, 'submitted for approval', req.user); });
  res.json({ submitted: drafts.length });
});

// ── POST push shared KPI ──────────────────────────────────
// Manager/Admin pushes a goal to multiple employees
// - Title and Target are LOCKED (read-only for recipient)
// - Weightage is adjustable by recipient
// - Achievements sync across all copies via sharedSourceId
router.post('/shared', requireRole('manager', 'admin'), (req, res) => {
  const { title, description, thrustArea, uom, target, userIds } = req.body;
  if (!title || !target) return res.status(400).json({ error: 'Title and target are required' });
  if (!userIds?.length) return res.status(400).json({ error: 'No recipients specified' });

  const sharedSourceId = `shared_${Date.now()}`; // Groups all copies together
  const created = [];

  for (const uid of userIds) {
    const userGoals = db.goals.filter(g => g.userId === uid && g.status !== 'rejected');
    if (userGoals.length >= 8) continue; // Skip if maxed
    const totalW   = userGoals.reduce((s, g) => s + g.weightage, 0);
    const defaultW = Math.max(10, Math.min(100 - totalW, 20));

    const goal = {
      id: `g${db.nextGoalId++}`, userId: uid,
      title, description, thrustArea, uom,
      target: Number(target), weightage: defaultW,
      status: 'draft', lockedAt: null,
      isShared: true, sharedFrom: req.user.id, sharedSourceId,
      titleLocked: true, targetLocked: true, // Recipients cannot change these
      achievements:    { q1: null, q2: null, q3: null, q4: null },
      checkInStatus:   { q1: 'Not Started', q2: 'Not Started', q3: 'Not Started', q4: 'Not Started' },
      checkInComments: { q1: '', q2: '', q3: '', q4: '' },
    };
    db.goals.push(goal);
    created.push(goal);
    auditLog(goal.id, `shared KPI pushed by ${req.user.name} to ${db.users.find(u=>u.id===uid)?.name}`, req.user);
  }
  res.status(201).json({ pushed: created.length, sharedSourceId, goals: created });
});

// ── DELETE goal ───────────────────────────────────────────
router.delete('/:id', (req, res) => {
  const idx  = db.goals.findIndex(g => g.id === req.params.id);
  if (idx === -1) return res.status(404).json({ error: 'Not found' });
  const goal = db.goals[idx];
  if (req.user.role === 'employee' && goal.userId !== req.user.id) return res.status(403).json({ error: 'Forbidden' });
  if (goal.status === 'approved' && req.user.role !== 'admin') return res.status(403).json({ error: 'Cannot delete an approved goal. Contact Admin.' });
  db.goals.splice(idx, 1);
  auditLog(goal.id, 'deleted', req.user);
  res.json({ ok: true });
});

// ── GET audit log ─────────────────────────────────────────
router.get('/audit', requireRole('admin'), (req, res) => res.json(db.auditLog));

// ── GET export CSV ────────────────────────────────────────
router.get('/export', requireRole('manager', 'admin'), (req, res) => {
  const goals = req.user.role === 'admin'
    ? db.goals
    : db.goals.filter(g => { const u = db.users.find(u => u.id === g.userId); return u && u.managerId === req.user.id; });

  const sc = (g, q) => {
    const a = g.achievements[q];
    if (a === null || a === undefined) return '';
    if (g.uom === 'percent' || g.uom === 'numeric') return Math.min(100, Math.round(a / g.target * 100)) + '%';
    if (g.uom === 'max' && a !== 0) return Math.min(100, Math.round(g.target / a * 100)) + '%';
    if (g.uom === 'zero') return a === 0 ? '100%' : '0%';
    return '100%';
  };

  const rows = ['Employee,Department,Goal Title,Thrust Area,UoM,Target,Weightage,Status,Q1 Actual,Q1 Score,Q2 Actual,Q2 Score,Q3 Actual,Q3 Score,Q4 Actual,Q4 Score'];
  goals.forEach(g => {
    const u = db.users.find(u => u.id === g.userId);
    rows.push([
      `"${u?.name||''}"`, `"${u?.department||''}"`,
      `"${g.title}"`, g.thrustArea, g.uom, g.target, g.weightage + '%', g.status,
      g.achievements.q1??'', sc(g,'q1'), g.achievements.q2??'', sc(g,'q2'),
      g.achievements.q3??'', sc(g,'q3'), g.achievements.q4??'', sc(g,'q4'),
    ].join(','));
  });

  res.setHeader('Content-Type', 'text/csv');
  res.setHeader('Content-Disposition', 'attachment; filename="achievement-report.csv"');
  res.send(rows.join('\n'));
});

// ── GET completion dashboard ──────────────────────────────
router.get('/completion-dashboard', requireRole('manager', 'admin'), (req, res) => {
  const employees = req.user.role === 'manager'
    ? db.users.filter(u => u.managerId === req.user.id)
    : db.users.filter(u => u.role === 'employee');

  const data = employees.map(emp => {
    const goals = db.goals.filter(g => g.userId === emp.id && g.status === 'approved');
    const checkins = {};
    ['q1','q2','q3','q4'].forEach(q => {
      const total   = goals.length;
      const updated = goals.filter(g => g.achievements[q] !== null && g.achievements[q] !== undefined).length;
      checkins[q] = { total, updated, pct: total ? Math.round(updated/total*100) : 0 };
    });
    return { employee: { id: emp.id, name: emp.name, department: emp.department }, goalsCount: goals.length, checkins };
  });
  res.json(data);
});

export default router;
