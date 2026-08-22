import React, { useState } from 'react';
import { useAuth } from '../store/AuthContext';
import logoImg from '../assets/logo.jpeg';
import { User, Lock, Eye, EyeOff, LogIn, AlertCircle } from 'lucide-react';

const Login = () => {
  const { login } = useAuth();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!username || !password) {
      setError('Please enter both username and password.');
      return;
    }
    setError('');
    setIsLoading(true);
    const success = await login(username, password);
    setIsLoading(false);
    if (!success) {
      setError('Invalid username or password. Please try again.');
    }
  };

  return (
    <div 
      className="d-flex align-center justify-center pos-rel overflow-hidden" 
      style={{ 
        minHeight: '100vh', 
        width: '100vw',
        background: 'radial-gradient(circle at 50% 20%, #1e293b 0%, #0f172a 60%, #070a12 100%)',
        color: '#f8fafc'
      }}
    >
      {/* Background Decorative Ambient Glow Orbs */}
      <div 
        style={{
          position: 'absolute',
          top: '15%',
          left: '50%',
          transform: 'translateX(-50%)',
          width: '500px',
          height: '500px',
          background: 'radial-gradient(circle, rgba(226, 55, 68, 0.25) 0%, rgba(226, 55, 68, 0) 70%)',
          pointerEvents: 'none',
          filter: 'blur(40px)'
        }}
      />
      <div 
        style={{
          position: 'absolute',
          bottom: '10%',
          right: '15%',
          width: '350px',
          height: '350px',
          background: 'radial-gradient(circle, rgba(59, 130, 246, 0.15) 0%, rgba(59, 130, 246, 0) 70%)',
          pointerEvents: 'none',
          filter: 'blur(50px)'
        }}
      />

      {/* Main Glassmorphic Login Container */}
      <div 
        className="w-100 p-40 z-10"
        style={{
          maxWidth: '420px',
          background: 'rgba(15, 23, 42, 0.8)',
          backdropFilter: 'blur(24px)',
          WebkitBackdropFilter: 'blur(24px)',
          border: '1px solid rgba(255, 255, 255, 0.12)',
          borderRadius: '24px',
          boxShadow: '0 25px 60px -15px rgba(0, 0, 0, 0.7), 0 0 30px rgba(226, 55, 68, 0.1)'
        }}
      >
        {/* Brand Header */}
        <div className="text-center mb-32">
          <div className="d-flex justify-center mb-16 pos-rel">
            <img 
              src={logoImg} 
              alt="AREA 51 Logo" 
              style={{
                width: '76px',
                height: '76px',
                objectFit: 'cover',
                borderRadius: '20px',
                border: '2px solid rgba(226, 55, 68, 0.6)',
                boxShadow: '0 10px 30px rgba(226, 55, 68, 0.35)'
              }} 
            />
          </div>
          <h2 className="m-0 fs-2xl fw-700 tracking-tight" style={{ color: '#ffffff' }}>
            AREA 51 <span style={{ color: '#e23744' }}>POS</span>
          </h2>
          <p className="m-0 mt-6 fs-sm" style={{ color: '#94a3b8' }}>
            Restaurant & Billing Management System
          </p>
        </div>

        {/* Error Alert Box */}
        {error && (
          <div 
            className="d-flex align-center gap-10 p-14 mb-20 radius-md fs-sm"
            style={{
              background: 'rgba(226, 55, 68, 0.12)',
              border: '1px solid rgba(226, 55, 68, 0.35)',
              color: '#ff8a8a'
            }}
          >
            <AlertCircle size={18} style={{ flexShrink: 0 }} />
            <span>{error}</span>
          </div>
        )}

        {/* Form Inputs */}
        <form onSubmit={handleSubmit} className="d-flex flex-col gap-20">
          <div>
            <label className="d-block mb-8 fs-xs fw-600 uppercase tracking-wider" style={{ color: '#cbd5e1' }}>
              Username
            </label>
            <div className="pos-rel d-flex align-center">
              <User 
                size={18} 
                style={{ position: 'absolute', left: '14px', color: '#94a3b8', pointerEvents: 'none' }} 
              />
              <input 
                type="text" 
                className="w-100"
                style={{
                  padding: '12px 14px 12px 42px',
                  background: 'rgba(255, 255, 255, 0.05)',
                  border: '1px solid rgba(255, 255, 255, 0.15)',
                  borderRadius: '12px',
                  color: '#ffffff',
                  fontSize: '15px',
                  outline: 'none',
                  transition: 'all 0.2s ease'
                }}
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Enter your username"
                autoFocus
              />
            </div>
          </div>

          <div>
            <label className="d-block mb-8 fs-xs fw-600 uppercase tracking-wider" style={{ color: '#cbd5e1' }}>
              Password
            </label>
            <div className="pos-rel d-flex align-center">
              <Lock 
                size={18} 
                style={{ position: 'absolute', left: '14px', color: '#94a3b8', pointerEvents: 'none' }} 
              />
              <input 
                type={showPassword ? 'text' : 'password'} 
                className="w-100"
                style={{
                  padding: '12px 42px 12px 42px',
                  background: 'rgba(255, 255, 255, 0.05)',
                  border: '1px solid rgba(255, 255, 255, 0.15)',
                  borderRadius: '12px',
                  color: '#ffffff',
                  fontSize: '15px',
                  outline: 'none',
                  transition: 'all 0.2s ease'
                }}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
              />
              <button 
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={{
                  position: 'absolute',
                  right: '12px',
                  background: 'none',
                  border: 'none',
                  color: '#94a3b8',
                  cursor: 'pointer',
                  padding: '4px',
                  display: 'flex',
                  alignItems: 'center'
                }}
                title={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <button 
            type="submit" 
            disabled={isLoading}
            className="w-100 d-flex align-center justify-center gap-8 fw-600 cursor-pointer mt-8"
            style={{
              padding: '14px 24px',
              background: 'linear-gradient(135deg, #e23744 0%, #c82333 100%)',
              border: 'none',
              borderRadius: '12px',
              color: '#ffffff',
              fontSize: '16px',
              boxShadow: '0 8px 25px rgba(226, 55, 68, 0.4)',
              transition: 'all 0.2s ease',
              opacity: isLoading ? 0.7 : 1
            }}
          >
            <LogIn size={18} />
            {isLoading ? 'Signing In...' : 'Sign In'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;
