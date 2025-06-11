import React, { createContext, useContext, useState } from "react";

export const SubjectContext = createContext();
export const useSubjects = () => useContext(SubjectContext);

const API_URL = "https://brainbox-student-management-system.onrender.com/api/subjects";

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

export const SubjectProvider = ({ children }) => {
  const [subjects, setSubjects] = useState([]);

  const fetchSubjects = async () => {
    try {
      const response = await fetch(API_URL, {
        method: "GET",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
      });
      if (!response.ok) throw new Error("Failed to fetch subjects");
      const data = await response.json();
      setSubjects(data);
    } catch (error) {
      console.error("Error fetching subjects:", error);
      setSubjects([]);
    }
  };

  const addSubject = async (subject) => {
    try {
      await ensureCSRFToken(); // <-- Add this line
      const csrfToken = getCookie("csrftoken");
      const response = await fetch(API_URL, {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
          "X-CSRFToken": csrfToken,
        },
        body: JSON.stringify(subject),
      });
      if (!response.ok) throw new Error("Failed to add subject");
      const newSubject = await response.json();
      setSubjects(prev => [...prev, newSubject]);
    } catch (error) {
      console.error("Error adding subject:", error);
    }
  };

  const updateSubject = async (id, data) => {
    try {
      await ensureCSRFToken(); // <-- Add this line
      const csrfToken = getCookie("csrftoken");
      const response = await fetch(`${API_URL}/${id}/`, {
        method: "PUT",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
          "X-CSRFToken": csrfToken,
        },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error("Failed to update subject");
      const updatedSubject = await response.json();
      setSubjects(prev => prev.map(s => s.id === id ? updatedSubject : s));
    } catch (error) {
      console.error("Error updating subject:", error);
    }
  };

  const deleteSubject = async (id) => {
    try {
      await ensureCSRFToken(); // <-- Add this line
      const csrfToken = getCookie("csrftoken");
      const response = await fetch(`${API_URL}/${id}/`, {
        method: "DELETE",
        credentials: "include",
        headers: {
          "X-CSRFToken": csrfToken,
        },
      });
      if (!response.ok) throw new Error("Failed to delete subject");
      setSubjects(prev => prev.filter(s => s.id !== id));
    } catch (error) {
      console.error("Error deleting subject:", error);
    }
  };

  const ensureCSRFToken = async () => {
    // Implementation for ensuring CSRF token
  };

  const login = async () => {
    // Implementation for logging in
  };

  return (
    <SubjectContext.Provider value={{
      subjects,
      fetchSubjects,
      addSubject,
      updateSubject,
      deleteSubject,
      ensureCSRFToken,
      login,
    }}>
      {children}
    </SubjectContext.Provider>
  );
};