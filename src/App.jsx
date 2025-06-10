import React, { useState, useEffect } from "react";
import { App as AppProvider } from "./contexts/AppContext";
import { AuthProvider } from "./contexts/AuthContext";
import LoadingSpinner from "./components/LoadingSpinner";
import { StudentProvider } from "./contexts/StudentContext";
import { SubjectProvider } from "./contexts/SubjectContext";
import { GradeProvider } from "./contexts/GradeContext";
import { EnrollmentProvider } from "./contexts/EnrollmentContext";
import Modal from "./components/Modal";
import Notification from "./components/Notification";
import ConfirmationModal from "./components/ConfirmationModal";
import AppContent from "./contexts/AppContext";

export const MainApp = () => {
  const [showRegister, setShowRegister] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let timeout = setTimeout(() => setLoading(false), 5000); // 5 seconds max

    fetch("https://brainbox-student-management-system.onrender.com/api/csrf/", {
      credentials: "include",
    })
      .then(() => {
        clearTimeout(timeout);
        setLoading(false);
      })
      .catch((error) => {
        clearTimeout(timeout);
        console.error("Error fetching CSRF token:", error);
        setLoading(false);
      });

    return () => clearTimeout(timeout);
  }, []);

  if (loading) {
    return <LoadingSpinner />;
  }


  return (
      <AuthProvider>
        <AppProvider>
          <StudentProvider>
            <SubjectProvider>
              <GradeProvider>
                <EnrollmentProvider>
                  <AppContent showRegister={showRegister} setShowRegister={setShowRegister} />
                  <Modal />
                  <Notification />
                  <ConfirmationModal />
              </EnrollmentProvider>
            </GradeProvider>
          </SubjectProvider>
        </StudentProvider>
      </AppProvider>
    </AuthProvider>
  );
};

export default MainApp;