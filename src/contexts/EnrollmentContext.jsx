import React, { createContext, useContext, useState } from "react";

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

  const fetchEnrollments = async () => {
    try {
      const response = await fetch(API_URL, {
        method: "GET",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
      });
      if (!response.ok) throw new Error("Failed to fetch enrollments");
      const data = await response.json();
      setEnrollments(data);
    } catch (error) {
      console.error("Error fetching enrollments:", error);
      setEnrollments([]);
    }
  };

  const addEnrollment = async (enrollment) => {
    try {
   
      const csrfToken = getCookie("csrftoken");
      const accessToken = localStorage.getItem("access_token");
      const response = await fetch(API_URL, {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
          "X-CSRFToken": csrfToken,
          "Authorization": `Bearer ${accessToken}`,
        },
        body: JSON.stringify(enrollment),
      });
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
      const accessToken = localStorage.getItem("access_token");
      const response = await fetch(`${API_URL}/${id}/`, {
        method: "PUT",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
          "X-CSRFToken": csrfToken,
          "Authorization": `Bearer ${accessToken}`,
        },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error("Failed to update enrollment");
      const updatedEnrollment = await response.json();
      setEnrollments(prev => prev.map(e => e.id === id ? updatedEnrollment : e));
    } catch (error) {
      console.error("Error updating enrollment:", error);
    }
  };

  const deleteEnrollment = async (id) => {
    try {
     
      const csrfToken = getCookie("csrftoken");
      const accessToken = localStorage.getItem("access_token");
      const response = await fetch(`${API_URL}/${id}/`, {
        method: "DELETE",
        credentials: "include",
        headers: {
          "X-CSRFToken": csrfToken,
          "Authorization": `Bearer ${accessToken}`,
        },
      });
      if (!response.ok) throw new Error("Failed to delete enrollment");
      setEnrollments(prev => prev.filter(e => e.id !== id));
    } catch (error) {
      console.error("Error deleting enrollment:", error);
    }
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