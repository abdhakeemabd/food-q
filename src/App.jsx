import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './store/AuthContext';
import logoImg from './assets/logo.jpeg';
import Layout from './components/Layout';
import Billing from './pages/Billing';
import Order from './pages/Order';
import BillList from './pages/BillList';
import Finance from './pages/Finance';
import DailyTracker from './pages/DailyTracker';

import Dashboard from './pages/Dashboard';
import Employees from './pages/Employees';
import Inventory from './pages/Inventory';
import Customers from './pages/Customers';
import Reports from './pages/Reports';
import Tables from './pages/Tables';

// Placeholder Pages
const Settings = () => <div><h2>Settings</h2><p>System configuration</p></div>;

const Login = () => {
  const { login } = useAuth();
  const [username, setUsername] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [error, setError] = React.useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    const success = await login(username, password);
    if (!success) {
      setError('Invalid credentials. Please try again.');
    }
  };

  return (
    <div className="d-flex h-100 align-center justify-center bg-primary">
      <div className="glass-panel p-40 w-100 max-w-400">
          <div className="text-center mb-24">
            <img src={logoImg} alt="Food-Q Logo" className="logo-img mb-16 d-block radius-lg shadow-glow" />
            <h2 className="page-title">Food-Q Login</h2>
            <p className="text-muted m-0">Sign in to continue</p>
          </div>
        
        {error && <div className="text-primary mb-16 fs-sm">{error}</div>}
        
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Username</label>
            <input 
              type="text" 
              className="form-input" 
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="admin / staff"
            />
          </div>
          <div className="form-group">
            <label className="form-label">Password</label>
            <input 
              type="password" 
              className="form-input" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
            />
          </div>
          <button type="submit" className="btn btn-primary w-100 mt-16">
            Sign In
          </button>
        </form>
      </div>
    </div>
  );
};

const ProtectedRoute = ({ children, requireAdmin = false }) => {
  const { currentUser, isAdmin } = useAuth();
  
  if (!currentUser) return <Navigate to="/login" />;
  if (requireAdmin && !isAdmin) return <Navigate to="/" />;
  
  return children;
};

function App() {
  const { currentUser } = useAuth();

  return (
    <Routes>
      <Route path="/login" element={currentUser ? <Navigate to="/" /> : <Login />} />
      
      <Route path="/" element={
        <ProtectedRoute>
          <Layout />
        </ProtectedRoute>
      }>
        <Route index element={<Dashboard />} />
        <Route path="order" element={<Order />} />
        <Route path="billing" element={<Billing />} />
        <Route path="bills" element={<BillList />} />
        <Route path="finance" element={<Finance />} />
        <Route path="daily-tracker" element={<DailyTracker />} />
        <Route path="inventory" element={<Inventory />} />
        <Route path="customers" element={<Customers />} />
        <Route path="tables" element={<Tables />} />
        
        {/* Admin only routes */}
        <Route path="employees" element={
          <ProtectedRoute requireAdmin={true}>
            <Employees />
          </ProtectedRoute>
        } />
        <Route path="reports" element={
          <ProtectedRoute requireAdmin={true}>
            <Reports />
          </ProtectedRoute>
        } />
        <Route path="settings" element={
          <ProtectedRoute requireAdmin={true}>
            <Settings />
          </ProtectedRoute>
        } />
      </Route>
    </Routes>
  );
}

export default App;
