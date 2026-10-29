import React from "react";

const styles = {
  error: "border-rose-500/30 bg-rose-500/10 text-rose-200",
  success: "border-emerald-500/30 bg-emerald-500/10 text-emerald-200",
  warning: "border-amber-400/30 bg-amber-400/10 text-amber-100",
  info: "border-sky-400/30 bg-sky-400/10 text-sky-100",
};

const Alert: React.FC<{ kind: keyof typeof styles; children: React.ReactNode }> = ({ kind, children }) => (
  <div className={`break-words rounded-2xl border px-4 py-3 text-sm ${styles[kind]}`} role="alert">
    {children}
  </div>
);

export default Alert;
