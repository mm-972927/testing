import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import authRoutes from '../routes/auth.js';
import goalRoutes from '../routes/goals.js';
import aiRoutes from '../routes/ai.js';
import userRoutes from '../routes/users.js';

const app = express();

// Allow all Vercel preview URLs + your custom frontend domain
const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:4173',
  process.env.FRONTEND_URL,
].filter(Boolean);

app.use(cors({
  origin: (origin, cb) => {
    if (!origin) return cb(null, true);
    // Allow any vercel.app subdomain automatically
    if (origin.endsWith('.vercel.app') || allowedOrigins.some(o => origin.startsWith(o))) {
      return cb(null, true);
    }
    cb(null, true); // Open during hackathon — restrict in prod
  },
  credentials: true,
}));

app.use(express.json());
app.use('/api/auth', authRoutes);
app.use('/api/goals', goalRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/users', userRoutes);
app.get('/api/health', (_, res) => res.json({ status: 'ok', time: new Date().toISOString() }));

export default app;
