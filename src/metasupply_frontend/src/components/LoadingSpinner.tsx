import React from "react";

const LoadingSpinner: React.FC = () => (
  <div className="flex items-center justify-center gap-3" role="status">
    <span className="relative h-9 w-9">
      <span className="absolute inset-0 animate-spin rounded-full bg-[conic-gradient(from_0deg,#29ABE2,#7C4DFF,#ED1E79,transparent_75%)]" />
      <span className="absolute inset-[3px] rounded-full bg-ink-950" />
    </span>
    <span className="text-slate-400">Loading…</span>
  </div>
);

export default LoadingSpinner;
