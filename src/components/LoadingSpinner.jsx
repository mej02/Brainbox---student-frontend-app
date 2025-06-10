import React from "react";
import { Loader2 } from "lucide-react";

const LoadingSpinner = () => (
  <div className="flex items-center justify-center min-h-[60vh]">
    <svg
      className="animate-spin"
      width={48}
      height={48}
      viewBox="0 0 50 50"
      style={{ color: "#204032" }} // Set spinner color here
    >
      <circle
        className="opacity-25"
        cx="25"
        cy="25"
        r="20"
        fill="none"
        stroke="#e5e7eb"
        strokeWidth="5"
      />
      <circle
        className="opacity-75"
        cx="25"
        cy="25"
        r="20"
        fill="none"
        stroke="#204032" // Dashboard green
        strokeWidth="5"
        strokeLinecap="round"
        strokeDasharray="90,150"
        strokeDashoffset="0"
      />
    </svg>
  </div>
);

export default LoadingSpinner;