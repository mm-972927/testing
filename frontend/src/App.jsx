import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './hooks/useAuth';
import Layout from './components/shared/Layout';
import Login from './pages/Login';
import EmployeeDashboard from './pages/employee/Dashboard';
import Goals from './pages/employee/Goals';
import AIAssistant from './pages/employee/AIAssistant';
import RiskPredictor from './pages/employee/RiskPredictor';
import ManagerDashboard from './pages/manager/Dashboard';
import Approvals from './pages/manager/Approvals';
import TeamGoals from './pages/manager/TeamGoals';
import AdminDashboard from './pages/admin/Dashboard';
import AdminGoals from './pages/admin/Goals';
import AdminUsers from './pages/admin/Users';
import AuditLog from './pages/admin/AuditLog';
import OrgRisk from './pages/admin/OrgRisk';
import './styles/global.css';

function ProtectedRoute({ children, roles }) {
  const { user, loading } = useAuth();
  if (loading) return <div style={{ display:'flex',alignItems:'center',justifyContent:'center',height:'100vh',color:'var(--gray-400)',fontSize:14 }}>Loading…</div>;
  if (!user) return <Navigate to="/login" replace />;
  if (roles && !roles.includes(user.role)) return <Navigate to={`/${user.role}`} replace />;
  return <Layout>{children}</Layout>;
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="/employee" element={<ProtectedRoute roles={['employee']}><EmployeeDashboard /></ProtectedRoute>} />
          <Route path="/employee/goals" element={<ProtectedRoute roles={['employee']}><Goals /></ProtectedRoute>} />
          <Route path="/employee/ai-assist" element={<ProtectedRoute roles={['employee']}><AIAssistant /></ProtectedRoute>} />
          <Route path="/employee/risk" element={<ProtectedRoute roles={['employee']}><RiskPredictor /></ProtectedRoute>} />
          <Route path="/manager" element={<ProtectedRoute roles={['manager']}><ManagerDashboard /></ProtectedRoute>} />
          <Route path="/manager/team" element={<ProtectedRoute roles={['manager']}><TeamGoals /></ProtectedRoute>} />
          <Route path="/manager/approvals" element={<ProtectedRoute roles={['manager']}><Approvals /></ProtectedRoute>} />
          <Route path="/manager/risk" element={<ProtectedRoute roles={['manager']}><RiskPredictor /></ProtectedRoute>} />
          <Route path="/admin" element={<ProtectedRoute roles={['admin']}><AdminDashboard /></ProtectedRoute>} />
          <Route path="/admin/users" element={<ProtectedRoute roles={['admin']}><AdminUsers /></ProtectedRoute>} />
          <Route path="/admin/goals" element={<ProtectedRoute roles={['admin']}><AdminGoals /></ProtectedRoute>} />
          <Route path="/admin/risk" element={<ProtectedRoute roles={['admin']}><OrgRisk /></ProtectedRoute>} />
          <Route path="/admin/audit" element={<ProtectedRoute roles={['admin']}><AuditLog /></ProtectedRoute>} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}
