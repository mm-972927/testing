import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './hooks/useAuth';
import Layout from './components/shared/Layout';
import Login from './pages/Login';
import SignOut from './pages/SignOut';

import EmployeeDashboard from './pages/employee/Dashboard';
import Goals from './pages/employee/Goals';
import AIAssistant from './pages/employee/AIAssistant';
import RiskPredictor from './pages/employee/RiskPredictor';

import ManagerDashboard from './pages/manager/Dashboard';
import Approvals from './pages/manager/Approvals';
import TeamGoals from './pages/manager/TeamGoals';
import SharedGoals from './pages/manager/SharedGoals';

import AdminDashboard from './pages/admin/Dashboard';
import AdminGoals from './pages/admin/Goals';
import AdminUsers from './pages/admin/Users';
import AuditLog from './pages/admin/AuditLog';
import OrgRisk from './pages/admin/OrgRisk';
import CompletionDashboard from './pages/admin/CompletionDashboard';

import './styles/global.css';

function ProtectedRoute({ children, roles }) {
  const { user, loading } = useAuth();
  if (loading) return (
    <div style={{ display:'flex',alignItems:'center',justifyContent:'center',height:'100vh',color:'var(--gray-400)',fontSize:14,gap:10 }}>
      <svg width="20" height="20" fill="none" viewBox="0 0 24 24" style={{ animation:'spin 1s linear infinite' }}>
        <path d="M12 2L2 7l10 5 10-5-10-5z" stroke="var(--teal)" strokeWidth="2" strokeLinecap="round"/>
      </svg>
      Loading…
    </div>
  );
  if (!user) return <Navigate to="/login" replace />;
  if (roles && !roles.includes(user.role)) return <Navigate to={`/${user.role}`} replace />;
  return <Layout>{children}</Layout>;
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <style>{`@keyframes spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}`}</style>
        <Routes>
          <Route path="/login"   element={<Login />} />
          <Route path="/signout" element={<SignOut />} />
          <Route path="/"        element={<Navigate to="/login" replace />} />

          {/* Employee */}
          <Route path="/employee"           element={<ProtectedRoute roles={['employee']}><EmployeeDashboard /></ProtectedRoute>} />
          <Route path="/employee/goals"     element={<ProtectedRoute roles={['employee']}><Goals /></ProtectedRoute>} />
          <Route path="/employee/ai-assist" element={<ProtectedRoute roles={['employee']}><AIAssistant /></ProtectedRoute>} />
          <Route path="/employee/risk"      element={<ProtectedRoute roles={['employee']}><RiskPredictor /></ProtectedRoute>} />

          {/* Manager */}
          <Route path="/manager"            element={<ProtectedRoute roles={['manager']}><ManagerDashboard /></ProtectedRoute>} />
          <Route path="/manager/team"       element={<ProtectedRoute roles={['manager']}><TeamGoals /></ProtectedRoute>} />
          <Route path="/manager/approvals"  element={<ProtectedRoute roles={['manager']}><Approvals /></ProtectedRoute>} />
          <Route path="/manager/shared"     element={<ProtectedRoute roles={['manager']}><SharedGoals /></ProtectedRoute>} />
          <Route path="/manager/risk"       element={<ProtectedRoute roles={['manager']}><RiskPredictor /></ProtectedRoute>} />

          {/* Admin */}
          <Route path="/admin"              element={<ProtectedRoute roles={['admin']}><AdminDashboard /></ProtectedRoute>} />
          <Route path="/admin/users"        element={<ProtectedRoute roles={['admin']}><AdminUsers /></ProtectedRoute>} />
          <Route path="/admin/goals"        element={<ProtectedRoute roles={['admin']}><AdminGoals /></ProtectedRoute>} />
          <Route path="/admin/risk"         element={<ProtectedRoute roles={['admin']}><OrgRisk /></ProtectedRoute>} />
          <Route path="/admin/audit"        element={<ProtectedRoute roles={['admin']}><AuditLog /></ProtectedRoute>} />
          <Route path="/admin/completion"   element={<ProtectedRoute roles={['admin']}><CompletionDashboard /></ProtectedRoute>} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}
