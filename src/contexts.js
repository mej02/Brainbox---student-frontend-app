import React from "react";

// Create empty contexts and hooks as placeholders
export const AppContext = React.createContext();
export const StudentContext = React.createContext();
export const SubjectContext = React.createContext();
export const GradeContext = React.createContext();
export const AuthContext = React.createContext();

export const useAuth = () => React.useContext(AuthContext);
export const useGradeContext = () => React.useContext(GradeContext);
export const useApp = () => React.useContext(AppContext);