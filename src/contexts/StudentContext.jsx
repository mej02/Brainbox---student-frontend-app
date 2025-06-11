import React, { createContext, useContext, useState } from "react";
import { toast } from "react-toastify";

export const StudentContext = createContext();
export const useStudents = () => useContext(StudentContext);

const API_URL = "https://brainbox-student-management-system.onrender.com/api/students";

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
      toast.error("Failed to fetch students!");
    }
  };

  const addStudent = async (student) => {
    try {
      const csrfToken = getCookie("csrftoken");
      const accessToken = localStorage.getItem("access_token");
      const isFormData = student instanceof FormData;
      const headers = isFormData
        ? { "X-CSRFToken": csrfToken, "Authorization": `Bearer ${accessToken}` }
        : {
            "Content-Type": "application/json",
            "X-CSRFToken": csrfToken,
            "Authorization": `Bearer ${accessToken}`,
          };
      const response = await fetch(API_URL, {
        method: "POST",
        credentials: "include",
        headers,
        body: isFormData ? student : JSON.stringify(student),
      });
      if (!response.ok) throw new Error("Failed to add student");
      const newStudent = await response.json();
      setStudents(prev => [...prev, newStudent]);
      toast.success("Student added successfully!");
      return true;
    } catch (error) {
      console.error("Error adding student:", error);
      toast.error("Failed to add student!");
      return false;
    }
  };

  const updateStudent = async (id, data) => {
    try {
      const csrfToken = getCookie("csrftoken");
      const accessToken = localStorage.getItem("access_token");
      const isFormData = data instanceof FormData;
      const headers = isFormData
        ? { "X-CSRFToken": csrfToken, "Authorization": `Bearer ${accessToken}` }
        : {
            "Content-Type": "application/json",
            "X-CSRFToken": csrfToken,
            "Authorization": `Bearer ${accessToken}`,
          };
      const response = await fetch(`${API_URL}/${id}/`, {
        method: "PUT",
        credentials: "include",
        headers,
        body: isFormData ? data : JSON.stringify(data),
      });
      if (!response.ok) throw new Error("Failed to update student");
      const updatedStudent = await response.json();
      setStudents(prev => prev.map(s => s.student_id === id ? updatedStudent : s));
      toast.success("Student updated successfully!");
      return true;
    } catch (error) {
      console.error("Error updating student:", error);
      toast.error("Failed to update student!");
      return false;
    }
  };

  const deleteStudent = async (id) => {
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
      if (!response.ok) throw new Error("Failed to delete student");
      setStudents(prev => prev.filter(s => s.id !== id));
      toast.success("Student deleted successfully!");
      return true;
    } catch (error) {
      console.error("Error deleting student:", error);
      toast.error("Failed to delete student!");
      return false;
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