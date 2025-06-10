import React, { createContext, useContext, useState, useRef, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";

import { StudentProvider } from "./StudentContext";
import { GradeProvider } from "./GradeContext";
import { EnrollmentProvider } from "./EnrollmentContext";

import Login from "../components/Login";
import Register from "../components/Register";
import Modal from "../components/Modal";
import Notification from "../components/Notification";
import ConfirmationModal from "../components/ConfirmationModal";
import LoadingSpinner from "../components/LoadingSpinner";
import { SubjectProvider } from "./SubjectContext";

import TeacherHomeDashboard from "../components/TeacherHomeDashboard";
import StudentsManagement from "../components/StudentsManagement";
import SubjectManagement from "../components/SubjectManagement";
import GradeManagement from "../components/GradeManagement";
import StudentDashboard from "../components/StudentDashboard";
import logoWhite from "../assets/image/logo-white.png"; // adjust path if needed
import { UserSquare, ChevronDown, LogOut, Home, Users, BookOpenText, GraduationCap } from "lucide-react";


export const AppContext = createContext();
export const useApp = () => useContext(AppContext);

export const AppProvider = ({ children }) => {
  return (
    <AppContext.Provider value={{}}>
      {children}
    </AppContext.Provider>
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
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
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
                  login={handleLogin}
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
export const App = () => {
  const [showRegister, setShowRegister] = useState(false);
  const [loading, setLoading] = useState(true);


  useEffect(() => {
    // Show spinner for 5 seconds
    const timer = setTimeout(() => setLoading(false), 5000);
    return () => clearTimeout(timer);
  }, []);

  if (loading) {
    return <LoadingSpinner />;
  }

   return (
    <AppProvider>
      <StudentProvider>
        <SubjectProvider>
          <GradeProvider>
            <EnrollmentProvider>
              <AppContent showRegister={showRegister} setShowRegister={setShowRegister} />
              <Modal />
              <Notification />
              <ConfirmationModal />
              <LoadingSpinner />
            </EnrollmentProvider>
          </GradeProvider>
        </SubjectProvider>
      </StudentProvider>
    </AppProvider>
  );
};

export default AppContent;