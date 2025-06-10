import React, { useState } from "react";
import { LogIn, Loader2 } from "lucide-react";
import { useApp } from "../contexts/AppContext";
import { useAuth } from "../contexts/AuthContext"; // <-- Import useAuth
import { getCookie } from "../utils/csrf";

const getCSRFTokenFromBackend = async () => {
  await fetch("https://brainbox-student-management-system.onrender.com/api/csrf/", {
    credentials: "include",
  });
};

const Login = ({ onRegisterClick }) => { // <-- Remove login from props
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("teacher");
  const { loading } = useApp();
  const { login } = useAuth(); // <-- Get login from context

  const handleSubmit = async (e) => {
    e.preventDefault();
    await getCSRFTokenFromBackend();
    const csrftoken = getCookie("csrftoken");
    const success = await login(username, password, role, csrftoken);
    if (success) {
      setUsername("");
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
          <label className="block text-sm font-medium text-gray-700">
            Username / Student ID
          </label>
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-[#204032] focus:border-[#204032]"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Password
          </label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-[#204032] focus:border-[#204032]"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Login As:
          </label>
          <select
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

export default Login;