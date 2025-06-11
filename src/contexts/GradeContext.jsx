import React, { createContext, useContext, useState } from "react";
import { toast } from "react-toastify";

export const GradeContext = createContext();
export const useGradeContext = () => useContext(GradeContext);

const API_URL = "https://brainbox-student-management-system.onrender.com/api/grades/";

export const GradeProvider = ({ children }) => {
  const [grades, setGrades] = useState([]);


  const fetchGrades = async () => {
    try {
      const response = await fetch(API_URL, {
        method: "GET",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
      });
      if (!response.ok) throw new Error("Failed to fetch grades");
      const data = await response.json();
      setGrades(data);
    } catch (error) {
      console.error("Error fetching grades:", error);
      setGrades([]);
    }
  };

  const addGrade = async (grade) => {
    try {
      
      const accessToken = localStorage.getItem("access_token");
      const response = await fetch(API_URL, {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${accessToken}`,
        },
        body: JSON.stringify(grade),
      });
      if (!response.ok) throw new Error("Failed to add grade");
      const newGrade = await response.json();
      setGrades(prev => [...prev, newGrade]);
      toast.success("Grade added successfully!");
    } catch (error) {
      console.error("Error adding grade:", error);
      toast.error("Failed to add grade!");
    }
  };

  const updateGrade = async (id, data) => {
    try {
      const accessToken = localStorage.getItem("access_token");
      const response = await fetch(`${API_URL}${id}/`, {
        method: "PUT",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${accessToken}`,
        },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error("Failed to update grade");
      const updatedGrade = await response.json();
      setGrades(prev => prev.map(g => g.id === id ? updatedGrade : g));
      toast.success("Grade updated successfully!");
    } catch (error) {
      console.error("Error updating grade:", error);
    }
  };

  const deleteGrade = async (id) => {
    try {
      const accessToken = localStorage.getItem("access_token");
      const response = await fetch(`${API_URL}${id}/`, {
        method: "DELETE",
        credentials: "include",
        headers: {
          "Authorization": `Bearer ${accessToken}`,
        },
      });
      if (!response.ok) throw new Error("Failed to delete grade");
      setGrades(prev => prev.filter(g => g.id !== id));
      toast.success("Grade deleted successfully!");
    } catch (error) {
      console.error("Error deleting grade:", error);
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