import React from "react";

const styles = {
  error: "bg-red-100 border-red-400 text-red-700",
  success: "bg-green-100 border-green-400 text-green-700",
  warning: "bg-yellow-50 border-yellow-400 text-yellow-800",
  info: "bg-blue-50 border-blue-300 text-blue-800",
};

const Alert: React.FC<{ kind: keyof typeof styles; children: React.ReactNode }> = ({ kind, children }) => (
  <div className={`border px-4 py-3 rounded break-words ${styles[kind]}`} role="alert">
    {children}
  </div>
);

export default Alert;
