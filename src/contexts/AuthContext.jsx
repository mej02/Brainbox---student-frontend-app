import React, { createContext, useContext, useState } from "react";

export const AuthContext = createContext();
export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [userRole, setUserRole] = useState(null);
  const [loggedInStudentId, setLoggedInStudentId] = useState(null);
  const [loading, setLoading] = useState(false);

  const login = async (username, password, role) => {
    setLoading(true);
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000));
    setUserRole(role);
    if (role === "student") setLoggedInStudentId(username);
    setLoading(false);
    return true;
  };

  const logout = () => {
    setUserRole(null);
    setLoggedInStudentId(null);
  };

  const register = async (username, password, role, studentId) => {
    // Simulate registration
    return true;
  };

  return (
    <AuthContext.Provider value={{ userRole, loggedInStudentId, login, logout, register, loading }}>
      {children}
    </AuthContext.Provider>
  );
};