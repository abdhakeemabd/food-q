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
import Settings from './pages/Settings';
import Login from './pages/Login';

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
