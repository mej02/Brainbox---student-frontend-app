import React, { createContext, useContext, useState } from "react";

export const EnrollmentContext = createContext();
export const useEnrollments = () => useContext(EnrollmentContext);

export const EnrollmentProvider = ({ children }) => {
  const [enrollments, setEnrollments] = useState([]);


  
  const fetchEnrollments = async () => {
    setEnrollments([]); // Replace with real fetch logic
  };
  const addEnrollment = async (enrollment) => {
    setEnrollments(prev => [...prev, enrollment]);
  };
  const updateEnrollment = async (id, data) => {
    setEnrollments(prev => prev.map(e => e.id === id ? { ...e, ...data } : e));
  };
  const deleteEnrollment = async (id) => {
    setEnrollments(prev => prev.filter(e => e.id !== id));
  };

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