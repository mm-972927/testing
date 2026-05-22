import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import authRoutes from './routes/auth.js';
import goalRoutes from './routes/goals.js';
import aiRoutes   from './routes/ai.js';
import userRoutes from './routes/users.js';

const app = express();

// Whitelist — add your Vercel frontend URL here
const ALLOWED = [
  'http://localhost:5173',
  'http://localhost:4173',
  'https://atomquest-six.vercel.app',
  'https://atomquest-gzbs.vercel.app',
];

app.use(cors({
  origin: (origin, cb) => {
    // Allow requests with no origin (Postman, server-to-server, Vercel health checks)
    if (!origin) return cb(null, true);
    // Allow any *.vercel.app subdomain (covers preview deployments)
    if (origin.endsWith('.vercel.app')) return cb(null, true);
    // Allow explicit whitelist
    if (ALLOWED.includes(origin)) return cb(null, true);
    // Allow if FRONTEND_URL env var is set and matches
    if (process.env.FRONTEND_URL && origin.startsWith(process.env.FRONTEND_URL)) return cb(null, true);
    cb(new Error(`CORS: ${origin} not allowed`));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

// Handle preflight for all routes
app.options('*', cors());
app.use(express.json());

app.use('/api/auth',  authRoutes);
app.use('/api/goals', goalRoutes);
app.use('/api/ai',    aiRoutes);
app.use('/api/users', userRoutes);

app.get('/api/health', (_, res) => res.json({
  status: 'ok',
  time: new Date().toISOString(),
  env: process.env.NODE_ENV || 'development',
}));

// Vercel serverless: export the app, don't call listen()
// For local dev: node server.js starts it
if (process.env.NODE_ENV !== 'production') {
  const PORT = process.env.PORT || 4000;
  app.listen(PORT, () => console.log(`AtomQuest API → http://localhost:${PORT}`));
}

export default app;
