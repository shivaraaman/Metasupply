import React from "react";

const styles = {
  error: "bg-red-100 border-red-400 text-red-700",
  success: "bg-green-100 border-green-400 text-green-700",
};

const Alert: React.FC<{ kind: keyof typeof styles; children: React.ReactNode }> = ({ kind, children }) => (
  <div className={`border px-4 py-3 rounded break-words ${styles[kind]}`} role="alert">
    {children}
  </div>
);

export default Alert;
