import { Router } from 'express';
import { auth, requireRole } from '../middleware/auth.js';
import { db } from '../models/store.js';
import { suggestGoals, improveGoal, predictRisk, teamRiskSummary } from '../services/ai/groq.js';

const router = Router();
router.use(auth);

router.post('/suggest-goals', async (req, res) => {
  try {
    const userGoals = db.goals.filter(g => g.userId === req.user.id);
    const result = await suggestGoals({
      role: req.user.role,
      department: req.user.department,
      existingGoals: userGoals,
    });
    res.json(result);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'AI service error', detail: e.message });
  }
});

router.post('/improve-goal', async (req, res) => {
  try {
    const result = await improveGoal(req.body);
    res.json(result);
  } catch (e) {
    res.status(500).json({ error: 'AI service error', detail: e.message });
  }
});

router.get('/predict-risk', async (req, res) => {
  try {
    const userId = req.query.userId || req.user.id;
    if (userId !== req.user.id && req.user.role === 'employee')
      return res.status(403).json({ error: 'Forbidden' });
    const goals = db.goals.filter(g => g.userId === userId && g.status === 'approved');
    if (!goals.length) return res.json({ overallRisk: 'on-track', overallScore: 100, summary: 'No approved goals yet.', goals: [] });
    const result = await predictRisk(goals);
    res.json(result);
  } catch (e) {
    res.status(500).json({ error: 'AI service error', detail: e.message });
  }
});

router.get('/team-risk', requireRole('manager', 'admin'), async (req, res) => {
  try {
    const teamMembers = req.user.role === 'manager'
      ? db.users.filter(u => u.managerId === req.user.id)
      : db.users.filter(u => u.role === 'employee');

    const teamGoals = teamMembers.map(u => ({
      employee: u.name,
      department: u.department,
      goals: db.goals.filter(g => g.userId === u.id && g.status === 'approved').map(g => ({
        title: g.title,
        uom: g.uom,
        target: g.target,
        weightage: g.weightage,
        q1: g.achievements.q1,
        q2: g.achievements.q2,
        q1Status: g.checkInStatus.q1,
        q2Status: g.checkInStatus.q2,
      }))
    }));

    const result = await teamRiskSummary(teamGoals);
    res.json(result);
  } catch (e) {
    res.status(500).json({ error: 'AI service error', detail: e.message });
  }
});

export default router;
