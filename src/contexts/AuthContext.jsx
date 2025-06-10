import React, { createContext, useContext, useState } from "react";

export const AuthContext = createContext();
export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [userRole, setUserRole] = useState(null);
  const [loggedInStudentId, setLoggedInStudentId] = useState(null);
  const [loading, setLoading] = useState(false);

  const login = async (username, password, role) => {
  setLoading(true);
  try {
    // Get CSRF cookie first (already done in Login.jsx)
    const csrfToken = getCookie("csrftoken");
    const response = await fetch("https://brainbox-student-management-system.onrender.com/api/login/", {
      method: "POST",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
        "X-CSRFToken": csrfToken,
      },
      body: JSON.stringify({ username, password, role }),
    });
    if (!response.ok) throw new Error("Login failed");
    const data = await response.json();
    setUserRole(role);
    if (role === "student") setLoggedInStudentId(username);
    setLoading(false);
    return true;
  } catch (error) {
    setLoading(false);
    return false;
  }
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