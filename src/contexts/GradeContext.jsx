import React, { createContext, useContext, useState } from "react";
import { toast } from "react-toastify";

export const GradeContext = createContext();
export const useGradeContext = () => useContext(GradeContext);

const API_URL = "https://brainbox-student-management-system.onrender.com/api/grades/";

export const GradeProvider = ({ children }) => {
  const [grades, setGrades] = useState([]);

  const fetchGrades = async (token) => {
    const res = await fetch(API_URL, {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    if (!res.ok) throw new Error("Failed to fetch grades");
    const data = await res.json();
    setGrades(data);
  };

  // Accept token as parameter
  const addGrade = async (grade, token) => {
    try {
      const response = await fetch(API_URL, {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify(grade),
      });
      if (!response.ok) throw new Error("Failed to add grade");
      const newGrade = await response.json();
      setGrades(prev => [...prev, newGrade]);
      toast.success("Grade added successfully!");
      return true;
    } catch (error) {
      console.error("Error adding grade:", error);
      toast.error("Failed to add grade!");
      return false;
    }
  };

  const updateGrade = async (id, data, token) => {
    try {
      const response = await fetch(`${API_URL}${id}/`, {
        method: "PUT",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error("Failed to update grade");
      const updatedGrade = await response.json();
      setGrades(prev => prev.map(g => g.id === id ? updatedGrade : g));
      toast.success("Grade updated successfully!");
      return true;
    } catch (error) {
      console.error("Error updating grade:", error);
      toast.error("Failed to update grade!");
      return false;
    }
  };

  const deleteGrade = async (id, token) => {
    try {
      const response = await fetch(`${API_URL}${id}/`, {
        method: "DELETE",
        credentials: "include",
        headers: {
          "Authorization": `Bearer ${token}`,
        },
      });
      if (!response.ok) throw new Error("Failed to delete grade");
      setGrades(prev => prev.filter(g => g.id !== id));
      toast.success("Grade deleted successfully!");
      return true;
    } catch (error) {
      console.error("Error deleting grade:", error);
      toast.error("Failed to delete grade!");
      return false;
    }
  };

  return (
    <GradeContext.Provider value={{
      grades,
      fetchGrades,
      addGrade,
      updateGrade,
      deleteGrade,
    }}>
      {children}
    </GradeContext.Provider>
  );
};