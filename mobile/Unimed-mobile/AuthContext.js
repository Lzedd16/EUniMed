// AuthContext.js
import React, { createContext, useState } from 'react';

// Create the Auth Context
export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null); // User state to hold the logged-in user

  const login = (userData) => {
    setUser(userData); // Set user data upon login
  };

  const logout = () => {
    setUser(null); // Clear user data upon logout
  };

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
