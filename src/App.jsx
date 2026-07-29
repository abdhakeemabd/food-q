import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './store/AuthContext';
import logoImg from './assets/logo.jpeg';
import Layout from './components/Layout';
import Billing from './pages/Billing';
import Order from './pages/Order';
import BillList from './pages/BillList';
import Finance from './pages/Finance';

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
    <div style={{ display: 'flex', height: '100vh', alignItems: 'center', justifyContent: 'center', backgroundColor: 'var(--bg-primary)' }}>
      <div className="glass-panel" style={{ padding: '40px', width: '100%', maxWidth: '400px' }}>
          <div style={{ textAlign: 'center', marginBottom: '24px' }}>
            <img src={logoImg} alt="Food-Q Logo" style={{ width: '90px', height: '90px', objectFit: 'cover', margin: '0 auto 16px', display: 'block', borderRadius: '16px', boxShadow: '0 4px 20px rgba(226,55,68,0.3)' }} />
            <h2 style={{ margin: '0 0 8px 0' }}>Food-Q Login</h2>
            <p style={{ color: 'var(--text-muted)', margin: 0 }}>Sign in to continue</p>
          </div>
        
        {error && <div style={{ color: 'var(--primary-color)', marginBottom: '16px', fontSize: '0.9rem' }}>{error}</div>}
        
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
          <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '16px' }}>
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
