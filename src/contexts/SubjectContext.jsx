import React, { createContext, useContext, useState } from "react";

export const SubjectContext = createContext();
export const useSubjects = () => useContext(SubjectContext);

export const SubjectProvider = ({ children }) => {
  const [subjects, setSubjects] = useState([]);

  // Example implementations
  const fetchSubjects = async () => {
    setSubjects([]); // Replace with real fetch logic
  };
  const addSubject = async (subject) => {
    setSubjects(prev => [...prev, subject]);
  };
  const updateSubject = async (id, data) => {
    setSubjects(prev => prev.map(s => s.id === id ? { ...s, ...data } : s));
  };
  const deleteSubject = async (id) => {
    setSubjects(prev => prev.filter(s => s.id !== id));
  };

  return (
    <SubjectContext.Provider value={{
      subjects,
      fetchSubjects,
      addSubject,
      updateSubject,
      deleteSubject,
    }}>
      {children}
    </SubjectContext.Provider>
  );
};