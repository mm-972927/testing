import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import authRoutes from './routes/auth.js';
import goalRoutes from './routes/goals.js';
import aiRoutes from './routes/ai.js';
import userRoutes from './routes/users.js';

const app = express();

// Allow all Vercel preview URLs + localhost + configured frontend
app.use(cors({
  origin: (origin, cb) => {
    if (!origin) return cb(null, true); // curl, Postman, server-to-server
    const allowed = [
      'http://localhost:5173',
      'http://localhost:4173',
      'https://atomquest-six.vercel.app',
      process.env.FRONTEND_URL,
    ].filter(Boolean);
    // Also allow any *.vercel.app for preview deployments
    if (allowed.some(o => origin.startsWith(o)) || origin.endsWith('.vercel.app')) {
      return cb(null, true);
    }
    cb(new Error(`CORS blocked: ${origin}`));
  },
  credentials: true,
  methods: ['GET','POST','PUT','DELETE','OPTIONS'],
  allowedHeaders: ['Content-Type','Authorization'],
}));

app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/goals', goalRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/users', userRoutes);

app.get('/api/health', (_, res) => res.json({ status: 'ok', time: new Date().toISOString() }));

// For local dev
if (process.env.NODE_ENV !== 'production' || process.env.LOCAL_DEV) {
  const PORT = process.env.PORT || 4000;
  app.listen(PORT, () => console.log(`AtomQuest API running on http://localhost:${PORT}`));
}

export default app; // Vercel needs default export
