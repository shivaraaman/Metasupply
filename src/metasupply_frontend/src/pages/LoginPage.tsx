import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

const LoginPage: React.FC = () => {
  const { isAuthenticated, isAuthReady, login } = useAuth();

  if (isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="flex flex-col items-center justify-center p-6 bg-white rounded-lg shadow-xl max-w-md mx-auto mt-10">
      <h2 className="text-4xl font-extrabold text-gray-800 mb-8 text-center">Login to MetaSupply</h2>
      <p className="text-lg text-gray-600 mb-8 text-center">
        Securely access your decentralized file metadata management system using Internet Identity.
      </p>
      <button
        onClick={login}
        disabled={!isAuthReady}
        className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-8 rounded-lg shadow-lg transition-all duration-300 ease-in-out transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isAuthReady ? "Login with Internet Identity" : "Loading..."}
      </button>
    </div>
  );
};

export default LoginPage;
