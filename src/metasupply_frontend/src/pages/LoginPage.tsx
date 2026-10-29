import React from "react";
import { Link, Navigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { LogoMark } from "../components/icons";

const LoginPage: React.FC = () => {
  const { isAuthenticated, isAuthReady, login } = useAuth();

  if (isAuthenticated) {
    return <Navigate to="/my-documents" replace />;
  }

  return (
    <div className="flex min-h-[60vh] items-center justify-center">
      <div className="card relative w-full max-w-md overflow-hidden text-center">
        <div className="absolute -top-24 left-1/2 h-48 w-48 -translate-x-1/2 rounded-full bg-gradient-to-tr from-brand-cyan via-brand-violet to-brand-magenta opacity-30 blur-3xl" />
        <LogoMark className="relative mx-auto h-16 w-16 animate-float" />
        <h1 className="relative mt-6 font-display text-3xl font-bold text-white">Log in to MetaSupply</h1>
        <p className="relative mt-3 text-slate-400">
          Log in with Internet Identity to register documents. Each record is tied to your account, and only you can add
          new versions of your work.
        </p>
        <button onClick={login} disabled={!isAuthReady} className="btn-primary relative mt-8 w-full py-3.5 text-base">
          {isAuthReady ? "Log in with Internet Identity" : "Loading…"}
        </button>
        <p className="relative mt-6 text-sm text-slate-500">
          Just checking a file?{" "}
          <Link to="/verify" className="text-brand-cyan hover:underline">Verify without logging in</Link>
        </p>
      </div>
    </div>
  );
};

export default LoginPage;
