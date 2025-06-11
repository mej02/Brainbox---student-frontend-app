import React, { useState, useEffect } from "react";
import { App as AppProvider } from "./contexts/AppContext";
import { AuthProvider } from "./contexts/AuthContext";
import LoadingSpinner from "./components/LoadingSpinner";
import { StudentProvider } from "./contexts/StudentContext";
import { SubjectProvider } from "./contexts/SubjectContext";
import { GradeProvider } from "./contexts/GradeContext";
import { EnrollmentProvider } from "./contexts/EnrollmentContext";
import Modal from "./components/Modal";
import ConfirmationModal from "./components/ConfirmationModal";
import AppContent from "./contexts/AppContext";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export const MainApp = () => {
  const [showRegister, setShowRegister] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let timeout = setTimeout(() => setLoading(false), 5000);

    fetch("https://brainbox-student-management-system.onrender.com/api/csrf/", {
      credentials: "include",
    })
      .then(() => {
        clearTimeout(timeout);
        setLoading(false);
        toast.info("Toast test! If you see this, Toastify works.");
      })
      .catch((error) => {
        clearTimeout(timeout);
        console.error("Error fetching CSRF token:", error);
        setLoading(false);
        toast.error("CSRF fetch failed!");
      });

    return () => clearTimeout(timeout);
  }, []);

  return (
    <>
      <ToastContainer position="top-right" autoClose={2000} />
      {loading ? (
        <LoadingSpinner />
      ) : (
        <AuthProvider>
          <AppProvider>
            <StudentProvider>
              <SubjectProvider>
                <GradeProvider>
                  <EnrollmentProvider>
                    <AppContent
                      showRegister={showRegister}
                      setShowRegister={setShowRegister}
                    />
                    <Modal />
                    <ConfirmationModal />
                  </EnrollmentProvider>
                </GradeProvider>
              </SubjectProvider>
            </StudentProvider>
          </AppProvider>
        </AuthProvider>
      )}
    </>
  );
};

export default MainApp;