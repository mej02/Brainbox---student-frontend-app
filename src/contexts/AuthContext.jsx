import React, { createContext, useContext, useState } from "react";

export const AuthContext = createContext();
export const useAuth = () => useContext(AuthContext);

// Helper to get cookie by name
function getCookie(name) {
  let cookieValue = null;
  if (document.cookie && document.cookie !== "") {
    const cookies = document.cookie.split(";");
    for (let i = 0; i < cookies.length; i++) {
      const cookie = cookies[i].trim();
      // Does this cookie string begin with the name we want?
      if (cookie.substring(0, name.length + 1) === name + "=") {
        cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
        break;
      }
    }
  }
  return cookieValue;
}

export const AuthProvider = ({ children }) => {
  const [userRole, setUserRole] = useState(null);
  const [loggedInStudentId, setLoggedInStudentId] = useState(null);
  const [loading, setLoading] = useState(false);

  const login = async (username, password, role) => {
    setLoading(true);
    try {
      const csrfToken = getCookie("csrftoken");
      console.log("CSRF token being sent:", csrfToken);
      const headers = {
        "Content-Type": "application/json",
      };
      if (csrfToken) {
        headers["X-CSRFToken"] = csrfToken;
      }
      const response = await fetch("https://brainbox-student-management-system.onrender.com/api/login/", {
        method: "POST",
        credentials: "include",
        headers,
        body: JSON.stringify({ username, password, role }),
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