import React, { createContext, useContext, useState } from "react";

export const AuthContext = createContext();
export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [userRole, setUserRole] = useState(null);
  const [loggedInStudentId, setLoggedInStudentId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [token, setToken] = useState(localStorage.getItem("token") || "");

  const login = async (username, password, role) => {
    setLoading(true);
    try {
      const response = await fetch("https://brainbox-student-management-system.onrender.com/api/token/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username, password }),
      });
      if (!response.ok) throw new Error("Login failed");
      const data = await response.json(); // { access: "...", refresh: "..." }
      localStorage.setItem("access_token", data.access);
      localStorage.setItem("refresh_token", data.refresh);
      setToken(data.access);
      setUserRole(role);
      if (role === "student") setLoggedInStudentId(username);
      setLoading(false);
      return true;
    } catch (error) {
      console.error("Login error:", error);
      setLoading(false);
      return false;
    }
  };

  const logout = () => {
    setUserRole(null);
    setLoggedInStudentId(null);
    setToken(null);
  };

  return (
    <AuthContext.Provider value={{ token, userRole, loggedInStudentId, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};