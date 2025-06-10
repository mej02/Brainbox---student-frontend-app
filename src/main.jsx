import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import { AuthProvider } from "./contexts/AuthContext";
import { SubjectProvider } from "./contexts/SubjectContext";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <SubjectProvider>
      <App />
    </SubjectProvider>
  </React.StrictMode>
);