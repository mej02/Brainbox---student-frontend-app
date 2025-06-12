import React, { createContext, useContext, useState } from "react";
import { toast } from "react-toastify";

export const SubjectContext = createContext();
export const useSubjects = () => useContext(SubjectContext);

const API_URL = "https://brainbox-student-management-system.onrender.com/api/subjects/";

export const SubjectProvider = ({ children }) => {
  const [subjects, setSubjects] = useState([]);

  const fetchSubjects = async (token) => {
    const res = await fetch(API_URL, {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    if (!res.ok) throw new Error("Failed to fetch subjects");
    const data = await res.json();
    setSubjects(data);
  };

  // Accept token as parameter
  const addSubject = async (subject, token) => {
    try {
      const response = await fetch(API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify(subject),
      });
      if (!response.ok) throw new Error("Failed to add subject");
      const newSubject = await response.json();
      setSubjects(prev => [...prev, newSubject]);
      toast.success("Subject added successfully!");
      return true;
    } catch (error) {
      console.error("Error adding subject:", error);
      toast.error("Failed to add subject!");
      return false;
    }
  };

  const updateSubject = async (id, data, token) => {
    try {
      const response = await fetch(`${API_URL}${id}/`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error("Failed to update subject");
      const updatedSubject = await response.json();
      setSubjects(prev => prev.map(s => s.id === id ? updatedSubject : s));
      toast.success("Subject updated successfully!");
      return true;
    } catch (error) {
      console.error("Error updating subject:", error);
      toast.error("Failed to update subject!");
      return false;
    }
  };

  const deleteSubject = async (id, token) => {
    try {
      const response = await fetch(`${API_URL}${id}/`, {
        method: "DELETE",
        headers: {
          "Authorization": `Bearer ${token}`,
        },
      });
      if (!response.ok) throw new Error("Failed to delete subject");
      setSubjects(prev => prev.filter(s => s.id !== id));
      toast.success("Subject deleted successfully!");
      return true;
    } catch (error) {
      console.error("Error deleting subject:", error);
      toast.error("Failed to delete subject!");
      return false;
    }
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
      login,
    }}>
      {children}
    </SubjectContext.Provider>
  );
};