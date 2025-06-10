import React, { createContext, useContext, useState } from "react";

export const GradeContext = createContext();
export const useGradeContext = () => useContext(GradeContext);

export const GradeProvider = ({ children }) => {
  const [grades, setGrades] = useState([]);

  // Example implementations
  const fetchGrades = async () => {
    setGrades([]); // Replace with real fetch logic
  };
  const addGrade = async (grade) => {
    setGrades(prev => [...prev, grade]);
  };
  const updateGrade = async (id, data) => {
    setGrades(prev => prev.map(g => g.id === id ? { ...g, ...data } : g));
  };
  const deleteGrade = async (id) => {
    setGrades(prev => prev.filter(g => g.id !== id));
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