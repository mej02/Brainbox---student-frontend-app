import React, { useEffect } from "react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

function App() {
  useEffect(() => {
    toast.info("Toast test! If you see this, Toastify works.");
  }, []);

  return (
    <div>
      <h1>Toast Test</h1>
      <ToastContainer position="top-right" autoClose={2000} />
    </div>
  );
}

export default App;