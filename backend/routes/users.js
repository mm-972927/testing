import { Router } from 'express';
import { auth, requireRole } from '../middleware/auth.js';
import { db } from '../models/store.js';

const router = Router();
router.use(auth);

router.get('/', requireRole('manager', 'admin'), (req, res) => {
  const users = req.user.role === 'manager'
    ? db.users.filter(u => u.managerId === req.user.id)
    : db.users;
  res.json(users.map(({ password, ...u }) => u));
});

router.get('/stats', requireRole('admin'), (req, res) => {
  const employees = db.users.filter(u => u.role === 'employee');
  const allGoals = db.goals;
  res.json({
    totalEmployees: employees.length,
    goalsSubmitted: allGoals.filter(g => ['submitted', 'approved'].includes(g.status)).length,
    goalsApproved: allGoals.filter(g => g.status === 'approved').length,
    goalsPending: allGoals.filter(g => g.status === 'submitted').length,
    completionRate: Math.round((allGoals.filter(g => g.status === 'approved').length / Math.max(allGoals.length, 1)) * 100),
  });
});

export default router;
