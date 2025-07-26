// metasupply/src/metasupply_frontend/src/App.tsx

import React from "react";
import { AuthProvider, useAuth } from "./contexts/AuthContext"; // Import AuthProvider and useAuth hook
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom"; // For routing
import LoginPage from "./pages/LoginPage"; // Import page components
import UploadPage from "./pages/UploadPage";
import MyFilesPage from "./pages/MyFilesPage";
import SearchPage from "./pages/SearchPage";
import LoadingSpinner from "./components/LoadingSpinner"; // Import loading spinner

// Main application component. It wraps the entire app with AuthProvider.
function App() {
  return (
    // AuthProvider makes authentication state and functions available throughout the app
    <AuthProvider>
      <AppContent /> {/* Render the main content component */}
    </AuthProvider>
  );
}

// AppContent component consumes AuthContext and handles conditional rendering and routing.
const AppContent: React.FC = () => {
  const { isAuthenticated, isAuthReady, logout } = useAuth(); // Get auth state and logout function

  // Show a loading spinner until the initial authentication check is complete.
  if (!isAuthReady) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100 font-inter">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <Router>
      <div className="min-h-screen bg-gray-100 font-inter flex flex-col">
        {/* Header/Navigation Bar */}
        <header className="bg-gradient-to-r from-blue-600 to-purple-700 text-white p-4 shadow-lg">
          <div className="container mx-auto flex justify-between items-center">
            {/* App Title/Home Link */}
            <Link to="/" className="text-3xl font-bold rounded-md px-3 py-1 hover:bg-blue-700 transition-colors">
              MetaSupply
            </Link>
            {/* Navigation Links */}
            <nav>
              <ul className="flex space-x-6">
                {isAuthenticated ? (
                  // Links for authenticated users
                  <>
                    <li>
                      <Link
                        to="/upload"
                        className="text-lg font-medium hover:text-blue-200 transition-colors rounded-md px-3 py-1 hover:bg-blue-700"
                      >
                        Upload
                      </Link>
                    </li>
                    <li>
                      <Link
                        to="/my-files"
                        className="text-lg font-medium hover:text-blue-200 transition-colors rounded-md px-3 py-1 hover:bg-blue-700"
                      >
                        My Files
                      </Link>
                    </li>
                    <li>
                      <Link
                        to="/search"
                        className="text-lg font-medium hover:text-blue-200 transition-colors rounded-md px-3 py-1 hover:bg-blue-700"
                      >
                        Search
                      </Link>
                    </li>
                    <li>
                      {/* Logout Button */}
                      <button
                        onClick={logout}
                        className="bg-red-500 hover:bg-red-600 text-white font-semibold py-2 px-4 rounded-md shadow-md transition-all duration-300 ease-in-out transform hover:scale-105"
                      >
                        Logout
                      </button>
                    </li>
                  </>
                ) : (
                  // Link for unauthenticated users (Login)
                  <li>
                    <Link
                      to="/login"
                      className="bg-green-500 hover:bg-green-600 text-white font-semibold py-2 px-4 rounded-md shadow-md transition-all duration-300 ease-in-out transform hover:scale-105"
                    >
                      Login
                    </Link>
                  </li>
                )}
              </ul>
            </nav>
          </div>
        </header>

        {/* Main content area for routing */}
        <main className="flex-grow container mx-auto p-6">
          <Routes>
            {/* Home Page Route */}
            <Route
              path="/"
              element={
                <div className="text-center py-20">
                  <h1 className="text-5xl font-extrabold text-gray-800 mb-6">
                    Welcome to MetaSupply
                  </h1>
                  <p className="text-xl text-gray-600 mb-8">
                    Your decentralized platform for managing file metadata and versioning on the Internet Computer.
                  </p>
                  {!isAuthenticated && (
                    <Link
                      to="/login"
                      className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-8 rounded-lg shadow-lg transition-all duration-300 ease-in-out transform hover:scale-105"
                    >
                      Get Started - Login
                    </Link>
                  )}
                  {isAuthenticated && (
                    <p className="text-lg text-gray-700">
                      You are logged in! Navigate using the menu above.
                    </p>
                  )}
                </div>
              }
            />
            {/* Login Page Route */}
            <Route path="/login" element={<LoginPage />} />
            {/* Protected Routes: only accessible if isAuthenticated is true */}
            {isAuthenticated ? (
              <>
                <Route path="/upload" element={<UploadPage />} />
                <Route path="/my-files" element={<MyFilesPage />} />
                <Route path="/search" element={<SearchPage />} />
              </>
            ) : (
              // If not authenticated, redirect any attempt to access protected routes to login.
              // The `*` path acts as a catch-all for any route not explicitly defined above.
              <Route path="*" element={<LoginPage />} />
            )}
          </Routes>
        </main>

        {/* Footer */}
        <footer className="bg-gray-800 text-white p-4 text-center shadow-inner">
          <div className="container mx-auto">
            <p>&copy; {new Date().getFullYear()} MetaSupply. All rights reserved.</p>
            <p className="text-sm mt-1">Built for the Internet Computer Hackathon.</p>
          </div>
        </footer>
      </div>
    </Router>
  );
};

export default App;
