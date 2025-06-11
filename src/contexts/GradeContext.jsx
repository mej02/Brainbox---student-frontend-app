import React, { createContext, useContext, useState } from "react";

export const GradeContext = createContext();
export const useGradeContext = () => useContext(GradeContext);

const API_URL = "https://brainbox-student-management-system.onrender.com/api/grades";

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
      const csrfToken = getCookie("csrftoken");
      const response = await fetch(API_URL, {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
          "X-CSRFToken": csrfToken,
        },
        body: JSON.stringify(grade),
      });
      if (!response.ok) throw new Error("Failed to add grade");
      const newGrade = await response.json();
      setGrades(prev => [...prev, newGrade]);
    } catch (error) {
      console.error("Error adding grade:", error);
    }
  };

  const updateGrade = async (id, data) => {
    try {
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
      if (!response.ok) throw new Error("Failed to update grade");
      const updatedGrade = await response.json();
      setGrades(prev => prev.map(g => g.id === id ? updatedGrade : g));
    } catch (error) {
      console.error("Error updating grade:", error);
    }
  };

  const deleteGrade = async (id) => {
    try {
      const csrfToken = getCookie("csrftoken");
      const response = await fetch(`${API_URL}/${id}/`, {
        method: "DELETE",
        credentials: "include",
        headers: {
          "X-CSRFToken": csrfToken,
        },
      });
      if (!response.ok) throw new Error("Failed to delete grade");
      setGrades(prev => prev.filter(g => g.id !== id));
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