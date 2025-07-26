import React from "react";
import { useAuth } from "../contexts/AuthContext"; // Import the authentication context
import { useNavigate } from "react-router-dom"; // For programmatic navigation

const LoginPage: React.FC = () => {
  const { isAuthenticated, login, isAuthReady, principal } = useAuth(); // Get auth state and functions
  const navigate = useNavigate(); // Hook to navigate programmatically

  // If already authenticated and the initial auth check is complete, redirect to the home page.
  // This prevents showing the login page to already logged-in users.
  if (isAuthReady && isAuthenticated) {
    navigate("/");
    return null; // Don't render anything while redirecting
  }

  return (
    <div className="flex flex-col items-center justify-center p-6 bg-white rounded-lg shadow-xl max-w-md mx-auto mt-10">
      <h2 className="text-4xl font-extrabold text-gray-800 mb-8 text-center">
        Login to MetaSupply
      </h2>
      <p className="text-lg text-gray-600 mb-8 text-center">
        Securely access your decentralized file metadata management system using Internet Identity.
      </p>
      <button
        onClick={login} // Call the login function from AuthContext
        disabled={!isAuthReady} // Disable button until AuthClient is initialized
        className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-8 rounded-lg shadow-lg transition-all duration-300 ease-in-out transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isAuthReady ? "Login with Internet Identity" : "Loading..."}
      </button>
      {/* Display user's principal if available (useful for debugging/info) */}
      {principal && (
        <p className="mt-6 text-sm text-gray-500 text-center break-all">
          Your Principal: <span className="font-mono text-gray-700">{principal.toText()}</span>
        </p>
      )}
      {/* Show loading message if auth is still initializing */}
      {!isAuthReady && (
        <p className="mt-4 text-gray-500">Initializing authentication...</p>
      )}
    </div>
  );
};

export default LoginPage;
