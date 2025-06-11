import React, { createContext, useContext, useState } from "react";

export const StudentContext = createContext();
export const useStudents = () => useContext(StudentContext);

const API_URL = "https://brainbox-student-management-system.onrender.com/api/students/";


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


export const StudentProvider = ({ children }) => {
  const [students, setStudents] = useState([]);
 
const fetchStudents = async () => {
  try {
    const response = await fetch(API_URL, {
      method: "GET",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
    });
    if (!response.ok) throw new Error("Failed to fetch students");
    const data = await response.json();
    setStudents(data);
  } catch (error) {
    console.error("Error fetching students:", error);
    setStudents([]);
  }
};
  
  const addStudent = async (student) => {
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
      body: JSON.stringify(student),
    });
    if (!response.ok) throw new Error("Failed to add student");
    const newStudent = await response.json();
    setStudents(prev => [...prev, newStudent]);
  } catch (error) {
    console.error("Error adding student:", error);
  }
};


  const updateStudent = async (id, data) => {
  try {
     
    const csrfToken = getCookie("csrftoken");
    const accessToken = localStorage.getItem("access_token");
    const response = await fetch(`${API_URL}/${id}`, {
      method: "PUT",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
        "X-CSRFToken": csrfToken,
        "Authorization": `Bearer ${accessToken}`,
      },
      body: JSON.stringify(data),
    });
    
    if (!response.ok) throw new Error("Failed to update student");
    const updatedStudent = await response.json();
    setStudents(prev => prev.map(s => s.id === id ? updatedStudent : s));
  } catch (error) {
    console.error("Error updating student:", error);
  }
};

  const deleteStudent = async (id) => {
  try {
     
    const csrfToken = getCookie("csrftoken");
    const accessToken = localStorage.getItem("access_token");
    const response = await fetch(`${API_URL}/${id}`, {
      method: "DELETE",
      credentials: "include",
      headers: {
        "X-CSRFToken": csrfToken,
        "Authorization": `Bearer ${accessToken}`,
      },
    });
    if (!response.ok) throw new Error("Failed to delete student");
    setStudents(prev => prev.filter(s => s.id !== id));
  } catch (error) {
    console.error("Error deleting student:", error);
  }
};

  return (
    <StudentContext.Provider value={{
      students,
      fetchStudents,
      addStudent,
      updateStudent,
      deleteStudent,
    }}>
      {children}
    </StudentContext.Provider>
  );
};