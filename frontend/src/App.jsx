import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './hooks/useAuth';
import Layout from './components/shared/Layout';
import Login    from './pages/Login';
import Register from './pages/Register';
import SignOut  from './pages/SignOut';

import EmployeeDashboard from './pages/employee/Dashboard';
import Goals             from './pages/employee/Goals';
import AIAssistant       from './pages/employee/AIAssistant';
import RiskPredictor     from './pages/employee/RiskPredictor';

import ManagerDashboard from './pages/manager/Dashboard';
import Approvals        from './pages/manager/Approvals';
import TeamGoals        from './pages/manager/TeamGoals';
import SharedGoals      from './pages/manager/SharedGoals';

import AdminDashboard       from './pages/admin/Dashboard';
import AdminGoals           from './pages/admin/Goals';
import AdminUsers           from './pages/admin/Users';
import AuditLog             from './pages/admin/AuditLog';
import OrgRisk              from './pages/admin/OrgRisk';
import CompletionDashboard  from './pages/admin/CompletionDashboard';

import './styles/global.css';

function Guard({ children, roles }) {
  const { user, loading } = useAuth();
  if (loading) return <div style={{ display:'flex',alignItems:'center',justifyContent:'center',height:'100vh',color:'#888',fontSize:14 }}>Loading…</div>;
  if (!user) return <Navigate to="/login" replace />;
  if (roles && !roles.includes(user.role)) return <Navigate to={`/${user.role}`} replace />;
  return <Layout>{children}</Layout>;
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/login"    element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/signout"  element={<SignOut />} />
          <Route path="/"         element={<Navigate to="/login" replace />} />

          <Route path="/employee"           element={<Guard roles={['employee']}><EmployeeDashboard /></Guard>} />
          <Route path="/employee/goals"     element={<Guard roles={['employee']}><Goals /></Guard>} />
          <Route path="/employee/ai-assist" element={<Guard roles={['employee']}><AIAssistant /></Guard>} />
          <Route path="/employee/risk"      element={<Guard roles={['employee']}><RiskPredictor /></Guard>} />

          <Route path="/manager"           element={<Guard roles={['manager']}><ManagerDashboard /></Guard>} />
          <Route path="/manager/team"      element={<Guard roles={['manager']}><TeamGoals /></Guard>} />
          <Route path="/manager/approvals" element={<Guard roles={['manager']}><Approvals /></Guard>} />
          <Route path="/manager/shared"    element={<Guard roles={['manager']}><SharedGoals /></Guard>} />
          <Route path="/manager/risk"      element={<Guard roles={['manager']}><RiskPredictor /></Guard>} />

          <Route path="/admin"            element={<Guard roles={['admin']}><AdminDashboard /></Guard>} />
          <Route path="/admin/users"      element={<Guard roles={['admin']}><AdminUsers /></Guard>} />
          <Route path="/admin/goals"      element={<Guard roles={['admin']}><AdminGoals /></Guard>} />
          <Route path="/admin/risk"       element={<Guard roles={['admin']}><OrgRisk /></Guard>} />
          <Route path="/admin/audit"      element={<Guard roles={['admin']}><AuditLog /></Guard>} />
          <Route path="/admin/completion" element={<Guard roles={['admin']}><CompletionDashboard /></Guard>} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}
