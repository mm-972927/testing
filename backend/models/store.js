import bcrypt from 'bcryptjs';

const hash = (p) => bcrypt.hashSync(p, 10);

export const db = {
  users: [
    { id: 'u1', name: 'Arjun Sharma',   email: 'employee@demo.com', password: hash('demo123'), role: 'employee', managerId: 'u2', department: 'Engineering' },
    { id: 'u2', name: 'Priya Mehta',    email: 'manager@demo.com',  password: hash('demo123'), role: 'manager',  managerId: 'u3', department: 'Engineering' },
    { id: 'u3', name: 'Ravi Nair',      email: 'admin@demo.com',    password: hash('demo123'), role: 'admin',    managerId: null, department: 'HR' },
    { id: 'u4', name: 'Sneha Patel',    email: 'sneha@demo.com',    password: hash('demo123'), role: 'employee', managerId: 'u2', department: 'Engineering' },
    { id: 'u5', name: 'Karan Verma',    email: 'karan@demo.com',    password: hash('demo123'), role: 'employee', managerId: 'u2', department: 'Engineering' },
  ],

  goals: [
    {
      id: 'g1', userId: 'u1', title: 'Increase API response time efficiency',
      description: 'Reduce average API response time by optimizing queries and caching.',
      thrustArea: 'Technology', uom: 'percent', target: 40, weightage: 30,
      status: 'approved', lockedAt: '2025-05-10',
      achievements: { q1: 18, q2: 28, q3: null, q4: null },
      checkInStatus: { q1: 'On Track', q2: 'On Track', q3: 'Not Started', q4: 'Not Started' }
    },
    {
      id: 'g2', userId: 'u1', title: 'Complete AWS Solutions Architect certification',
      description: 'Obtain AWS SA Associate certification by Q3.',
      thrustArea: 'Learning & Development', uom: 'timeline', target: '2025-09-30', weightage: 20,
      status: 'approved', lockedAt: '2025-05-10',
      achievements: { q1: null, q2: null, q3: null, q4: null },
      checkInStatus: { q1: 'Not Started', q2: 'On Track', q3: 'Not Started', q4: 'Not Started' }
    },
    {
      id: 'g3', userId: 'u1', title: 'Zero critical production incidents',
      description: 'Maintain zero P1/P2 incidents attributed to team deliverables.',
      thrustArea: 'Quality', uom: 'zero', target: 0, weightage: 25,
      status: 'approved', lockedAt: '2025-05-10',
      achievements: { q1: 0, q2: 1, q3: null, q4: null },
      checkInStatus: { q1: 'Completed', q2: 'On Track', q3: 'Not Started', q4: 'Not Started' }
    },
    {
      id: 'g4', userId: 'u1', title: 'Reduce sprint story point carryover',
      description: 'Keep carryover below 10% across all sprints.',
      thrustArea: 'Delivery', uom: 'max', target: 10, weightage: 25,
      status: 'approved', lockedAt: '2025-05-10',
      achievements: { q1: 8, q2: 12, q3: null, q4: null },
      checkInStatus: { q1: 'Completed', q2: 'On Track', q3: 'Not Started', q4: 'Not Started' }
    },

    {
      id: 'g5', userId: 'u4', title: 'Deliver microservices migration phase 1',
      description: 'Migrate 3 legacy services to microservices architecture.',
      thrustArea: 'Technology', uom: 'numeric', target: 3, weightage: 40,
      status: 'approved', lockedAt: '2025-05-10',
      achievements: { q1: 1, q2: 1, q3: null, q4: null },
      checkInStatus: { q1: 'On Track', q2: 'On Track', q3: 'Not Started', q4: 'Not Started' }
    },
    {
      id: 'g6', userId: 'u4', title: 'Improve test coverage to 85%',
      description: 'Increase unit and integration test coverage.',
      thrustArea: 'Quality', uom: 'percent', target: 85, weightage: 35,
      status: 'approved', lockedAt: '2025-05-10',
      achievements: { q1: 62, q2: 70, q3: null, q4: null },
      checkInStatus: { q1: 'On Track', q2: 'On Track', q3: 'Not Started', q4: 'Not Started' }
    },
    {
      id: 'g7', userId: 'u4', title: 'Complete system design course',
      description: 'Finish advanced system design program on Educative.',
      thrustArea: 'Learning & Development', uom: 'timeline', target: '2025-12-31', weightage: 25,
      status: 'pending', lockedAt: null,
      achievements: { q1: null, q2: null, q3: null, q4: null },
      checkInStatus: { q1: 'Not Started', q2: 'Not Started', q3: 'Not Started', q4: 'Not Started' }
    },

    {
      id: 'g8', userId: 'u5', title: 'Build internal analytics dashboard',
      description: 'Create self-serve dashboard for product metrics.',
      thrustArea: 'Delivery', uom: 'numeric', target: 1, weightage: 50,
      status: 'approved', lockedAt: '2025-05-10',
      achievements: { q1: 0, q2: 0, q3: null, q4: null },
      checkInStatus: { q1: 'Not Started', q2: 'Not Started', q3: 'Not Started', q4: 'Not Started' }
    },
    {
      id: 'g9', userId: 'u5', title: 'Reduce bug resolution SLA breach',
      description: 'Keep SLA breach rate below 5%.',
      thrustArea: 'Quality', uom: 'max', target: 5, weightage: 30,
      status: 'approved', lockedAt: '2025-05-10',
      achievements: { q1: 12, q2: 9, q3: null, q4: null },
      checkInStatus: { q1: 'On Track', q2: 'On Track', q3: 'Not Started', q4: 'Not Started' }
    },
    {
      id: 'g10', userId: 'u5', title: 'Mentor 2 junior engineers',
      description: 'Conduct fortnightly 1:1s and review PRs.',
      thrustArea: 'People', uom: 'numeric', target: 2, weightage: 20,
      status: 'approved', lockedAt: '2025-05-10',
      achievements: { q1: 1, q2: 2, q3: null, q4: null },
      checkInStatus: { q1: 'On Track', q2: 'Completed', q3: 'Not Started', q4: 'Not Started' }
    },
  ],

  checkins: [],
  auditLog: [],
  nextGoalId: 11,
};

export const thrustAreas = ['Technology', 'Delivery', 'Quality', 'Learning & Development', 'People', 'Customer', 'Finance'];
export const uomTypes = ['percent', 'numeric', 'timeline', 'zero', 'max'];
export const quarters = ['q1', 'q2', 'q3', 'q4'];
