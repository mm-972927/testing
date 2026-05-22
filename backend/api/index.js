import 'dotenv/config';
import express from 'express';
import cors    from 'cors';
import authRoutes from '../routes/auth.js';
import goalRoutes from '../routes/goals.js';
import aiRoutes   from '../routes/ai.js';
import userRoutes from '../routes/users.js';

const app = express();

// CORS: allow all *.vercel.app + localhost
app.use(cors({
  origin: (origin, cb) => {
    if (!origin) return cb(null, true); // Postman / server-to-server / Vercel health
    if (
      origin.endsWith('.vercel.app') ||
      origin.startsWith('http://localhost:')
    ) return cb(null, true);
    if (process.env.FRONTEND_URL && origin.startsWith(process.env.FRONTEND_URL))
      return cb(null, true);
    cb(null, true); // Open during hackathon — tighten in production
  },
  credentials: true,
  methods: ['GET','POST','PUT','DELETE','OPTIONS','PATCH'],
  allowedHeaders: ['Content-Type','Authorization'],
}));

app.options('*', cors()); // Handle all preflight requests
app.use(express.json());

app.use('/api/auth',  authRoutes);
app.use('/api/goals', goalRoutes);
app.use('/api/ai',    aiRoutes);
app.use('/api/users', userRoutes);

app.get('/api/health', (_, res) =>
  res.json({ status: 'ok', time: new Date().toISOString() })
);

// Catch-all 404
app.use((req, res) =>
  res.status(404).json({ error: `Route not found: ${req.method} ${req.path}` })
);

export default app;
