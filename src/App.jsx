import React, { useState, useEffect, useCallback, useRef } from "react";
import {
  Home,
  Users,
  Book,
  GraduationCap,
  Plus,
  Edit,
  Trash2,
  Save,
  X,
  CheckCircle,
  AlertCircle,
  Loader2,
  Search,
  ChevronDown,
  ChevronUp,
  User,
  Building2,
  CalendarDays,
  BookOpenText,
  Image,
  UserCog,
  UserSquare,
  LogIn,
  LogOut,
  UserPlus,
  ChevronLeft,
  ChevronRight,
  Send,
  Phone,
  MapPin,
} from "lucide-react";

import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import { Calendar as BigCalendar, dateFnsLocalizer } from "react-big-calendar";
import { format, parse, startOfWeek, getDay } from "date-fns";
import enUS from "date-fns/locale/en-US";
import "react-big-calendar/lib/css/react-big-calendar.css";

// Define the localizer for react-big-calendar
const locales = {
  "en-US": enUS,
};
const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek,
  getDay,
  locales,
});

import {
  AppContext,
  StudentContext,
  SubjectContext,
  GradeContext,
  AuthContext,
  useAuth,
  useGradeContext,
  useApp,
} from "./contexts";
import logoWhite from "./assets/image/logo-white.png";

const DEFAULT_STUDENT_IMAGE =
  "https://placehold.co/100x100/e0e0e0/555555?text=No+Image";

const API_BASE_URL = "http://localhost:8000/api";

const COURSES = [
  {
    value: "BSIT",
    label: "BSIT - Bachelor of Science in Information Technology",
  },
  { value: "BSCS", label: "BSCS - Bachelor of Science in Computer Science" },
  { value: "BSCRIM", label: "BSCRIM - Bachelor of Science in Criminology" },
  { value: "BSBM", label: "BSBM - Bachelor of Science in Business Management" },
  { value: "BSED", label: "BSED - Bachelor of Secondary Education" },
  {
    value: "BSHM",
    label: "BSHM - Bachelor of Science in Hospitality Management",
  },
  { value: "BSP", label: "BSP - Bachelor of Science in Psychology" },
];

const YEAR_LEVELS = ["1st Year", "2nd Year", "3rd Year", "4th Year"];

const GENDER_OPTIONS = ["Male", "Female", "Other"];

//Hooks
const useStudents = () => React.useContext(StudentContext);
const useSubjects = () => React.useContext(SubjectContext);

export const AppProvider = ({ children }) => {
  const [userRole, setUserRole] = useState(null);
  const [loggedInStudentId, setLoggedInStudentId] = useState(null);

  const [students, setStudents] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [grades, setGrades] = useState([]);

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);

  // Removed unused axiosInstance

  const showMessage = useCallback((type, text) => {
    setMessage({ type, text });
    setTimeout(() => setMessage(null), 3000); // Clear message after 3 seconds
  }, []);

  // Removed unused contextValue variable

  // Utility function to get CSRF token from cookies
  const getCookie = (name) => {
    const cookieValue = document.cookie
      .split("; ")
      .find((row) => row.startsWith(name + "="))
      ?.split("=")[1];
    return cookieValue || "";
  };

  // --- Auth Functions ---
  const login = async (username, password, role) => {
    setLoading(true);
    try {
      // Fetch CSRF token first
      await fetch(`${API_BASE_URL}/csrf/`, {
        credentials: "include", // This stores the cookie
      });
      const csrftoken = getCookie("csrftoken");

      const response = await fetch(`${API_BASE_URL}/login/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-CSRFToken": csrftoken,
        },
        body: JSON.stringify({ username, password, role }),
        credentials: "include",
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Login failed");
      }

      // Save login data
      setUserRole(data.role);
      if (data.role === "student") {
        setLoggedInStudentId(data.student_id);
      }

      showMessage("success", "Login successful!");
      return true;
    } catch (error) {
      showMessage("error", `Login failed: ${error.message}`);
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Handles user registration.
  const register = async (username, password, role, studentId = null) => {
    setLoading(true);
    try {
      const csrftoken = getCookie("csrftoken");

      const payload = { username, password, role };
      if (role === "student") {
        payload.student_id = studentId;
        // Include student_id for student registration
      }

      const response = await fetch(`${API_BASE_URL}/register/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-CSRFToken": csrftoken,
        },
        body: JSON.stringify(payload),
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Registration failed");
      }
      showMessage("success", "Registration successful! You can now log in.");
      return true;
    } catch (error) {
      showMessage("error", `Registration failed: ${error.message}`);
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Handles user logout.
  // Uses useCallback to memoize the function, preventing unnecessary re-renders.
  const logout = useCallback(() => {
    setUserRole(null); // Clear user role
    setLoggedInStudentId(null); // Clear logged-in student ID
    showMessage("success", "Logged out successfully!"); // Show success notification
  }, [showMessage]); // Dependency array includes showMessage

  // --- Student Functions ---
  // Fetches all student records from the backend.
  // Uses useCallback to memoize the function.
  const fetchStudents = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/students/`, {
        method: "GET",
        credentials: "include",
      });

      console.log("Response Status:", response.status);

      if (!response.ok) {
        console.error(
          "Response not OK:",
          response.status,
          await response.text()
        ); // <--- ADD/MODIFY THIS LINE
        throw new Error("Failed to fetch students");
      }

      const data = await response.json();
      console.log("Fetched Data:", data);

      setStudents(data);
    } catch (error) {
      console.error("Error in fetchStudents:", error);
      showMessage("error", `Failed to fetch students: ${error.message}`);
    } finally {
      setLoading(false);
    }
  }, [showMessage]); // Dependency array includes showMessage

  // Adds a new student record.
  const addStudent = async (studentData) => {
    setLoading(true);
    try {
      const formData = new FormData();
      for (const key in studentData) {
        if (studentData[key] !== null && studentData[key] !== undefined) {
          formData.append(key, studentData[key]);
        }
      }

      const csrftoken = getCookie("csrftoken");
      const response = await fetch(`${API_BASE_URL}/students/`, {
        method: "POST",
        body: formData,
        credentials: "include",
        headers: {
          "X-CSRFToken": csrftoken, // <--- ADD CSRF TOKEN TO HEADERS
        },
      });
      console.log("Add Student Response Status:", response.status);
      if (!response.ok) {
        const errorData = await response.json();
        console.error("Add Student Error Response:", errorData);
        throw new Error(errorData.detail || "Failed to add student");
      }

      const newStudent = await response.json();
      setStudents((prevStudents) => [...prevStudents, newStudent]);
      showMessage("success", "Student added successfully!");
      fetchStudents(); // Refresh the list
      return true;
    } catch (error) {
      showMessage("error", `Failed to add student: ${error.message}`);
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Updates an existing student record.
  const updateStudent = async (student_id, studentData, isFormData = false) => {
    setLoading(true);
    try {
      const csrftoken = getCookie("csrftoken");
      const response = await fetch(`${API_BASE_URL}/students/${student_id}/`, {
        method: "PATCH",
        body: studentData,
        credentials: "include",
        headers: isFormData
          ? { "X-CSRFToken": csrftoken }
          : { "Content-Type": "application/json", "X-CSRFToken": csrftoken },
      });
      if (!response.ok) {
        const errorData = await response.json();
        console.error("Update error:", errorData);
        throw new Error(
          errorData.student_id?.[0] ||
            errorData.email?.[0] ||
            errorData.message ||
            "Failed to update student"
        );
      }
      showMessage("success", "Student updated successfully!");
      fetchStudents(); // Refresh the list after updating
      return true;
    } catch (error) {
      showMessage("error", `Failed to update student: ${error.message}`);
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Deletes a student record.
  const deleteStudent = async (student_id) => {
    setLoading(true);
    try {
      const csrftoken = getCookie("csrftoken");
      const response = await fetch(`${API_BASE_URL}/students/${student_id}/`, {
        method: "DELETE",
        credentials: "include",
        headers: {
          "X-CSRFToken": csrftoken,
        },
      });
      if (!response.ok) throw new Error("Failed to delete student");
      showMessage("success", "Student deleted successfully!");
      fetchStudents(); // Refresh the list after deleting
      return true;
    } catch (error) {
      showMessage("error", `Failed to delete student: ${error.message}`);
      return false;
    } finally {
      setLoading(false);
    }
  };

  // --- Subject Functions ---
  const fetchSubjects = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/subjects/`, {
        credentials: "include",
      });
      if (!response.ok) throw new Error("Failed to fetch subjects");
      const data = await response.json();
      // Normalize subjects for dropdowns and enrolled subjects
      const normalized = data.map((subj) => ({
        ...subj,
        value: subj.code,
        label: `${subj.code} - ${subj.name}`,
      }));
      setSubjects(normalized);
    } catch (error) {
      showMessage("error", error.message);
    } finally {
      setLoading(false);
    }
  }, [showMessage]);

  // Adds a new subject record.
  const addSubject = useCallback(
    async (newSubject) => {
      setLoading(true);
      try {
        const csrftoken = getCookie("csrftoken");
        const response = await fetch(`${API_BASE_URL}/subjects/`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "X-CSRFToken": csrftoken,
          },
          credentials: "include",
          body: JSON.stringify(newSubject),
        });
        if (!response.ok) throw new Error("Failed to add subject");
        const addedSubject = await response.json();
        setSubjects((prev) => [...prev, addedSubject]);
        showMessage("success", "Subject successfully added");
        return true;
      } catch (error) {
        showMessage("error", error.message);
        return false;
      } finally {
        setLoading(false);
      }
    },
    [showMessage]
  );

  // Updates an existing subject record.
  const updateSubject = async (code, subjectData) => {
    setLoading(true);
    try {
      const csrftoken = getCookie("csrftoken");
      const response = await fetch(`${API_BASE_URL}/subjects/${code}/`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "X-CSRFToken": csrftoken,
        },
        body: JSON.stringify(subjectData),
        credentials: "include",
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.code?.[0] ||
            errorData.name?.[0] ||
            errorData.message ||
            "Failed to update subject"
        );
      }
      showMessage("success", "Subject updated successfully!");
      fetchSubjects(); // Refresh the list
      return true;
    } catch (error) {
      showMessage("error", `Failed to update subject: ${error.message}`);
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Deletes a subject record.
  const deleteSubject = async (code) => {
    setLoading(true);
    try {
      const csrftoken = getCookie("csrftoken");
      const response = await fetch(`${API_BASE_URL}/subjects/${code}/`, {
        method: "DELETE",
        credentials: "include",
        headers: {
          "X-CSRFToken": csrftoken,
        },
      });
      if (!response.ok) throw new Error("Failed to delete subject");
      showMessage("success", "Subject deleted successfully!");
      fetchSubjects(); // Refresh the list
      return true;
    } catch (error) {
      showMessage("error", `Failed to delete subject: ${error.message}`);
      return false;
    } finally {
      setLoading(false);
    }
  };

  // --- Grade Functions ---
  // Fetches all grade records.
  // Uses useCallback to memoize the function.
  const fetchGrades = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/grades/`);
      if (!response.ok) throw new Error("Failed to fetch grades");
      const data = await response.json();
      setGrades(data); // Update grades state
    } catch (error) {
      showMessage("error", `Failed to fetch grades: ${error.message}`);
    } finally {
      setLoading(false);
    }
  }, [showMessage]); // Dependency array includes showMessage

  // Adds a new grade record.
  const addGrade = async (gradeData) => {
    setLoading(true);
    try {
      const csrftoken = getCookie("csrftoken");
      const response = await fetch(`${API_BASE_URL}/grades/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-CSRFToken": csrftoken,
        },
        body: JSON.stringify(gradeData),
        credentials: "include",
      });
      if (!response.ok) {
        const errorData = await response.json();
        console.log("Backend error response:", errorData); //debug
        throw new Error(
          errorData.non_field_errors?.[0] ||
            errorData.message ||
            "Failed to add grade"
        );
      }
      showMessage("success", "Grade added successfully!");
      fetchGrades(); // Refresh the list
      return true;
    } catch (error) {
      showMessage("error", `Failed to add grade: ${error.message}`);
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Updates an existing grade record.
  const updateGrade = async (id, gradeData) => {
    setLoading(true);
    try {
      const csrftoken = getCookie("csrftoken");
      const response = await fetch(`${API_BASE_URL}/grades/${id}/`, {
        method: "PUT", // Use PUT for full replacement of resource
        headers: {
          "Content-Type": "application/json",
          "X-CSRFToken": csrftoken, // <--- ADD THIS LINE
        },
        body: JSON.stringify(gradeData),
        credentials: "include",
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.non_field_errors?.[0] ||
            errorData.message ||
            "Failed to update grade"
        );
      }
      showMessage("success", "Grade updated successfully!");
      fetchGrades(); // Refresh the list
      return true;
    } catch (error) {
      showMessage("error", `Failed to update grade: ${error.message}`);
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Deletes a grade record.
  const deleteGrade = async (id) => {
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/grades/${id}/`, {
        method: "DELETE",
      });
      if (!response.ok) throw new Error("Failed to delete grade");
      showMessage("success", "Grade deleted successfully!");
      fetchGrades(); // Refresh the list
      return true;
    } catch (error) {
      showMessage("error", `Failed to delete grade: ${error.message}`);
      return false;
    } finally {
      setLoading(false);
    }
  };

  // --- Helper Functions for Contexts ---
  // Memoized function to get student's full name from their ID.
  const getStudentName = useCallback(
    (studentId) => {
      const student = students.find((s) => s.student_id === studentId);
      return student
        ? `${student.first_name} ${student.last_name}`
        : "Unknown Student";
    },
    [students]
  ); // Dependency array includes students state

  // Memoized function to get subject's full name from its code.
  const getSubjectName = useCallback(
    (subjectCode) => {
      const subject = subjects.find((s) => s.code === subjectCode);
      return subject ? `${subject.code} - ${subject.name}` : "Unknown Subject";
    },
    [subjects]
  ); // Dependency array includes subjects state

  // Memoized function to calculate the final grade from activity, quiz, and exam scores.
  // This mirrors the logic in the Django backend's Grade model property.
  const calculateFinalGrade = useCallback((activity, quiz, exam) => {
    // Convert inputs to numbers, defaulting to 0 if invalid or null
    const act = parseFloat(activity) || 0;
    const qz = parseFloat(quiz) || 0;
    const ex = parseFloat(exam) || 0;

    // Basic validation for grade range
    if (act < 0 || act > 100 || qz < 0 || qz > 100 || ex < 0 || ex > 100) {
      return "Invalid Grades"; // Or throw an error, depending on desired behavior
    }

    // Example weighting: Activities 30%, Quizzes 30%, Exams 40%
    const final = act * 0.3 + qz * 0.3 + ex * 0.4;
    return final.toFixed(2); // Return final grade, formatted to 2 decimal places
  }, []);

  // --- Combined Context Values ---
  // Grouping related functions and state for each context.
  const authContextValue = {
    userRole,
    setUserRole,
    loggedInStudentId,
    setLoggedInStudentId,
    login,
    register,
    logout,
  };
  // --- Enrollment State and Functions ---
  const [enrollments, setEnrollments] = useState([]);

  // Fetch enrollments for the logged-in student
  const fetchEnrollments = useCallback(async () => {
    if (!loggedInStudentId) return;
    setLoading(true);
    try {
      const response = await fetch(
        `${API_BASE_URL}/students/${loggedInStudentId}/enrollments/`,
        {
          credentials: "include",
        }
      );
      if (!response.ok) throw new Error("Failed to fetch enrollments");
      const data = await response.json();
      setEnrollments(data);
    } catch (error) {
      showMessage("error", `Failed to fetch enrollments: ${error.message}`);
    } finally {
      setLoading(false);
    }
  }, [loggedInStudentId, showMessage]);

  // Enroll a student in a subject
  const enrollSubject = useCallback(
    async (subjectCode) => {
      if (!loggedInStudentId) return;
      setLoading(true);
      try {
        const csrftoken = getCookie("csrftoken");
        const response = await fetch(
          `${API_BASE_URL}/students/${loggedInStudentId}/enroll/`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "X-CSRFToken": csrftoken,
            },
            credentials: "include",
            body: JSON.stringify({ subject_code: subjectCode }),
          }
        );
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || "Failed to enroll subject");
        }
        showMessage("success", "Enrolled in subject successfully!");
        fetchEnrollments();
        return true;
      } catch (error) {
        showMessage("error", `Failed to enroll: ${error.message}`);
        return false;
      } finally {
        setLoading(false);
      }
    },
    [loggedInStudentId, showMessage, fetchEnrollments]
  );

  // Unenroll a student from a subject
  const unenrollSubject = useCallback(
    async (subjectCode) => {
      if (!loggedInStudentId) return;
      setLoading(true);
      try {
        const csrftoken = getCookie("csrftoken");
        const response = await fetch(
          `${API_BASE_URL}/students/${loggedInStudentId}/unenroll/`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "X-CSRFToken": csrftoken,
            },
            credentials: "include",
            body: JSON.stringify({ subject_code: subjectCode }),
          }
        );
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || "Failed to unenroll subject");
        }
        showMessage("success", "Unenrolled from subject successfully!");
        fetchEnrollments();
        return true;
      } catch (error) {
        showMessage("error", `Failed to unenroll: ${error.message}`);
        return false;
      } finally {
        setLoading(false);
      }
    },
    [loggedInStudentId, showMessage, fetchEnrollments]
  );

  const studentContextValue = {
    students,
    fetchStudents,
    addStudent,
    updateStudent,
    deleteStudent,
    enrollments,
    fetchEnrollments,
    enrollSubject,
    unenrollSubject,
  };
  const subjectContextValue = {
    subjects,
    fetchSubjects,
    addSubject,
    updateSubject,
    deleteSubject,
  };
  const gradeContextValue = {
    grades,
    fetchGrades,
    addGrade,
    updateGrade,
    deleteGrade,
    getStudentName,
    getSubjectName,
    calculateFinalGrade,
  };
  const appContextValue = { loading, showMessage };

  // --- Initial Data Fetch on Component Mount ---
  useEffect(() => {
    if (userRole) {
      fetchStudents();
      fetchSubjects();
      fetchGrades();
    }
  }, [userRole, fetchStudents, fetchSubjects, fetchGrades]);

  // --- Context Providers ---
  // Wraps the children components, making context values available throughout the app.
  return (
    <AppContext.Provider value={appContextValue}>
      <AuthContext.Provider value={authContextValue}>
        <StudentContext.Provider value={studentContextValue}>
          <SubjectContext.Provider value={subjectContextValue}>
            <GradeContext.Provider value={gradeContextValue}>
              {children}
              {message && message.text && (
                <Notification type={message.type} message={message.text} />
              )}
            </GradeContext.Provider>
          </SubjectContext.Provider>
        </StudentContext.Provider>
      </AuthContext.Provider>
    </AppContext.Provider>
  );
};

// --- Notification Component ---
// Displays success or error messages as a temporary toast.
const Notification = ({ type, message }) => {
  const bgColor = type === "success" ? "bg-green-500" : "bg-red-500";
  const Icon = type === "success" ? CheckCircle : AlertCircle;
  return (
    <div
      className={`${bgColor} text-white px-4 py-3 rounded-lg shadow-lg fixed bottom-4 right-4 flex items-center space-x-2 z-50`}
      role="alert"
    >
      <Icon size={20} />
      <span>{message}</span>
    </div>
  );
};

// --- Modal Component (Reusable) ---
// Generic modal structure for forms and confirmations.
const Modal = ({ isOpen, onClose, title, children }) => {
  if (!isOpen) return null;
  // Don't render if not open

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50 p-4 font-inter">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-lg p-6">
        <div className="flex justify-between items-center border-b pb-3 mb-4">
          <h3 className="text-xl font-semibold text-gray-800">{title}</h3>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <X size={24} />
          </button>
        </div>
        <div>{children}</div>
      </div>
    </div>
  );
};

// --- Confirmation Modal (Reusable) ---
// Used for delete confirmations or other critical actions.
const ConfirmationModal = ({ isOpen, onClose, onConfirm, message }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg shadow-xl max-w-sm w-full mx-4 text-center">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">
          Confirm Action
        </h3>
        <p className="text-gray-600 mb-6">{message}</p>
        <div className="flex justify-center space-x-4">
          <button
            onClick={onClose}
            className="px-5 py-2 border border-gray-300 rounded-lg 
            shadow-sm text-gray-700 bg-white hover:bg-gray-50 transition duration-200"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="px-5 py-2 rounded-lg shadow-md text-white bg-red-600 hover:bg-red-700 transition duration-200"
          >
            Confirm
          </button>
        </div>
      </div>
    </div>
  );
};

// --- Loading Spinner Component ---
// Displays a loading spinner overlay.
const LoadingSpinner = () => (
  <div className="fixed inset-0 bg-gray-100 bg-opacity-75 flex items-center justify-center z-[100]">
    <Loader2 className="animate-spin text-indigo-600" size={48} />
  </div>
);

// --- Login Component ---
// Handles user login for both teachers and students.
const Login = ({ onLogin, onRegisterClick }) => {
  // Access loading and showMessage from AppContext
  const { loading } = useApp();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("teacher"); // Default to teacher

  const handleSubmit = async (e) => {
    e.preventDefault();
    const success = await onLogin(username, password, role);
    if (success) {
      setUsername(""); // Clear form on successful login
      setPassword("");
    }
  };
  return (
    <div className="max-w-md mx-auto p-6 bg-white rounded-xl shadow-md font-inter">
      <h2 className="text-3xl font-bold text-gray-800 mb-6 text-center flex items-center justify-center">
        <LogIn className="mr-3 text-[#204032]" size={32} /> Login
      </h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label
            htmlFor="username"
            className="block text-sm font-medium text-gray-700"
          >
            Username / Student ID
          </label>
          <input
            type="text"
            id="username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-[#204032] focus:border-[#204032]"
            required
          />
        </div>
        <div>
          <label
            htmlFor="password"
            className="block text-sm font-medium text-gray-700"
          >
            Password
          </label>
          <input
            type="password"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="mt-1 block w-full px-3 py-2 
            border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-[#204032] focus:border-[#204032]"
            required
          />
        </div>
        <div>
          <label
            htmlFor="role"
            className="block text-sm font-medium text-gray-700"
          >
            Login As:
          </label>
          <select
            id="role"
            value={role}
            onChange={(e) => setRole(e.target.value)}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-[#204032] focus:border-[#204032]"
          >
            <option value="teacher">Teacher</option>
            <option value="student">Student</option>
          </select>
        </div>
        <button
          type="submit"
          className="w-full flex justify-center py-2 px-4 border border-transparent rounded-lg shadow-sm text-lg font-medium text-white bg-[#204032] hover:bg-[#183024] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#204032] transition duration-200"
          disabled={loading}
        >
          {loading ? (
            <Loader2 className="animate-spin mr-2" size={20} />
          ) : (
            <LogIn className="mr-2" size={20} />
          )}
          {loading ? "Logging In..." : "Login"}
        </button>
      </form>
      <div className="mt-4 text-center">
        <p className="text-gray-600">Don't have an account?</p>
        <button
          onClick={onRegisterClick}
          className="text-[#204032] hover:text-[#183024] font-medium mt-1"
        >
          Register here
        </button>
      </div>
    </div>
  );
};

// --- Register Component ---
// Handles new user registration for both teachers and students.
const Register = ({ onRegister, onLoginClick }) => {
  const { loading } = useApp();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("teacher");
  const [studentId, setStudentId] = useState("");
  // Only for student registration

  const handleSubmit = async (e) => {
    e.preventDefault();
    const success = await onRegister(username, password, role, studentId);
    if (success) {
      setUsername("");
      setPassword("");
      setStudentId("");
      setRole("teacher"); // Reset role to default
      onLoginClick(); // Go back to login page after successful registration
    }
  };
  return (
    <div className="max-w-md mx-auto p-6 bg-white rounded-xl shadow-md font-inter">
      <h2 className="text-3xl font-bold text-gray-800 mb-6 text-center flex items-center justify-center">
        <UserPlus className="mr-3 text-green-600" size={32} /> Register
      </h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label
            htmlFor="regUsername"
            className="block text-sm font-medium text-gray-700"
          >
            Username {role === "student" && "/ Student ID"}
          </label>
          <input
            type="text"
            id="regUsername"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
            required
          />
        </div>
        <div>
          <label
            htmlFor="regPassword"
            className="block text-sm font-medium text-gray-700"
          >
            Password
          </label>
          <input
            type="password"
            id="regPassword"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
            required
          />
        </div>
        <div>
          <label
            htmlFor="regRole"
            className="block text-sm font-medium text-gray-700"
          >
            Register As:
          </label>
          <select
            id="regRole"
            value={role}
            onChange={(e) => {
              setRole(e.target.value);
              if (e.target.value === "teacher") {
                setStudentId(""); // Clear studentId if switching to teacher
              }
            }}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
          >
            <option value="teacher">Teacher</option>
            <option value="student">Student</option>
          </select>
        </div>
        {role === "student" && (
          <div>
            <label
              htmlFor="regStudentId"
              className="block text-sm font-medium text-gray-700"
            >
              Confirm Student ID (must match above)
            </label>
            <input
              type="text"
              id="regStudentId"
              value={studentId}
              onChange={(e) => setStudentId(e.target.value)}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
              required
            />
          </div>
        )}
        <button
          type="submit"
          className="w-full flex justify-center py-2 px-4 border border-transparent rounded-lg shadow-sm text-lg font-medium text-white bg-[#204032] hover:bg-[#183024] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition duration-200"
          disabled={loading}
        >
          {loading ? (
            <Loader2 className="animate-spin mr-2" size={20} />
          ) : (
            <UserPlus className="mr-2" size={20} />
          )}
          {loading ? "Registering..." : "Register"}
        </button>
      </form>
      <div className="mt-4 text-center">
        <p className="text-gray-600">Already have an account?</p>
        <button
          onClick={onLoginClick}
          className="text-[#204032] hover:text-[#183024] font-medium mt-1"
        >
          Login here
        </button>
      </div>
    </div>
  );
};

// --- Student Management Component (Teacher View) ---
const StudentsManagement = () => {
  const { students, fetchStudents, addStudent, updateStudent, deleteStudent } =
    useStudents();
  const { loading } = useApp();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [studentFormData, setStudentFormData] = useState({
    student_id: "",
    first_name: "",
    last_name: "",
    gender: "",
    date_of_birth: "",
    course: "",
    year_level: "",
    email: "",
    section: "",
    contact_number: "",
    address: "",
    image: null,
    current_image_url: DEFAULT_STUDENT_IMAGE,
  });
  const [editingStudent, setEditingStudent] = useState(null);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [studentToDelete, setStudentToDelete] = useState(null); // Student to be deleted

  const [searchQuery, setSearchQuery] = useState("");
  const [sortConfig, setSortConfig] = useState({
    key: "student_id",
    direction: "ascending",
  }); // Default sort

  useEffect(() => {
    fetchStudents();
  }, [fetchStudents]);

  // Memoized and sorted list of students based on search and sort configuration
  const filteredAndSortedStudents = React.useMemo(() => {
    let sortableItems = [...students];
    // Apply search filter
    if (searchQuery) {
      sortableItems = sortableItems.filter(
        (student) =>
          student.first_name
            .toLowerCase()
            .includes(searchQuery.toLowerCase()) ||
          student.last_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          student.student_id
            .toLowerCase()
            .includes(searchQuery.toLowerCase()) ||
          String(student.section).includes(searchQuery.toLowerCase()) ||
          student.course.toLowerCase().includes(searchQuery.toLowerCase()) ||
          student.year_level.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    // Apply sorting
    if (sortConfig.key !== null) {
      sortableItems.sort((a, b) => {
        const aValue =
          typeof a[sortConfig.key] === "string"
            ? a[sortConfig.key].toLowerCase()
            : a[sortConfig.key];
        const bValue =
          typeof b[sortConfig.key] === "string"
            ? b[sortConfig.key].toLowerCase()
            : b[sortConfig.key];
        if (aValue < bValue) {
          return sortConfig.direction === "ascending" ? -1 : 1;
        }
        if (aValue > bValue) {
          return sortConfig.direction === "ascending" ? 1 : -1;
        }
        return 0;
      });
    }
    return sortableItems;
  }, [students, searchQuery, sortConfig]);

  // Handles sorting column clicks
  const requestSort = (key) => {
    let direction = "ascending";
    if (sortConfig.key === key && sortConfig.direction === "ascending") {
      direction = "descending";
    }
    setSortConfig({ key, direction });
  };

  // Returns sort icon based on current sort configuration
  const getSortIcon = (key) => {
    if (sortConfig.key !== key) return null;
    return sortConfig.direction === "ascending" ? (
      <ChevronUp size={16} className="inline ml-1" />
    ) : (
      <ChevronDown size={16} className="inline ml-1" />
    );
  };

  // Opens the modal for adding a new student
  const handleAddStudentClick = () => {
    setEditingStudent(null); // Clear editing state
    setStudentFormData({
      // Reset form data
      student_id: "",
      first_name: "",
      last_name: "",
      gender: "",
      date_of_birth: "",
      course: "",
      year_level: "",
      email: "",
      section: "",
      contact_number: "",
      address: "",
      image: null,
      current_image_url: DEFAULT_STUDENT_IMAGE,
    });
    setIsModalOpen(true); // Open modal
  };

  // Opens the modal for editing an existing student
  const handleEditStudentClick = (student) => {
    setEditingStudent(student); // Set student for editing
    setStudentFormData({
      // Populate form with student data
      student_id: student.student_id,
      first_name: student.first_name,
      last_name: student.last_name,
      gender: student.gender || "",
      date_of_birth: student.date_of_birth, // Ensure format is YYYY-MM-DD
      course: student.course,
      year_level: student.year_level,
      email: student.email,
      section: student.section,
      contact_number: student.contact_number || "",
      address: student.address || "",
      image: null, // File input should be null initially for edit
      current_image_url: student.image_url || DEFAULT_STUDENT_IMAGE, // Display current image
    });
    setIsModalOpen(true); // Open modal
  };

  // Handles changes in the student form fields
  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (name === "image" && files && files[0]) {
      setStudentFormData((prev) => ({
        ...prev,
        image: files[0],
        current_image_url: URL.createObjectURL(files[0]),
      }));
    } else if (name === "section") {
      setStudentFormData((prev) => ({
        ...prev,
        section: parseInt(value) || "",
      }));
    } else {
      setStudentFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  // Handles clearing the selected image in the form
  const handleClearImage = () => {
    setStudentFormData((prev) => ({
      ...prev,
      image: null,
      current_image_url: DEFAULT_STUDENT_IMAGE,
    }));
  };

  const handleModalSubmit = async (e) => {
    e.preventDefault();
    let success;
    if (editingStudent) {
      // UPDATE existing student
      success = await updateStudent(editingStudent.student_id, studentFormData);
    } else {
      // ADD new student
      success = await addStudent(studentFormData);
    }
    if (success) {
      // Reset form + editing flag, then close modal
      setEditingStudent(null);
      setStudentFormData({
        student_id: "",
        first_name: "",
        last_name: "",
        gender: "",
        date_of_birth: "",
        course: "",
        year_level: "",
        email: "",
        section: "",
        contact_number: "",
        address: "",
        image: null,
        current_image_url: DEFAULT_STUDENT_IMAGE,
      });
      setIsModalOpen(false);
    }
  };

  // Handles click to delete a student, opens confirmation modal
  const handleDeleteClick = (student) => {
    setStudentToDelete(student);
    setIsConfirmModalOpen(true);
  };

  // Confirms and executes student deletion
  const handleConfirmDelete = async () => {
    let success = await deleteStudent(studentToDelete.student_id);
    if (success) {
      setIsConfirmModalOpen(false); // Close confirmation modal
      setStudentToDelete(null); // Clear student to delete
    }
  };

  return (
    <div className="p-6 bg-white rounded-xl shadow-md font-inter">
      <h2 className="text-3xl font-bold text-gray-800 mb-6 flex items-center">
        <Users className="mr-3 text-[#204032]" size={32} /> Student Records
      </h2>
      <div className="flex flex-col sm:flex-row justify-between items-center mb-6 space-y-4 sm:space-y-0">
        <div className="relative w-full sm:w-auto flex-grow mr-4">
          <input
            type="text"
            placeholder="Search students..."
            className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#204032] focus:border-[#204032] w-full"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <Search
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
            size={18}
          />
        </div>
        <button
          onClick={handleAddStudentClick}
          className="flex items-center px-6 py-3 bg-[#204032] text-white rounded-lg shadow-md hover:bg-[#183024] transition duration-200 w-full sm:w-auto justify-center"
        >
          <Plus size={20} className="mr-2" /> Add New Student
        </button>
      </div>

      {loading ? (
        <p className="text-center text-gray-600 py-4">Loading students...</p>
      ) : (
        <div className="overflow-x-auto rounded-lg border border-gray-200 shadow-sm">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-100">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Image
                </th>
                <th
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                  onClick={() => requestSort("student_id")}
                >
                  Student ID {getSortIcon("student_id")}
                </th>
                <th
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                  onClick={() => requestSort("last_name")}
                >
                  Full Name {getSortIcon("last_name")}
                </th>
                <th
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                  onClick={() => requestSort("gender")}
                >
                  Gender {getSortIcon("gender")}
                </th>
                <th
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                  onClick={() => requestSort("year_level")}
                >
                  Year & Section {getSortIcon("year_level")}
                </th>
                <th
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                  onClick={() => requestSort("course")}
                >
                  Course {getSortIcon("course")}
                </th>
                <th
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                  onClick={() => requestSort("date_of_birth")}
                >
                  Birthdate {getSortIcon("date_of_birth")}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredAndSortedStudents.length === 0 ? (
                <tr>
                  <td
                    colSpan="9"
                    className="px-6 py-4 text-center text-gray-500"
                  >
                    No students found.
                  </td>
                </tr>
              ) : (
                filteredAndSortedStudents.map((student) => (
                  <tr key={student.student_id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <img
                        className="h-10 w-10 rounded-full object-cover"
                        src={student.image_url || DEFAULT_STUDENT_IMAGE}
                        alt={`${student.first_name} ${student.last_name}`}
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = DEFAULT_STUDENT_IMAGE;
                        }}
                      />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {student.student_id}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {`${student.first_name} ${student.last_name}`}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {student.gender}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {`${student.year_level} - ${student.section}`}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {student.course}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {student.date_of_birth}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => handleEditStudentClick(student)}
                          className="text-[#204032] hover:text-[#183024] p-1 rounded-md hover:bg-gray-100 transition duration-150"
                          aria-label="Edit"
                        >
                          <Edit size={20} />
                        </button>
                        <button
                          onClick={() => handleDeleteClick(student)}
                          className="text-red-600 hover:text-red-900 p-1 rounded-md hover:bg-gray-100 transition duration-150"
                          aria-label="Delete"
                        >
                          <Trash2 size={20} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      <Modal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingStudent(null); // Clear editing state
          setStudentFormData({
            // Reset form data on close
            student_id: "",
            first_name: "",
            last_name: "",
            gender: "",
            date_of_birth: "",
            course: "",
            year_level: "",
            email: "",
            section: "",
            contact_number: "",
            address: "",
            image: null,
            current_image_url: DEFAULT_STUDENT_IMAGE,
          });
        }}
        title={editingStudent ? "Edit Student" : "Add New Student"}
      >
        <form onSubmit={handleModalSubmit} className="space-y-4">
          <div>
            <label
              htmlFor="student_id"
              className="block text-sm font-medium text-gray-700"
            >
              Student ID
            </label>
            <input
              type="text"
              id="student_id"
              name="student_id"
              value={studentFormData.student_id}
              onChange={handleChange}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-[#204032] focus:border-[#204032]"
              required
              disabled={!!editingStudent} // Disable if editing existing student
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label
                htmlFor="first_name"
                className="block text-sm font-medium text-gray-700"
              >
                First Name
              </label>
              <input
                type="text"
                id="first_name"
                name="first_name"
                value={studentFormData.first_name}
                onChange={handleChange}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-[#204032] focus:border-[#204032]"
                required
              />
            </div>
            <div>
              <label
                htmlFor="last_name"
                className="block text-sm font-medium text-gray-700"
              >
                Last Name
              </label>
              <input
                type="text"
                id="last_name"
                name="last_name"
                value={studentFormData.last_name}
                onChange={handleChange}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-[#204032] focus:border-[#204032]"
                required
              />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label
                htmlFor="gender"
                className="block text-sm font-medium text-gray-700"
              >
                Gender
              </label>
              <select
                id="gender"
                name="gender"
                value={studentFormData.gender}
                onChange={handleChange}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-[#204032] focus:border-[#204032]"
                required
              >
                <option value="">Select Gender</option>
                {GENDER_OPTIONS.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label
                htmlFor="date_of_birth"
                className="block text-sm font-medium text-gray-700"
              >
                Date of Birth
              </label>
              <input
                type="date"
                id="date_of_birth"
                name="date_of_birth"
                value={studentFormData.date_of_birth}
                onChange={handleChange}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-[#204032] focus:border-[#204032]"
                required
              />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label
                htmlFor="course"
                className="block text-sm font-medium text-gray-700"
              >
                Course
              </label>
              <select
                id="course"
                name="course"
                value={studentFormData.course}
                onChange={handleChange}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-[#204032] focus:border-[#204032]"
                required
              >
                <option value="">Select Course</option>
                {COURSES.map((course) => (
                  <option key={course.value} value={course.value}>
                    {course.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label
                htmlFor="year_level"
                className="block text-sm font-medium text-gray-700"
              >
                Year Level
              </label>
              <select
                id="year_level"
                name="year_level"
                value={studentFormData.year_level}
                onChange={handleChange}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-[#204032] focus:border-[#204032]"
                required
              >
                <option value="">Select Year Level</option>
                {YEAR_LEVELS.map((level) => (
                  <option key={level} value={level}>
                    {level}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div>
            <label
              htmlFor="section"
              className="block text-sm font-medium text-gray-700"
            >
              Section
            </label>
            <input
              type="number"
              id="section"
              name="section"
              value={studentFormData.section}
              onChange={handleChange}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-[#204032] focus:border-[#204032]"
              required
            />
          </div>
          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium text-gray-700"
            >
              Email
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={studentFormData.email}
              onChange={handleChange}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-[#204032] focus:border-[#204032]"
              required
            />
          </div>
          <div>
            <label
              htmlFor="contact_number"
              className="block text-sm font-medium text-gray-700"
            >
              Contact Number
            </label>
            <input
              type="text"
              id="contact_number"
              name="contact_number"
              value={studentFormData.contact_number}
              onChange={handleChange}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-[#204032] focus:border-[#204032]"
            />
          </div>
          <div>
            <label
              htmlFor="address"
              className="block text-sm font-medium text-gray-700"
            >
              Address
            </label>
            <textarea
              id="address"
              name="address"
              value={studentFormData.address}
              onChange={handleChange}
              rows="2"
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-[#204032] focus:border-[#204032]"
            ></textarea>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Profile Image
            </label>
            <div className="flex items-center space-x-4">
              <img
                src={studentFormData.current_image_url}
                alt="Student Preview"
                className="w-24 h-24 rounded-full object-cover border-4 border-[#204032]"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = DEFAULT_STUDENT_IMAGE;
                }}
              />
              <input
                type="file"
                id="image"
                name="image"
                accept="image/*"
                onChange={handleChange}
                className="block text-sm text-gray-700"
              />
              {studentFormData.current_image_url !== DEFAULT_STUDENT_IMAGE && (
                <button
                  type="button"
                  onClick={handleClearImage}
                  className="ml-2 p-2 rounded-full bg-red-100 text-red-600 hover:bg-red-200 transition duration-150"
                  aria-label="Clear image"
                >
                  <Trash2 size={20} />
                </button>
              )}
            </div>
          </div>
          <div className="flex justify-end space-x-3 mt-6">
            <button
              type="button"
              onClick={() => {
                setIsModalOpen(false);
                setEditingStudent(null);
                setStudentFormData({
                  student_id: "",
                  first_name: "",
                  last_name: "",
                  gender: "",
                  date_of_birth: "",
                  course: "",
                  year_level: "",
                  email: "",
                  section: "",
                  contact_number: "",
                  address: "",
                  image: null,
                  current_image_url: DEFAULT_STUDENT_IMAGE,
                });
              }}
              className="px-5 py-2 border border-gray-300 rounded-lg shadow-sm text-gray-700 bg-white hover:bg-gray-50 transition duration-200"
            >
              <X size={20} className="inline mr-1" /> Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-lg shadow-md text-white bg-[#204032] hover:bg-[#183024] transition duration-200"
              disabled={loading}
            >
              {loading ? (
                <Loader2 className="animate-spin inline mr-2" size={20} />
              ) : (
                <Save size={20} className="inline mr-1" />
              )}
              {editingStudent ? "Update Student" : "Add Student"}
            </button>
          </div>
        </form>
      </Modal>

      <ConfirmationModal
        isOpen={isConfirmModalOpen}
        onClose={() => setIsConfirmModalOpen(false)}
        onConfirm={handleConfirmDelete}
        message={`Are you sure you want to delete student ${studentToDelete?.first_name} ${studentToDelete?.last_name}? This action cannot be undone.`}
      />
    </div>
  );
};

// --- Subject Management Component (Teacher View) ---
const SubjectManagement = () => {
  const { subjects, fetchSubjects, addSubject, updateSubject, deleteSubject } =
    useSubjects();
  const { loading } = useApp();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [subjectFormData, setSubjectFormData] = useState({
    code: "",
    name: "",
    description: "",
    units: "",
  });
  const [editingSubject, setEditingSubject] = useState(null);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [subjectToDelete, setSubjectToDelete] = useState(null);

  const [searchQuery, setSearchQuery] = useState("");
  const [sortConfig, setSortConfig] = useState({
    key: "code",
    direction: "ascending",
  });

  useEffect(() => {
    fetchSubjects();
  }, [fetchSubjects]);

  const filteredAndSortedSubjects = React.useMemo(() => {
    let sortableItems = [...subjects];
    if (searchQuery) {
      sortableItems = sortableItems.filter(
        (subject) =>
          subject.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
          subject.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          subject.description.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    if (sortConfig.key !== null) {
      sortableItems.sort((a, b) => {
        const aValue =
          typeof a[sortConfig.key] === "string"
            ? a[sortConfig.key].toLowerCase()
            : a[sortConfig.key];
        const bValue =
          typeof b[sortConfig.key] === "string"
            ? b[sortConfig.key].toLowerCase()
            : b[sortConfig.key];
        if (aValue < bValue) {
          return sortConfig.direction === "ascending" ? -1 : 1;
        }
        if (aValue > bValue) {
          return sortConfig.direction === "ascending" ? 1 : -1;
        }
        return 0;
      });
    }
    return sortableItems;
  }, [subjects, searchQuery, sortConfig]);

  const requestSort = (key) => {
    let direction = "ascending";
    if (sortConfig.key === key && sortConfig.direction === "ascending") {
      direction = "descending";
    }
    setSortConfig({ key, direction });
  };

  const getSortIcon = (key) => {
    if (sortConfig.key !== key) return null;
    return sortConfig.direction === "ascending" ? (
      <ChevronUp size={16} className="inline ml-1" />
    ) : (
      <ChevronDown size={16} className="inline ml-1" />
    );
  };

  const handleAddSubjectClick = () => {
    setEditingSubject(null);
    setSubjectFormData({ code: "", name: "", description: "", units: "" });
    setIsModalOpen(true);
  };

  const handleEditSubjectClick = (subject) => {
    setEditingSubject(subject);
    setSubjectFormData({
      code: subject.code,
      name: subject.name,
      description: subject.description || "",
      units: subject.units,
    });
    setIsModalOpen(true);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setSubjectFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleModalSubmit = async (e) => {
    e.preventDefault();

    const payload = {
      ...subjectFormData,
      units: parseFloat(subjectFormData.units),
    };

    let success;
    if (editingSubject) {
      success = await updateSubject(editingSubject.code, payload);
    } else {
      success = await addSubject(payload);
    }

    if (success) {
      setEditingSubject(null);
      setSubjectFormData({ code: "", name: "", description: "", units: "" });
      setIsModalOpen(false);
    }
  };

  const handleDeleteClick = (subject) => {
    setSubjectToDelete(subject);
    setIsConfirmModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    let success = await deleteSubject(subjectToDelete.code);
    if (success) {
      setIsConfirmModalOpen(false);
      setSubjectToDelete(null);
    }
  };

  return (
    <div className="p-6 bg-white rounded-xl shadow-md font-inter">
      <h2 className="text-3xl font-bold text-gray-800 mb-6 flex items-center">
        <BookOpenText className="mr-3 text-[#204032]" size={32} /> Subject
        Records
      </h2>
      <div className="flex flex-col sm:flex-row justify-between items-center mb-6 space-y-4 sm:space-y-0">
        <div className="relative w-full sm:w-auto flex-grow mr-4">
          <input
            type="text"
            placeholder="Search subjects..."
            className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#204032] focus:border-[#204032] w-full"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <Search
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
            size={18}
          />
        </div>
        <button
          onClick={handleAddSubjectClick}
          className="flex items-center px-6 py-3 bg-[#204032] text-white rounded-lg shadow-md hover:bg-[#183024] transition duration-200 w-full sm:w-auto justify-center"
        >
          <Plus size={20} className="mr-2" /> Add New Subject
        </button>
      </div>

      {loading ? (
        <p className="text-center text-gray-600 py-4">Loading subjects...</p>
      ) : (
        <div className="overflow-x-auto rounded-lg border border-gray-200 shadow-sm">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-100">
              <tr>
                <th
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                  onClick={() => requestSort("code")}
                >
                  Subject Code {getSortIcon("code")}
                </th>
                <th
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                  onClick={() => requestSort("name")}
                >
                  Subject Name {getSortIcon("name")}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Description
                </th>
                <th
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                  onClick={() => requestSort("units")}
                >
                  Units {getSortIcon("units")}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredAndSortedSubjects.length === 0 ? (
                <tr>
                  <td
                    colSpan="5"
                    className="px-6 py-4 text-center text-gray-500"
                  >
                    No subjects found.
                  </td>
                </tr>
              ) : (
                filteredAndSortedSubjects.map((subject) => (
                  <tr key={subject.code}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {subject.code}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {subject.name}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500 truncate max-w-xs">
                      {subject.description || "N/A"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {subject.units}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => handleEditSubjectClick(subject)}
                          className="text-[#204032] hover:text-[#183024] p-1 rounded-md hover:bg-gray-100 transition duration-150"
                          aria-label="Edit"
                        >
                          <Edit size={20} />
                        </button>
                        <button
                          onClick={() => handleDeleteClick(subject)}
                          className="text-red-600 hover:text-red-900 p-1 rounded-md hover:bg-gray-100 transition duration-150"
                          aria-label="Delete"
                        >
                          <Trash2 size={20} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      <Modal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingSubject(null);
          setSubjectFormData({
            code: "",
            name: "",
            description: "",
            units: "",
          });
        }}
        title={editingSubject ? "Edit Subject" : "Add New Subject"}
      >
        <form onSubmit={handleModalSubmit} className="space-y-4">
          <div>
            <label
              htmlFor="code"
              className="block text-sm font-medium text-gray-700"
            >
              Subject Code
            </label>
            <input
              type="text"
              id="code"
              name="code"
              value={subjectFormData.code}
              onChange={handleChange}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-[#204032] focus:border-[#204032]"
              required
              disabled={!!editingSubject} // Disable if editing existing subject
            />
          </div>
          <div>
            <label
              htmlFor="name"
              className="block text-sm font-medium text-gray-700"
            >
              Subject Name
            </label>
            <input
              type="text"
              id="name"
              name="name"
              value={subjectFormData.name}
              onChange={handleChange}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-[#204032] focus:border-[#204032]"
              required
            />
          </div>
          <div>
            <label
              htmlFor="units"
              className="block text-sm font-medium text-gray-700"
            >
              Units
            </label>
            <input
              type="number"
              id="units"
              name="units"
              value={subjectFormData.units}
              onChange={handleChange}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-[#204032] focus:border-[#204032]"
              required
            />
          </div>
          <div>
            <label
              htmlFor="description"
              className="block text-sm font-medium text-gray-700"
            >
              Description (Optional)
            </label>
            <textarea
              id="description"
              name="description"
              value={subjectFormData.description}
              onChange={handleChange}
              rows="3"
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-[#204032] focus:border-[#204032]"
            ></textarea>
          </div>
          <div className="flex justify-end space-x-3 mt-6">
            <button
              type="button"
              onClick={() => {
                setIsModalOpen(false);
                setEditingSubject(null);
                setSubjectFormData({
                  code: "",
                  name: "",
                  description: "",
                  units: "",
                });
              }}
              className="px-5 py-2 border border-gray-300 rounded-lg shadow-sm text-gray-700 bg-white hover:bg-gray-50 transition duration-200"
            >
              <X size={20} className="inline mr-1" /> Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-lg shadow-md text-white bg-[#204032] hover:bg-[#183024] transition duration-200"
              disabled={loading}
            >
              {loading ? (
                <Loader2 className="animate-spin inline mr-2" size={20} />
              ) : (
                <Save size={20} className="inline mr-1" />
              )}
              {editingSubject ? "Update Subject" : "Add Subject"}
            </button>
          </div>
        </form>
      </Modal>

      <ConfirmationModal
        isOpen={isConfirmModalOpen}
        onClose={() => setIsConfirmModalOpen(false)}
        onConfirm={handleConfirmDelete}
        message={`Are you sure you want to delete subject "${subjectToDelete?.name} (${subjectToDelete?.code})"? This action cannot be undone.`}
      />
    </div>
  );
};

// --- Grade Management Component (Teacher View) ---
const GradeManagement = () => {
  const {
    grades,
    fetchGrades,
    addGrade,
    updateGrade,
    deleteGrade,
    getStudentName,
    getSubjectName,
    calculateFinalGrade,
  } = useGradeContext();
  const { students } = useStudents();
  const { subjects } = useSubjects();
  const { loading } = useApp();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [gradeFormData, setGradeFormData] = useState({
    student: "",
       subject: "",
    activity: "",
    quiz: "",
    exam: "",
  });

  const handleGradeChange = (e) => {
    const { name, value } = e.target;
    setGradeFormData((prev) => ({ ...prev, [name]: value }));
  };

  const [editingGrade, setEditingGrade] = useState(null);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [gradeToDelete, setGradeToDelete] = useState(null);

  const [searchQuery, setSearchQuery] = useState("");
  const [sortConfig, setSortConfig] = useState({
    key: "student",
    direction: "ascending",
  });

  useEffect(() => {
    fetchGrades();
  }, [fetchGrades]);

  const filteredAndSortedGrades = React.useMemo(() => {
    let sortableItems = [...grades];
    if (searchQuery) {
      sortableItems = sortableItems.filter((grade) => {
        const studentName = getStudentName(grade.student).toLowerCase();
        const subjectName = getSubjectName(grade.subject).toLowerCase();
        const query = searchQuery.toLowerCase();

        return (
          studentName.includes(query) ||
          subjectName.includes(query) ||
          String(grade.activity).includes(query) ||
          String(grade.quiz).includes(query) ||
          String(grade.exam).includes(query) ||
          String(
            calculateFinalGrade(grade.activity, grade.quiz, grade.exam)
          ).includes(query)
        );
      });
    }

    if (sortConfig.key !== null) {
      sortableItems.sort((a, b) => {
        let aValue;
        let bValue;

        if (sortConfig.key === "student") {
          aValue = getStudentName(a.student).toLowerCase();
          bValue = getStudentName(b.student).toLowerCase();
        } else if (sortConfig.key === "subject") {
          aValue = getSubjectName(a.subject).toLowerCase();
          bValue = getSubjectName(b.subject).toLowerCase();
        } else {
          aValue =
            typeof a[sortConfig.key] === "string"
              ? a[sortConfig.key].toLowerCase()
              : a[sortConfig.key];
          bValue =
            typeof b[sortConfig.key] === "string"
              ? b[sortConfig.key].toLowerCase()
              : b[sortConfig.key];
        }

        if (aValue < bValue) {
          return sortConfig.direction === "ascending" ? -1 : 1;
        }
        if (aValue > bValue) {
          return sortConfig.direction === "ascending" ? 1 : -1;
        }
        return 0;
      });
    }
    return sortableItems;
  }, [
    grades,
    searchQuery,
    sortConfig,
    getStudentName,
    getSubjectName,
    calculateFinalGrade,
  ]);

  const requestSort = (key) => {
    let direction = "ascending";
    if (sortConfig.key === key && sortConfig.direction === "ascending") {
      direction = "descending";
    }
    setSortConfig({ key, direction });
  };

  const getSortIcon = (key) => {
    if (sortConfig.key !== key) return null;
    return sortConfig.direction === "ascending" ? (
      <ChevronUp size={16} className="inline ml-1" />
    ) : (
      <ChevronDown size={16} className="inline ml-1" />
    );
  };

  const handleAddGradeClick = () => {
    setEditingGrade(null);
    setGradeFormData({
      student: "",
      subject: "",
      activity: "",
      quiz: "",
      exam: "",
    });
    setIsModalOpen(true);
  };

  const handleEditGradeClick = (grade) => {
    setEditingGrade(grade);
    setGradeFormData({
      student: grade.student,
      subject: grade.subject,
      activity: grade.activity,
      quiz: grade.quiz,
      exam: grade.exam,
    });
    setIsModalOpen(true);
  };

  //grades
  const handleModalSubmit = async (e) => {
    e.preventDefault();

    // Ensure numbers are sent as numbers, not strings
    const payload = {
      student: gradeFormData.student,
      subject: gradeFormData.subject,
      activity_grade: parseFloat(gradeFormData.activity),
      quiz_grade: parseFloat(gradeFormData.quiz),
      exam_grade: parseFloat(gradeFormData.exam),
    };

    let success;
    if (editingGrade) {
      success = await updateGrade(editingGrade.id, payload);
    } else {
      success = await addGrade(payload);
    }
    if (success) {
      setEditingGrade(null);
      setGradeFormData({
        student: "",
        subject: "",
        activity: "",
        quiz: "",
        exam: "",
      });
      setIsModalOpen(false);
    }
  };

  const handleDeleteClick = (grade) => {
    setGradeToDelete(grade);
    setIsConfirmModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    let success = await deleteGrade(gradeToDelete.id);
    if (success) {
      setIsConfirmModalOpen(false);
      setGradeToDelete(null);
    }
  };

  return (
    <div className="p-6 bg-white rounded-xl shadow-md font-inter">
      <h2 className="text-3xl font-bold text-gray-800 mb-6 flex items-center">
        <GraduationCap className="mr-3 text-[#204032]" size={32} /> Grade
        Records
      </h2>
      <div className="flex flex-col sm:flex-row justify-between items-center mb-6 space-y-4 sm:space-y-0">
        <div className="relative w-full sm:w-auto flex-grow mr-4">
          <input
            type="text"
            placeholder="Search grades by student, subject, or score..."
            className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#204032] w-full"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <Search
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
            size={18}
          />
        </div>
        <button
          onClick={handleAddGradeClick}
          className="flex items-center px-6 py-3 bg-[#204032] text-white rounded-lg shadow-md hover:bg-[#183024] transition duration-200 w-full sm:w-auto justify-center"
        >
          <Plus size={20} className="mr-2" /> Add New Grade
        </button>
      </div>

      {loading ? (
        <p className="text-center text-gray-600 py-4">Loading grades...</p>
      ) : (
        <div className="overflow-x-auto rounded-lg border border-gray-200 shadow-sm">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-100">
              <tr>
                <th
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                  onClick={() => requestSort("student")}
                >
                  Student Name {getSortIcon("student")}
                </th>
                <th
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                  onClick={() => requestSort("subject")}
                >
                  Subject {getSortIcon("subject")}
                </th>
                <th
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                  onClick={() => requestSort("activity")}
                >
                  Activity {getSortIcon("activity")}
                </th>
                <th
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                  onClick={() => requestSort("quiz")}
                >
                  Quiz {getSortIcon("quiz")}
                </th>
                <th
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                  onClick={() => requestSort("exam")}
                >
                  Exam {getSortIcon("exam")}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Final Grade
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredAndSortedGrades.length === 0 ? (
                <tr>
                  <td
                    colSpan="7"
                    className="px-6 py-4 text-center text-gray-500"
                  >
                    No grades found.
                  </td>
                </tr>
              ) : (
                filteredAndSortedGrades.map((grade) => (
                  <tr key={grade.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {getStudentName(grade.student)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {getSubjectName(grade.subject)} &nbsp;
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {parseInt(grade.activity_grade, 10)} &nbsp;
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {parseInt(grade.quiz_grade, 10)} &nbsp;
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {parseInt(grade.exam_grade, 10)}&nbsp;
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-800">
                      {grade.final_grade}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => handleEditGradeClick(grade)}
                          className="text-[#204032] hover:text-[#183024] p-1 rounded-md hover:bg-gray-100 transition duration-150"
                          aria-label="Edit"
                        >
                          <Edit size={20} />
                        </button>
                        <button
                          onClick={() => handleDeleteClick(grade)}
                          className="text-red-600 hover:text-red-900 p-1 rounded-md hover:bg-gray-100 transition duration-150"
                          aria-label="Delete"
                        >
                          <Trash2 size={20} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      <Modal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingGrade(null);
          setGradeFormData({
            student: "",
            subject: "",
            activity: "",
            quiz: "",
            exam: "",
          });
        }}
        title={editingGrade ? "Edit Grade" : "Add New Grade"}
      >
        <form onSubmit={handleModalSubmit} className="space-y-4">
          <div>
            <label
              htmlFor="student"
              className="block text-sm font-medium text-gray-700"
            >
              Student
            </label>
            <select
              id="student"
              name="student"
              value={gradeFormData.student}
              onChange={handleGradeChange}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-[#204032] focus:border-[#204032]"
              required
              disabled={!!editingGrade}
            >
              <option value="">Select Student</option>
              {students.map((s) => (
                <option key={s.student_id} value={s.student_id}>
                  {`${s.first_name} ${s.last_name} (${s.student_id})`}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label
              htmlFor="subject"
              className="block text-sm font-medium text-gray-700"
            >
              Subject
            </label>
            <select
              id="subject"
              name="subject"
              value={gradeFormData.subject}
              onChange={handleGradeChange}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-[#204032] focus:border-[#204032]"
              required
              disabled={!!editingGrade}
            >
              <option value="">Select Subject</option>
              {subjects.map((sub) => (
                <option key={sub.code} value={sub.code}>
                  {`${sub.code} - ${sub.name}`}
                </option>
              ))}
            </select>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label
                htmlFor="activity"
                className="block text-sm font-medium text-gray-700"
              >
                Activity Score
              </label>
              <input
                type="number"
                id="activity"
                name="activity"
                value={gradeFormData.activity}
                onChange={handleGradeChange}
                min="0"
                max="100"
                step="0.01"
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-[#204032] focus:border-[#204032]"
                required
              />
            </div>
            <div>
              <label
                htmlFor="quiz"
                className="block text-sm font-medium text-gray-700"
              >
                Quiz Score
              </label>
              <input
                type="number"
                id="quiz"
                name="quiz"
                value={gradeFormData.quiz}
                onChange={handleGradeChange}
                min="0"
                max="100"
                step="0.01"
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-[#204032] focus:border-[#204032]"
                required
              />
            </div>
            <div>
              <label
                htmlFor="exam"
                className="block text-sm font-medium text-gray-700"
              >
                Exam Score
              </label>
              <input
                type="number"
                id="exam"
                name="exam"
                value={gradeFormData.exam}
                onChange={handleGradeChange}
                min="0"
                max="100"
                step="0.01"
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-[#204032] focus:border-[#204032]"
                required
              />
            </div>
          </div>
          <div className="flex justify-end space-x-3 mt-6">
            <button
              type="button"
              onClick={() => {
                setIsModalOpen(false);
                setEditingGrade(null);
                setGradeFormData({
                  student: "",
                  subject: "",
                  activity: "",
                  quiz: "",
                  exam: "",
                });
              }}
              className="px-5 py-2 border border-gray-300 rounded-lg shadow-sm text-gray-700 bg-white hover:bg-gray-50 transition duration-200"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-lg shadow-md text-white bg-[#204032] hover:bg-[#183024] transition duration-200"
              disabled={loading}
            >
              {loading ? (
                <Loader2 className="animate-spin inline mr-2" size={20} />
              ) : (
                <Save size={20} className="inline mr-1" />
              )}
              {editingGrade ? "Update Grade" : "Add Grade"}
            </button>
          </div>
        </form>
      </Modal>

      <ConfirmationModal
        isOpen={isConfirmModalOpen}
        onClose={() => setIsConfirmModalOpen(false)}
        onConfirm={handleConfirmDelete}
        message={`Are you sure you want to delete the grade for ${getStudentName(
          gradeToDelete?.student
        )} in ${getSubjectName(
          gradeToDelete?.subject
        )}? This action cannot be undone.`}
      />
    </div>
  );
};

// --- Teacher Home Dashboard Component ---
const TeacherHomeDashboard = () => {
  const { students } = useStudents();
  const { subjects } = useSubjects();
  const { grades } = useGradeContext();
  const { userRole } = useAuth();

  // Get the most recent 5 grades (sorted by id descending)
  const recentGrades = [...grades].sort((a, b) => b.id - a.id).slice(0, 5);

  return (
    <div className="p-6 bg-white rounded-xl shadow-md font-inter w-full max-w-none">
      <h2 className="text-2xl font-bold text-gray-800 mb-4">
        Welcome!{" "}
        {userRole && (
          <span className="text-[#204032]">
            {userRole.charAt(0).toUpperCase() + userRole.slice(1)}
          </span>
        )}
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8 w-full">
        <div className="bg-gray-50 rounded-lg p-6 shadow flex flex-col items-center">
          <span className="text-4xl font-bold text-[#204032]">
            {students.length}
          </span>
          <span className="text-gray-700 mt-2">Total Students</span>
        </div>
        <div className="bg-gray-50 rounded-lg p-6 shadow flex flex-col items-center">
          <span className="text-4xl font-bold text-[#204032]">
            {subjects.length}
          </span>
          <span className="text-gray-700 mt-2">Subjects Offered</span>
        </div>
      </div>
      <div className="bg-gray-50 rounded-lg p-6 shadow w-full">
        <h3 className="text-lg font-semibold mb-4">Recent Activity</h3>
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-100">
            <tr>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                Student Number
              </th>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                Name
              </th>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                Grade
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {recentGrades.length === 0 ? (
              <tr>
                <td colSpan={3} className="px-4 py-2 text-center text-gray-500">
                  No recent activity.
                </td>
              </tr>
            ) : (
              recentGrades.map((grade) => {
                const student = students.find(
                  (s) => s.student_id === grade.student
                );
                return (
                  <tr key={grade.id}>
                    <td className="px-4 py-2 text-sm">{grade.student}</td>
                    <td className="px-4 py-2 text-sm">
                      {student
                        ? `${student.first_name} ${student.last_name}`
                        : "Unknown"}
                    </td>
                    <td className="px-4 py-2 text-sm">{grade.final_grade}</td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

// --- Student Dashboard Component (Student View) ---
const StudentDashboard = ({ loggedInStudentId }) => {
  const {
    students,
    fetchStudents,
    enrollments,
    fetchEnrollments,
    enrollSubject,
    unenrollSubject,
    updateStudent,
  } = useStudents();
  const { subjects } = useSubjects();
  const { grades, fetchGrades } = useGradeContext();
  const { loading } = useApp();
  const { loggedInStudentId: authStudentId } = useAuth();

  const [selectedSubjectCode, setSelectedSubjectCode] = useState("");
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editForm, setEditForm] = useState({
    first_name: "",
    last_name: "",
    email: "",
    gender: "",
    date_of_birth: "",
    course: "",
    year_level: "",
    section: "",
    contact_number: "",
    address: "",
  });

  const [events, setEvents] = useState(() => {
    try {
      const saved = localStorage.getItem("studentEvents");
      if (!saved) return [];
      const parsed = JSON.parse(saved);
      if (!Array.isArray(parsed)) return [];
      return parsed.map(ev => ({
        ...ev,
        start: ev.start ? new Date(ev.start) : new Date(),
        end: ev.end ? new Date(ev.end) : new Date(),
      }));
    } catch {
      localStorage.removeItem("studentEvents");
      return [];
    }
  });

  const [showEventModal, setShowEventModal] = useState(false);
  const [selectedDate, setSelectedDate] = useState(null);
  const [newEventTitle, setNewEventTitle] = useState("");
  const [editEventIdx, setEditEventIdx] = useState(null);
  const [editEventTitle, setEditEventTitle] = useState("");
  const [calendarDate, setCalendarDate] = useState(new Date());

  const currentStudentId = loggedInStudentId || authStudentId;

  // Always call hooks at the top level, not conditionally!
  useEffect(() => {
    if (!students.length) fetchStudents();
    if (!grades.length) fetchGrades();
  }, [students.length, grades.length, fetchStudents, fetchGrades]);

  useEffect(() => {
    if (currentStudentId) fetchEnrollments();
  }, [currentStudentId, fetchEnrollments]);

  useEffect(() => {
    if (Array.isArray(events)) {
      localStorage.setItem("studentEvents", JSON.stringify(events));
    } else {
      localStorage.removeItem("studentEvents");
    }
  }, [events]);

  const currentStudent = React.useMemo(() => {
    return students.find((s) => s.student_id === currentStudentId);
  }, [students, currentStudentId]);

  const studentGrades = React.useMemo(() => {
    return grades.filter((grade) => grade.student === currentStudentId);
  }, [grades, currentStudentId]);

  // Sync form with current student
  useEffect(() => {
    if (currentStudent) {
      setEditForm({
        first_name: currentStudent.first_name || "",
        last_name: currentStudent.last_name || "",
        email: currentStudent.email || "",
        gender: currentStudent.gender || "",
        date_of_birth: currentStudent.date_of_birth || "",
        course: currentStudent.course || "",
        year_level: currentStudent.year_level || "",
        section: currentStudent.section || "",
        contact_number: currentStudent.contact_number || "",
        address: currentStudent.address || "",
      });
    }
  }, [currentStudent]);

  // Loading check to prevent undefined errors
  if (!currentStudent) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <span className="text-gray-500 text-lg">Loading student info...</span>
      </div>
    );
  }

  // Custom Toolbar for BigCalendar
  const CalendarToolbar = (toolbar) => (
    <div className="flex items-center justify-between mb-2">
      <button
        onClick={() => toolbar.onNavigate("PREV")}
        className="p-2 rounded hover:bg-gray-200"
        aria-label="Previous"
      >
        <ChevronLeft size={20} />
      </button>
      <span className="text-lg font-semibold text-gray-800">
        {toolbar.label}
      </span>
      <button
        onClick={() => toolbar.onNavigate("NEXT")}
        className="p-2 rounded hover:bg-gray-200"
        aria-label="Next"
      >
        <ChevronRight size={20} />
      </button>
    </div>
  );

  // Handle slot (date) click
  const handleSelectSlot = (slotInfo) => {
    setSelectedDate(slotInfo.start);
    setShowEventModal(true);
    setNewEventTitle("");
  };

  // Handle event add
  const handleAddEvent = (e) => {
    e.preventDefault();
    if (!newEventTitle.trim()) return;
    setEvents([
      ...events,
      {
        title: newEventTitle,
        start: selectedDate,
        end: selectedDate,
        allDay: true,
      },
    ]);
    setShowEventModal(false);
    setNewEventTitle("");
  };

  // Edit event
  const handleEditEvent = (idx) => {
    setEditEventIdx(idx);
    setEditEventTitle(events[idx].title);
    setShowEventModal(false); // Hide add modal if open
  };

  // Save edited event
  const handleSaveEditEvent = (e) => {
    e.preventDefault();
    if (!editEventTitle.trim()) return;
    setEvents(
      events.map((ev, idx) =>
        idx === editEventIdx ? { ...ev, title: editEventTitle } : ev
      )
    );
    setEditEventIdx(null);
    setEditEventTitle("");
  };

  // Delete event
  const handleDeleteEvent = (idx) => {
    setEvents(events.filter((_, i) => i !== idx));
  };

  // Defensive: check if events is an array before using it
  if (!Array.isArray(events)) {
    return null; // Or render an error message, depending on desired behavior
  }

  return (
    <div className="p-6 bg-white rounded-xl shadow-md font-inter min-h-[90vh]">
      <h2 className="text-3xl font-bold text-gray-800 mb-6 flex items-center">
        <User className="mr-3 text-[#204032]" size={32} /> Student Dashboard
      </h2>

      <div className="mb-6 flex gap-2">
        <select
          className="border px-2 py-1 rounded flex-1"
          value={selectedSubjectCode}
          onChange={(e) => setSelectedSubjectCode(e.target.value)}
        >
          <option value="">Select a subject to enroll</option>
          {subjects
            .filter((s) => !enrollments.includes(s.value))
            .map((s) => (
              <option key={s.value} value={s.value}>
                {s.label}
              </option>
            ))}
        </select>
        <button
          className="bg-[#204032] text-white px-4 py-1 rounded hover:bg-[#183024] transition"
          onClick={async () => {
            if (!selectedSubjectCode) return;
            await enrollSubject(selectedSubjectCode);
            setSelectedSubjectCode("");
          }}
        >
          Enroll
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8 items-start">
        {/* Profile */}
        <div className="md:col-span-1 bg-gray-50 rounded-lg p-6 shadow-sm flex flex-col items-center">
          <img
            src={currentStudent.image_url || DEFAULT_STUDENT_IMAGE}
            alt={`${currentStudent.first_name} ${currentStudent.last_name}`}
            className="w-32 h-32 rounded-full object-cover border-4 border-[#204032] mb-4"
            onError={(e) => {
              e.target.onerror = null;
              e.target.src = DEFAULT_STUDENT_IMAGE;
            }}
          />
          <h3 className="text-2xl font-semibold text-gray-800 mb-1">
            {`${currentStudent.first_name} ${currentStudent.last_name}`}
          </h3>
          <p className="text-[#204032] text-lg mb-4">
            {currentStudent.student_id}
          </p>
          <div className="text-gray-700 text-sm w-full">
            <p className="flex items-center mb-2">
              <Building2 className="mr-2 text-gray-500" size={16} />
              <strong>Course:</strong> {currentStudent.course}
            </p>
            <p className="flex items-center mb-2">
              <CalendarDays className="mr-2 text-gray-500" size={16} />
              <strong>Year & Section:</strong> {`${currentStudent.year_level} - ${currentStudent.section}`}
            </p>
            <p className="flex items-center mb-2">
              <Book className="mr-2 text-gray-500" size={16} />
              <strong>Email:</strong> {currentStudent.email}
            </p>
            <p className="flex items-center mb-2">
              <UserCog className="mr-2 text-gray-500" size={16} />
              <strong>Gender:</strong> {currentStudent.gender}
            </p>
            <p className="flex items-center mb-2">
              <Image className="mr-2 text-gray-500" size={16} />
              <strong>Birthdate:</strong> {currentStudent.date_of_birth}
            </p>
            <p className="flex items-center mb-2">
              <Phone className="mr-2 text-gray-500" size={16} />
              <strong>Contact Number:</strong> {currentStudent.contact_number || "N/A"}
            </p>
            <p className="flex items-center mb-2">
              <MapPin className="mr-2 text-gray-500" size={16} />
              <strong>Address:</strong> {currentStudent.address || "N/A"}
            </p>
          </div>
          <button
            className="mt-4 px-4 py-2 bg-[#204032] text-white rounded hover:bg-[#183024] transition"
            onClick={() => setIsEditModalOpen(true)}
          >
            Edit Profile
          </button>
        </div>

        {/* Grades and Enrolled Subjects stacked in the same column */}
        <div className="md:col-span-2 flex flex-col gap-8">
          {/* Grades Overview */}
          <div className="bg-gray-50 rounded-lg p-6 shadow-sm">
            <h3 className="text-xl font-semibold mb-4 flex items-center">
              <GraduationCap className="mr-2" size={20} /> My Grades
            </h3>
            {studentGrades.length === 0 ? (
              <p className="text-gray-600 text-center py-4">
                No grades recorded yet.
              </p>
            ) : (
              <div className="overflow-x-auto rounded-lg border border-gray-200">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-100">
                    <tr>
                      <th className="px-6 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Subject
                      </th>
                      <th className="px-6 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Activity
                      </th>
                      <th className="px-6 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Quiz
                      </th>
                      <th className="px-6 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Exam
                      </th>
                      <th className="px-6 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Final Grade
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {studentGrades.map((grade) => (
                      <tr key={grade.id}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {grade.subject_details.name}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {parseInt(grade.activity_grade, 10)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {parseInt(grade.quiz_grade, 10)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {parseInt(grade.exam_grade, 10)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-800">
                          {grade.final_grade}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* My Enrolled Subjects */}
          <div className="bg-gray-50 rounded-lg p-6 shadow-sm">
            <h3 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
              <Book className="mr-2" size={20} /> My Enrolled Subjects
            </h3>
            <ul className="space-y-2">
              {enrollments.length === 0 ? (
                <li className="text-gray-500">
                  You have no enrolled subjects.
                </li>
              ) : (
                enrollments.map((code) => {
                  const subj = subjects.find((s) => s.value === code);
                  return (
                    <li
                      key={code}
                      className="flex justify-between items-center border p-2 rounded"
                    >
                      <span>{subj?.label || code}</span>
                      <button
                        className="text-red-600 hover:underline text-sm"
                        onClick={() => unenrollSubject(code)}
                      >
                        Unenroll
                      </button>
                    </li>
                  );
                })
              )}
            </ul>
          </div>
        </div>

        {/* Calendar - NOW A SIBLING, NOT INSIDE md:col-span-2 */}
        <div className="md:col-span-1 bg-white rounded-lg p-6 shadow-sm">
          <h3 className="text-xl font-semibold mb-4 flex items-center">
            <CalendarDays className="mr-2" size={15} /> Calendar
          </h3>
          <div style={{ height: 325 }}>
            <BigCalendar
              localizer={localizer}
              events={events}
              startAccessor="start"
              endAccessor="end"
              views={["month"]}
              defaultView="month"
              toolbar={true}
              selectable
              components={{ toolbar: CalendarToolbar }}
              style={{ height: 325, borderRadius: "0.75rem" }}
              popup
              date={calendarDate}
              onNavigate={(date) => setCalendarDate(date)}
              onSelectSlot={handleSelectSlot}
              eventPropGetter={() => ({
                style: {
                  backgroundColor: "#204032",
                  color: "#fff",
                  borderRadius: "6px",
                  padding: "2px 6px",
                  fontSize: "0.95rem",
                  border: "none",
                  boxShadow: "0 1px 4px rgba(32,64,50,0.08)",
                  letterSpacing: "0.01em",
                },
              })}
            />
          </div>

          {/* Events List */}
          <div className="mt-6">
            <h4 className="text-lg font-semibold mb-2">Events:</h4>
            {events.length === 0 ? (
              <p className="text-gray-500 text-sm">No events yet.</p>
            ) : (
              <ul className="space-y-1">
                {events.map((event, idx) => (
                  <li
                    key={idx}
                    className="flex items-center text-sm bg-gray-50 rounded px-2 py-1 mb-1 shadow-sm"
                  >
                    <span className="inline-block w-2 h-2 rounded-full bg-[#204032] mr-2"></span>
                    {editEventIdx === idx ? (
                      <form
                        onSubmit={handleSaveEditEvent}
                        className="flex items-center gap-2 flex-1"
                      >
                        <input
                          type="text"
                          value={editEventTitle}
                          onChange={(e) => setEditEventTitle(e.target.value)}
                          className="border px-2 py-1 rounded flex-1"
                          autoFocus
                        />
                        <button
                          type="submit"
                          className="text-green-600 hover:underline text-xs px-2"
                        >
                          Save
                        </button>
                        <button
                          type="button"
                          className="text-gray-500 hover:underline text-xs px-2"
                          onClick={() => setEditEventIdx(null)}
                        >
                          Cancel
                        </button>
                      </form>
                    ) : (
                      <>
                        <span className="font-medium text-[#204032] mr-2">
                          {event.title}
                        </span>
                        <span className="text-gray-500 mr-2">
                          |{" "}
                          {new Date(event.start).toLocaleDateString(undefined, {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                          })}
                        </span>
                        <button
                          className="text-blue-600 hover:bg-blue-50 rounded-full p-1 mr-1 transition"
                          onClick={() => handleEditEvent(idx)}
                          aria-label="Edit"
                        >
                          <Edit size={18} />
                        </button>
                        <button
                          className="text-red-600 hover:bg-red-50 rounded-full p-1 transition"
                          onClick={() => handleDeleteEvent(idx)}
                          aria-label="Delete"
                        >
                          <Trash2 size={18} />
                        </button>
                      </>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>

      {showEventModal && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-xs">
            <h4 className="text-lg font-semibold mb-2">Add Event</h4>
            <form
              onSubmit={handleAddEvent}
              className="flex items-center space-x-2"
            >
              <input
                type="text"
                className="flex-1 border px-2 py-1 rounded"
                placeholder="Event title"
                value={newEventTitle}
                onChange={(e) => setNewEventTitle(e.target.value)}
                autoFocus
              />
              <button
                type="submit"
                className="bg-[#204032] text-white p-2 rounded hover:bg-[#183024] transition"
              >
                <Send size={18} />
              </button>
            </form>
            <button
              className="mt-3 text-sm text-gray-500 hover:underline"
              onClick={() => setShowEventModal(false)}
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Edit Profile Modal */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        title="Edit Profile"
      >
        <form
          onSubmit={async (e) => {
            e.preventDefault();
            const formData = new FormData();
            Object.entries(editForm).forEach(([key, value]) => {
              if (key === "image_preview") return; // Don't send preview
              if (value !== undefined && value !== null) {
                formData.append(key, value);
              }
            });
            // Call updateStudent with FormData
            const success = await updateStudent(
              currentStudent.student_id,
              formData,
              true
            ); // true = isFormData
            if (success) setIsEditModalOpen(false);
          }}
          className="space-y-4"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                First Name
              </label>
              <input
                type="text"
                value={editForm.first_name}
                onChange={(e) =>
                  setEditForm((f) => ({ ...f, first_name: e.target.value }))
                }
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#204032] focus:border-[#204032]"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Last Name
              </label>
              <input
                type="text"
                value={editForm.last_name}
                onChange={(e) =>
                  setEditForm((f) => ({ ...f, last_name: e.target.value }))
                }
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#204032] focus:border-[#204032]"
                required
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Email
            </label>
            <input
              type="email"
              value={editForm.email}
              onChange={(e) =>
                setEditForm((f) => ({ ...f, email: e.target.value }))
              }
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#204032] focus:border-[#204032]"
              required
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Gender
              </label>
              <select
                value={editForm.gender}
                onChange={(e) =>
                  setEditForm((f) => ({ ...f, gender: e.target.value }))
                }
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#204032] focus:border-[#204032]"
                required
              >
                <option value="">Select Gender</option>
                {GENDER_OPTIONS.map((opt) => (
                  <option key={opt} value={opt}>
                    {opt}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Birthdate
              </label>
              <input
                type="date"
                value={editForm.date_of_birth}
                onChange={(e) =>
                  setEditForm((f) => ({ ...f, date_of_birth: e.target.value }))
                }
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#204032] focus:border-[#204032]"
                required
              />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Course
              </label>
              <select
                value={editForm.course}
                onChange={(e) =>
                  setEditForm((f) => ({ ...f, course: e.target.value }))
                }
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#204032] focus:border-[#204032]"
                required
              >
                <option value="">Select Course</option>
                {COURSES.map((c) => (
                  <option key={c.value} value={c.value}>
                    {c.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Year Level
              </label>
              <select
                value={editForm.year_level}
                onChange={(e) =>
                  setEditForm((f) => ({ ...f, year_level: e.target.value }))
                }
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#204032] focus:border-[#204032]"
                required
              >
                <option value="">Select Year Level</option>
                {YEAR_LEVELS.map((y) => (
                  <option key={y} value={y}>
                    {y}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Section
            </label>
            <input
              type="number"
              value={editForm.section}
              onChange={(e) =>
                setEditForm((f) => ({ ...f, section: e.target.value }))
              }
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#204032] focus:border-[#204032]"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Contact Number
            </label>
            <input
              type="text"
              value={editForm.contact_number}
              onChange={(e) =>
                setEditForm((f) => ({ ...f, contact_number: e.target.value }))
              }
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#204032] focus:border-[#204032]"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Address
            </label>
            <textarea
              value={editForm.address}
              onChange={(e) =>
                setEditForm((f) => ({ ...f, address: e.target.value }))
              }
              rows={2}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#204032] focus:border-[#204032]"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Profile Image
            </label>
            <div className="flex items-center space-x-4">
              <img
                src={
                  editForm.image_preview ||
                  currentStudent.image_url ||
                  DEFAULT_STUDENT_IMAGE
                }
                alt="Profile Preview"
                className="w-24 h-24 rounded-full object-cover border-4 border-[#204032]"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = DEFAULT_STUDENT_IMAGE;
                }}
              />
              <input
                type="file"
                accept="image/*"
                onChange={(e) => {
                  const file = e.target.files[0];
                  setEditForm((f) => ({
                    ...f,
                    image: file,
                    image_preview: file
                      ? URL.createObjectURL(file)
                      : f.image_preview,
                  }));
                }}
                className="block text-sm text-gray-700"
              />
              {editForm.image && (
                <button
                  type="button"
                  onClick={() =>
                    setEditForm((f) => ({
                      ...f,
                      image: null,
                      image_preview: null,
                    }))
                  }
                  className="ml-2 p-2 rounded-full bg-red-100 text-red-600 hover:bg-red-200 transition duration-150"
                  aria-label="Clear image"
                >
                  Remove
                </button>
              )}
            </div>
          </div>
          <div className="flex justify-end space-x-3 mt-6">
            <button
              type="button"
              onClick={() => setIsEditModalOpen(false)}
              className="px-5 py-2 border border-gray-300 rounded-lg shadow-sm text-gray-700 bg-white hover:bg-gray-50 transition duration-200"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-lg shadow-md text-white bg-[#204032] hover:bg-[#183024] transition duration-200"
            >
              Save Changes
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

// --- Main App Component ---
export const App = () => {
  const [showRegister, setShowRegister] = useState(false);

  return (
    <AppProvider>
      <AppContent
        showRegister={showRegister}
        setShowRegister={setShowRegister}
      />
    </AppProvider>
  );
};

// This is the actual content, which can now safely use context hooks
const AppContent = ({ showRegister, setShowRegister }) => {
  const { userRole, loggedInStudentId, logout, login, register } = useAuth();

  // Handle successful login
  const handleLogin = async (username, password, role) => {
    const success = await login(username, password, role);
    return success;
  };

  // Handle successful registration
  const handleRegister = async (username, password, role, studentId) => {
    const success = await register(username, password, role, studentId);
    return success;
  };

  // Handle logout action
  const handleLogout = () => {
    logout();
    setShowRegister(false);
  };

  const [activeTab, setActiveTab] = useState("dashboard");
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const userMenuRef = useRef();

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
        setUserMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Only show header/navbar if logged in
  const showHeader = !!userRole;

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col font-inter">
      {/* Only show header if logged in */}
      {showHeader && (
        <header className="bg-[#204032] text-white shadow-md p-4">
          <div className="container mx-auto flex justify-between items-center">
            <div className="flex items-center">
              <img
                src={logoWhite}
                alt="Logo"
                className="h-12 w-auto mr-0"
                style={{ borderRadius: 0, background: "none" }}
              />
            </div>
            {/* User menu code */}
            {userRole && (
              <div className="relative" ref={userMenuRef}>
                <button
                  onClick={() => setUserMenuOpen((open) => !open)}
                  className="flex items-center space-x-2 px-3 py-1 rounded hover:bg-[#183024] transition"
                >
                  <UserSquare size={18} className="mr-1" />
                  <span className="text-xs font-medium text-white opacity-80">
                    {userRole === "teacher"
                      ? "Teacher"
                      : `Student (${loggedInStudentId})`}
                  </span>
                  <ChevronDown size={16} />
                </button>
                {userMenuOpen && (
                  <div className="absolute right-0 mt-2 w-40 bg-white rounded shadow-lg z-50 py-2">
                    <button
                      onClick={handleLogout}
                      className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center"
                    >
                      <LogOut size={16} className="mr-2" /> Logout
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </header>
      )}

      <main
        className={
          !userRole
            ? "flex-1 w-full px-8 md:px-1 flex items-center justify-center min-h-screen"
            : "flex-1 w-full px-8 md:px-1 min-h-screen"
        }
      >
        {!userRole ? (
          // Custom login/register layout
          <div className="flex bg-white rounded-xl shadow-lg overflow-hidden max-w-3xl w-full">
            {/* Logo Section */}
            <div className="hidden md:flex items-center justify-center bg-[#204032] p-8">
              <img
                src={logoWhite}
                alt="Logo"
                className="h-20 w-auto"
                style={{ borderRadius: 0, background: "none" }}
              />
            </div>
            {/* Form Section */}
            <div className="flex-1 flex items-center justify-center p-8 min-w-[280px]">
              {showRegister ? (
                <Register
                  onRegister={handleRegister}
                  onLoginClick={() => setShowRegister(false)}
                />
              ) : (
                <Login
                  onLogin={handleLogin}
                  onRegisterClick={() => setShowRegister(true)}
                />
              )}
            </div>
          </div>
        ) : userRole === "teacher" ? (
          // Teacher dashboard
          <div className="flex min-h-[70vh]">
            {/* Sidebar */}
            <aside className="w-48 bg-white shadow-md p-4 flex flex-col space-y-2 rounded-none rounded-r-xl min-h-[calc(100vh-5rem)] fixed top-[5rem] left-0 z-20 border-r border-gray-200">
              <button
                onClick={() => setActiveTab("dashboard")}
                className={`text-left px-4 py-3 rounded-lg font-medium text-lg transition duration-200 ${
                  activeTab === "dashboard"
                    ? "bg-[#204032] text-white"
                    : "text-[#204032] hover:bg-gray-100"
                }`}
              >
                <Home className="inline mr-2" size={20} /> Dashboard
              </button>
              <button
                onClick={() => setActiveTab("students")}
                className={`text-left px-4 py-3 rounded-lg font-medium text-lg transition duration-200 ${
                  activeTab === "students"
                    ? "bg-[#204032] text-white"
                    : "text-[#204032] hover:bg-gray-100"
                }`}
              >
                <Users className="inline mr-2" size={20} /> Students
              </button>
              <button
                onClick={() => setActiveTab("subjects")}
                className={`text-left px-4 py-3 rounded-lg font-medium text-lg transition duration-200 ${
                  activeTab === "subjects"
                    ? "bg-[#204032] text-white"
                    : "text-[#204032] hover:bg-gray-100"
                }`}
              >
                <BookOpenText className="inline mr-2" size={20} /> Subjects
              </button>
              <button
                onClick={() => setActiveTab("grades")}
                className={`text-left px-4 py-3 rounded-lg font-medium text-lg transition duration-200 ${
                  activeTab === "grades"
                    ? "bg-[#204032] text-white"
                    : "text-[#204032] hover:bg-gray-100"
                }`}
              >
                <GraduationCap className="inline mr-2" size={20} /> Grades
              </button>
            </aside>
            {/* Main Content */}
            <div className="flex-1 ml-48">
              {activeTab === "dashboard" && <TeacherHomeDashboard />}
              {activeTab === "students" && <StudentsManagement />}
              {activeTab === "subjects" && <SubjectManagement />}
              {activeTab === "grades" && <GradeManagement />}
            </div>
          </div>
        ) : (
          <StudentDashboard loggedInStudentId={loggedInStudentId} />
        )}
      </main>
    </div>
  );
};
