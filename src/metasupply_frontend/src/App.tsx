import React from "react";
import { HashRouter as Router, Link, Navigate, Route, Routes } from "react-router-dom";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import LoginPage from "./pages/LoginPage";
import UploadPage from "./pages/UploadPage";
import MyFilesPage from "./pages/MyFilesPage";
import SearchPage from "./pages/SearchPage";
import LoadingSpinner from "./components/LoadingSpinner";
import Alert from "./components/Alert";

const navLink =
  "text-lg font-medium hover:text-blue-200 transition-colors rounded-md px-3 py-1 hover:bg-blue-700";

const RequireAuth: React.FC<{ children: React.ReactElement }> = ({ children }) => {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? children : <Navigate to="/login" replace />;
};

const Home: React.FC = () => {
  const { isAuthenticated } = useAuth();
  return (
    <div className="text-center py-20">
      <h1 className="text-4xl sm:text-5xl font-extrabold text-gray-800 mb-6">Welcome to MetaSupply</h1>
      <p className="text-xl text-gray-600 mb-8">
        Your decentralized platform for managing file metadata and versioning on the Internet Computer.
      </p>
      {isAuthenticated ? (
        <p className="text-lg text-gray-700">You are logged in! Navigate using the menu above.</p>
      ) : (
        <Link
          to="/login"
          className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-8 rounded-lg shadow-lg transition-all duration-300 ease-in-out transform hover:scale-105"
        >
          Get Started - Login
        </Link>
      )}
    </div>
  );
};

const AppContent: React.FC = () => {
  const { isAuthenticated, isAuthReady, configError, logout } = useAuth();

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
        <header className="bg-gradient-to-r from-blue-600 to-purple-700 text-white p-4 shadow-lg">
          <div className="container mx-auto flex flex-wrap gap-4 justify-between items-center">
            <Link to="/" className="text-3xl font-bold rounded-md px-3 py-1 hover:bg-blue-700 transition-colors">
              MetaSupply
            </Link>
            <nav>
              <ul className="flex flex-wrap items-center gap-4">
                {isAuthenticated ? (
                  <>
                    <li><Link to="/upload" className={navLink}>Upload</Link></li>
                    <li><Link to="/my-files" className={navLink}>My Files</Link></li>
                    <li><Link to="/search" className={navLink}>Search</Link></li>
                    <li>
                      <button
                        onClick={logout}
                        className="bg-red-500 hover:bg-red-600 text-white font-semibold py-2 px-4 rounded-md shadow-md transition-all duration-300 ease-in-out transform hover:scale-105"
                      >
                        Logout
                      </button>
                    </li>
                  </>
                ) : (
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

        <main className="flex-grow container mx-auto p-6">
          {configError && (
            <div className="max-w-3xl mx-auto mb-6">
              <Alert kind="error">{configError}</Alert>
            </div>
          )}
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/upload" element={<RequireAuth><UploadPage /></RequireAuth>} />
            <Route path="/my-files" element={<RequireAuth><MyFilesPage /></RequireAuth>} />
            <Route path="/search" element={<RequireAuth><SearchPage /></RequireAuth>} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>

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

const App: React.FC = () => (
  <AuthProvider>
    <AppContent />
  </AuthProvider>
);

export default App;
