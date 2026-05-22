import { Router } from 'express';
import bcrypt     from 'bcryptjs';
import jwt        from 'jsonwebtoken';
import { db }     from '../models/store.js';

const router = Router();
const SECRET = process.env.JWT_SECRET || 'atomquest_secret_2025';

function makeToken(user) {
  return jwt.sign(
    { id: user.id, name: user.name, email: user.email, role: user.role, department: user.department, managerId: user.managerId || null },
    SECRET,
    { expiresIn: '8h' }
  );
}

// ── Login ─────────────────────────────────────────────────
router.post('/login', (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ error: 'Email and password required' });

  const user = db.users.find(u => u.email.toLowerCase() === email.toLowerCase().trim());
  if (!user || !bcrypt.compareSync(password, user.password))
    return res.status(401).json({ error: 'Invalid email or password' });

  res.json({ token: makeToken(user), user: { id: user.id, name: user.name, email: user.email, role: user.role, department: user.department } });
});

// ── Register — EMPLOYEES ONLY ─────────────────────────────
// Managers/Admins must be created by Admin via the Admin portal
router.post('/register', (req, res) => {
  const { name, email, password, department } = req.body;

  if (!name?.trim())     return res.status(400).json({ error: 'Full name is required' });
  if (!email?.trim())    return res.status(400).json({ error: 'Email is required' });
  if (!password)         return res.status(400).json({ error: 'Password is required' });
  if (password.length < 6) return res.status(400).json({ error: 'Password must be at least 6 characters' });

  const emailLower = email.toLowerCase().trim();
  if (db.users.find(u => u.email.toLowerCase() === emailLower))
    return res.status(409).json({ error: 'An account with this email already exists. Try signing in.' });

  // Registration always creates an EMPLOYEE
  // Manager / Admin accounts are created by Admin only
  const newUser = {
    id:         `u${Date.now()}`,
    name:       name.trim(),
    email:      emailLower,
    password:   bcrypt.hashSync(password, 10),
    role:       'employee',          // ALWAYS employee on self-registration
    managerId:  null,
    department: department?.trim() || 'General',
  };
  db.users.push(newUser);

  res.status(201).json({
    token: makeToken(newUser),
    user:  { id: newUser.id, name: newUser.name, email: newUser.email, role: newUser.role, department: newUser.department },
  });
});

// ── Create user (Admin only) ──────────────────────────────
router.post('/create-user', (req, res) => {
  // Verify caller is admin
  const header = req.headers.authorization;
  if (!header) return res.status(401).json({ error: 'Unauthorized' });
  let caller;
  try { caller = jwt.verify(header.split(' ')[1], SECRET); }
  catch { return res.status(401).json({ error: 'Invalid token' }); }
  if (caller.role !== 'admin') return res.status(403).json({ error: 'Only Admin can create Manager accounts' });

  const { name, email, password, role, department, managerId } = req.body;
  if (!name || !email || !password) return res.status(400).json({ error: 'Name, email and password are required' });
  if (!['employee','manager','admin'].includes(role)) return res.status(400).json({ error: 'Invalid role' });
  if (password.length < 6) return res.status(400).json({ error: 'Password must be at least 6 characters' });

  const emailLower = email.toLowerCase().trim();
  if (db.users.find(u => u.email.toLowerCase() === emailLower))
    return res.status(409).json({ error: 'Email already in use' });

  const newUser = {
    id:         `u${Date.now()}`,
    name:       name.trim(),
    email:      emailLower,
    password:   bcrypt.hashSync(password, 10),
    role,
    managerId:  managerId || null,
    department: department || 'General',
  };
  db.users.push(newUser);
  res.status(201).json({ user: { id: newUser.id, name: newUser.name, email: newUser.email, role: newUser.role, department: newUser.department } });
});

// ── Verify token ──────────────────────────────────────────
router.get('/me', (req, res) => {
  const header = req.headers.authorization;
  if (!header) return res.status(401).json({ error: 'No token' });
  try {
    const user = jwt.verify(header.split(' ')[1], SECRET);
    res.json(user);
  } catch {
    res.status(401).json({ error: 'Invalid or expired token' });
  }
});

export default router;
