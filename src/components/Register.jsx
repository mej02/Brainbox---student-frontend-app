import React, { useState } from "react";
import { UserPlus, Loader2 } from "lucide-react";
import { useApp } from "../contexts/AppContext";

const Register = ({ onRegister, onLoginClick }) => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("teacher");
  const [studentId, setStudentId] = useState("");
  const { loading } = useApp();

  const handleSubmit = async (e) => {
    e.preventDefault();
    const success = await onRegister(username, password, role, studentId);
    if (success) {
      setUsername("");
      setPassword("");
      setStudentId("");
      setRole("teacher");
      onLoginClick();
    }
  };

  return (
    <div className="max-w-md mx-auto p-6 bg-white rounded-xl shadow-md font-inter">
      <h2 className="text-3xl font-bold text-gray-800 mb-6 text-center flex items-center justify-center">
        <UserPlus className="mr-3 text-green-600" size={32} /> Register
      </h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Username {role === "student" && "/ Student ID"}
          </label>
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
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
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Register As:
          </label>
          <select
            value={role}
            onChange={(e) => {
              setRole(e.target.value);
              if (e.target.value === "teacher") setStudentId("");
            }}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
          >
            <option value="teacher">Teacher</option>
            <option value="student">Student</option>
          </select>
        </div>
        {role === "student" && (
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Confirm Student ID (must match above)
            </label>
            <input
              type="text"
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

export default Register;