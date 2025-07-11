import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { useAuth } from "../contexts/AuthContext";

export const EnrollmentContext = createContext();
export const useEnrollments = () => useContext(EnrollmentContext);

const API_URL = "https://brainbox-student-management-system.onrender.com/api/enrollments/";

function getCookie(name) {
  let cookieValue = null;
  if (document.cookie && document.cookie !== "") {
    const cookies = document.cookie.split(";");
    for (let i = 0; i < cookies.length; i++) {
      const cookie = cookies[i].trim();
      if (cookie.substring(0, name.length + 1) === name + "=") {
        cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
        break;
      }
    }
  }
  return cookieValue;
}

export const EnrollmentProvider = ({ children }) => {
  const [enrollments, setEnrollments] = useState([]);
  const { token, logout } = useAuth();

  // Helper to handle token errors
  const handleTokenError = async (res) => {
    if (res.status === 401) {
      try {
        const errorData = await res.json();
        if (
          errorData?.detail === "Given token not valid for any token type" ||
          errorData?.code === "token_not_valid"
        ) {
          logout();
          window.location.reload();
        }
      } catch {
        logout();
        window.location.reload();
      }
    }
  };

  // Use useCallback to avoid infinite loop in useEffect
  const fetchEnrollments = useCallback(async () => {
    if (!token) return;
    try {
      const res = await fetch(API_URL, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      if (res.status === 401) {
        await handleTokenError(res);
        return;
      }
      if (!res.ok) throw new Error("Failed to fetch enrollments");
      const data = await res.json();
      setEnrollments(data);
    } catch (error) {
      console.error("Error fetching enrollments:", error);
      setEnrollments([]); // Prevents infinite error loop
    }
  }, [token]);

  const addEnrollment = async (enrollment) => {
    try {
      const csrfToken = getCookie("csrftoken");
      if (!token) throw new Error("No auth token");
      const response = await fetch(API_URL, {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
          "X-CSRFToken": csrfToken,
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify(enrollment),
      });
      if (response.status === 401) {
        await handleTokenError(response);
        return;
      }
      if (!response.ok) throw new Error("Failed to add enrollment");
      const newEnrollment = await response.json();
      setEnrollments(prev => [...prev, newEnrollment]);
    } catch (error) {
      console.error("Error adding enrollment:", error);
    }
  };

  const updateEnrollment = async (id, data) => {
    try {
      const csrfToken = getCookie("csrftoken");
      if (!token) throw new Error("No auth token");
      const response = await fetch(`${API_URL}${id}/`, {
        method: "PUT",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
          "X-CSRFToken": csrfToken,
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify(data),
      });
      if (response.status === 401) {
        await handleTokenError(response);
        return;
      }
      if (!response.ok) throw new Error("Failed to update enrollment");
      const updatedEnrollment = await response.json();
      setEnrollments(prev => prev.map(e => e.id === id ? updatedEnrollment : e));
    } catch (error) {
      console.error("Error updating enrollment:", error);
    }
  };

  const deleteEnrollment = async (id, tokenArg) => {
    try {
      const csrfToken = getCookie("csrftoken");
      const authToken = tokenArg || token;
      if (!authToken) throw new Error("No auth token");
      const response = await fetch(`${API_URL}${id}/`, {
        method: "DELETE",
        credentials: "include",
        headers: {
          "X-CSRFToken": csrfToken,
          "Authorization": `Bearer ${authToken}`,
        },
      });
      if (response.status === 401) {
        await handleTokenError(response);
        return;
      }
      if (!response.ok) throw new Error("Failed to delete enrollment");
      setEnrollments(prev => prev.filter(e => e.id !== id));
    } catch (error) {
      console.error("Error deleting enrollment:", error);
    }
  };

  useEffect(() => {
    fetchEnrollments();
  }, [fetchEnrollments]);

  return (
    <EnrollmentContext.Provider value={{
      enrollments,
      fetchEnrollments,
      addEnrollment,
      updateEnrollment,
      deleteEnrollment,
    }}>
      {children}
    </EnrollmentContext.Provider>
  );
};

// Component to display enrollments
const EnrollmentList = () => {
  const { enrollments, fetchEnrollments, deleteEnrollment } = useEnrollments();

  return (
    <ul>
      {enrollments.map(e => (
        <li key={e.id}>
          {e.subject_details?.name || e.subject}
        </li>
      ))}
    </ul>
  );
};

export default EnrollmentList;