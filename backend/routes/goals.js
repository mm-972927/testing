import { Router } from 'express';
import { auth, requireRole } from '../middleware/auth.js';
import { db } from '../models/store.js';

const router = Router();
router.use(auth);

function scoreGoal(g, quarter) {
  const a = g.achievements[quarter];
  if (a === null || a === undefined) return null;
  if (g.uom === 'percent' || g.uom === 'numeric') return Math.min(100, Math.round((a / g.target) * 100));
  if (g.uom === 'max') return Math.min(100, Math.round((g.target / a) * 100));
  if (g.uom === 'zero') return a === 0 ? 100 : 0;
  if (g.uom === 'timeline') return 100;
  return null;
}

router.get('/', (req, res) => {
  const { userId } = req.query;
  const id = userId || req.user.id;
  if (userId && req.user.role === 'employee' && userId !== req.user.id)
    return res.status(403).json({ error: 'Forbidden' });
  const goals = db.goals.filter(g => g.userId === id);
  res.json(goals);
});

router.get('/team', requireRole('manager', 'admin'), (req, res) => {
  const managerGoals = req.user.role === 'manager'
    ? db.goals.filter(g => {
        const u = db.users.find(u => u.id === g.userId);
        return u && u.managerId === req.user.id;
      })
    : db.goals;
  const grouped = {};
  managerGoals.forEach(g => {
    if (!grouped[g.userId]) grouped[g.userId] = { user: db.users.find(u => u.id === g.userId), goals: [] };
    grouped[g.userId].goals.push(g);
  });
  res.json(Object.values(grouped));
});

router.post('/', requireRole('employee', 'admin'), (req, res) => {
  const { title, description, thrustArea, uom, target, weightage } = req.body;
  const userGoals = db.goals.filter(g => g.userId === req.user.id && g.status !== 'rejected');
  if (userGoals.length >= 8) return res.status(400).json({ error: 'Maximum 8 goals allowed' });
  if (weightage < 10) return res.status(400).json({ error: 'Minimum weightage is 10%' });
  const totalWeight = userGoals.reduce((s, g) => s + g.weightage, 0) + weightage;
  if (totalWeight > 100) return res.status(400).json({ error: `Total weightage cannot exceed 100%. Current: ${totalWeight - weightage}%` });

  const goal = {
    id: `g${db.nextGoalId++}`,
    userId: req.user.id,
    title, description, thrustArea, uom, target, weightage,
    status: 'draft',
    lockedAt: null,
    achievements: { q1: null, q2: null, q3: null, q4: null },
    checkInStatus: { q1: 'Not Started', q2: 'Not Started', q3: 'Not Started', q4: 'Not Started' },
  };
  db.goals.push(goal);
  res.status(201).json(goal);
});

router.put('/:id', (req, res) => {
  const goal = db.goals.find(g => g.id === req.params.id);
  if (!goal) return res.status(404).json({ error: 'Goal not found' });
  if (goal.status === 'approved' && req.user.role === 'employee')
    return res.status(403).json({ error: 'Goal is locked. Contact admin to unlock.' });

  const allowed = ['title', 'description', 'thrustArea', 'uom', 'target', 'weightage', 'status', 'achievements', 'checkInStatus'];
  allowed.forEach(k => { if (req.body[k] !== undefined) goal[k] = req.body[k]; });

  if (req.body.status === 'approved') {
    goal.lockedAt = new Date().toISOString().split('T')[0];
    db.auditLog.push({ goalId: goal.id, action: 'approved', by: req.user.id, at: new Date().toISOString() });
  }
  if (req.body.status === 'submitted') {
    db.auditLog.push({ goalId: goal.id, action: 'submitted', by: req.user.id, at: new Date().toISOString() });
  }
  res.json(goal);
});

router.post('/:id/submit', requireRole('employee'), (req, res) => {
  const goal = db.goals.find(g => g.id === req.params.id && g.userId === req.user.id);
  if (!goal) return res.status(404).json({ error: 'Goal not found' });
  goal.status = 'submitted';
  db.auditLog.push({ goalId: goal.id, action: 'submitted', by: req.user.id, at: new Date().toISOString() });
  res.json(goal);
});

router.post('/submit-all', requireRole('employee'), (req, res) => {
  const userGoals = db.goals.filter(g => g.userId === req.user.id && g.status === 'draft');
  const totalWeight = db.goals.filter(g => g.userId === req.user.id).reduce((s, g) => s + g.weightage, 0);
  if (totalWeight !== 100) return res.status(400).json({ error: `Total weightage must equal 100%. Current: ${totalWeight}%` });
  userGoals.forEach(g => { g.status = 'submitted'; });
  res.json({ submitted: userGoals.length });
});

router.delete('/:id', requireRole('employee', 'admin'), (req, res) => {
  const idx = db.goals.findIndex(g => g.id === req.params.id);
  if (idx === -1) return res.status(404).json({ error: 'Not found' });
  const goal = db.goals[idx];
  if (goal.status === 'approved' && req.user.role !== 'admin')
    return res.status(403).json({ error: 'Cannot delete an approved goal' });
  db.goals.splice(idx, 1);
  res.json({ ok: true });
});

router.get('/audit', requireRole('admin'), (req, res) => res.json(db.auditLog));

export default router;
