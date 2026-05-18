# AtomQuest Goal Portal — AI Powered

A full-stack Goal Setting & Tracking portal for the AtomQuest Hackathon 1.0, with AI features powered by **Groq (Llama 3.3 70B)**.

---

## 🏗️ Project Structure

```
atomquest/
├── backend/          # Express.js API + Groq AI service
│   ├── server.js
│   ├── routes/       # auth, goals, ai, users
│   ├── models/       # in-memory data store + seed data
│   ├── middleware/   # JWT auth
│   └── services/ai/  # Groq integration
└── frontend/         # React + Vite SPA
    └── src/
        ├── pages/    # employee/, manager/, admin/
        ├── components/shared/
        ├── hooks/    # useAuth
        └── lib/      # axios api client
```

---

## 🚀 Quick Start

### 1. Backend

```bash
cd backend
cp .env.example .env
# Add your GROQ_API_KEY to .env
npm install
npm run dev
# API runs on http://localhost:4000
```

### 2. Frontend

```bash
cd frontend
npm install
npm run dev
# App runs on http://localhost:5173
```

---

## 🔐 Demo Credentials

| Role       | Email               | Password  |
|------------|---------------------|-----------|
| Employee   | employee@demo.com   | demo123   |
| Manager    | manager@demo.com    | demo123   |
| Admin / HR | admin@demo.com      | demo123   |

---

## ✦ AI Features (Groq / Llama 3.3 70B)

### Goal Creation Assistant (Employee)
- Suggests 3 SMART goals tailored to the employee's role and department
- Analyses existing goals to avoid duplication
- Each suggestion includes thrust area, UoM, target, weightage, and rationale
- "Improve a goal" — paste any goal and AI rewrites it to be sharper and more measurable

### Risk Predictor (Employee)
- Reads Q1 & Q2 actuals and predicts year-end achievement %
- Per-goal risk level: On Track / At Risk / Critical
- Specific recommendations per at-risk goal

### Team Risk AI (Manager)
- Analyses every team member's goal progress
- Surfaces team health: Healthy / Needs Attention / Critical
- Key insights + recommended manager actions

### Org Risk Intelligence (Admin)
- Same as team risk but across the entire organisation

---

## 📋 Features Implemented

- ✅ JWT authentication with role-based routing
- ✅ Goal creation with weightage validation (100% total, 10% min, 8 max)
- ✅ Submit for approval → Manager approves/returns → Goal locked
- ✅ Quarterly achievement entry (Q1–Q4) with auto-scoring
- ✅ Score calculation per UoM type (percent, numeric, max, zero, timeline)
- ✅ Manager approval workflow
- ✅ Admin goal management (approve/unlock any goal)
- ✅ Audit log for all goal state changes
- ✅ AI Goal Assistant (Groq)
- ✅ AI Risk Predictor (Groq)
- ✅ AI Team/Org Risk Summary (Groq)
- ✅ 3 pre-seeded employees with realistic goal data

---

## 🔧 Environment Variables

```env
GROQ_API_KEY=your_key_here        # from console.groq.com
JWT_SECRET=any_long_secret_string
PORT=4000
```

Get a free Groq API key at: https://console.groq.com

---

## 🏛️ Architecture

```
Browser (React + Vite)
    ↕ REST API (axios)
Express.js (Node.js)
    ├── JWT Auth Middleware
    ├── In-memory Data Store (seed data)
    └── Groq SDK → Llama 3.3 70B
```

> For production: replace in-memory store with PostgreSQL/MongoDB, add Redis for sessions, deploy backend to Railway/Render, frontend to Vercel/Netlify.
