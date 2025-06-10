import React from "react";
import { CheckCircle, AlertCircle } from "lucide-react";

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

export default Notification;