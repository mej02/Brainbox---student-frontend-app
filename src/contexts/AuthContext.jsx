import React, { createContext, useContext, useState } from "react";
import { getCookie } from "../utils/csrf";

export const AuthContext = createContext();
export const useAuth = () => useContext(AuthContext);


export const AuthProvider = ({ children }) => {
  const [userRole, setUserRole] = useState(null);
  const [loggedInStudentId, setLoggedInStudentId] = useState(null);
  const [loading, setLoading] = useState(false);

  const login = async (username, password, role) => {
    setLoading(true);
    try {
      const csrftoken = getCookie("csrftoken");
      console.log("CSRF token being sent:", csrftoken);
      const response = await fetch("https://brainbox-student-management-system.onrender.com/api/login/", {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
          "X-CSRFToken": csrftoken,
        },
        body: JSON.stringify({ username, password }),
      });
      if (!response.ok) throw new Error("Login failed");
      await response.json();
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
  };

  return (
    <AuthContext.Provider value={{ userRole, loggedInStudentId, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};