import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export const useAuth = () => {
  return useContext(AuthContext);
};

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(() => {
    const saved = localStorage.getItem('foodq_user');
    return saved ? JSON.parse(saved) : null;
  });
  
  const [isAdmin, setIsAdmin] = useState(() => {
    const saved = localStorage.getItem('foodq_isAdmin');
    return saved === 'true';
  });

  const login = async (username, password) => {
    try {
      const response = await fetch('https://food-q-backend.onrender.com/api/token/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
      });

      if (response.ok) {
        const data = await response.json();
        // Save tokens securely
        localStorage.setItem('access_token', data.access);
        localStorage.setItem('refresh_token', data.refresh);
        
        // Define role based on username (or could fetch from backend profile endpoint)
        const isUserAdmin = username.toLowerCase() === 'admin';
        const user = { username: username, role: isUserAdmin ? 'Admin' : 'Staff', name: username };
        
        setCurrentUser(user);
        setIsAdmin(isUserAdmin);
        localStorage.setItem('foodq_user', JSON.stringify(user));
        localStorage.setItem('foodq_isAdmin', isUserAdmin ? 'true' : 'false');
        return true;
      }
    } catch (error) {
      console.error("Login error:", error);
    }
    return false;
  };

  const logout = () => {
    setCurrentUser(null);
    setIsAdmin(false);
    localStorage.removeItem('foodq_user');
    localStorage.removeItem('foodq_isAdmin');
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
  };

  const value = {
    currentUser,
    login,
    logout,
    isAdmin,
    isStaff: currentUser?.role === 'Staff',
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
