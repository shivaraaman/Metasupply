import React from "react";
import { HashRouter as Router, Link, NavLink, Navigate, Route, Routes } from "react-router-dom";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import HomePage from "./pages/HomePage";
import LoginPage from "./pages/LoginPage";
import VerifyPage from "./pages/VerifyPage";
import RegisterPage from "./pages/RegisterPage";
import MyDocumentsPage from "./pages/MyDocumentsPage";
import LoadingSpinner from "./components/LoadingSpinner";
import Alert from "./components/Alert";

const navLink = ({ isActive }: { isActive: boolean }) =>
  `text-lg font-medium transition-colors rounded-md px-3 py-1 hover:bg-blue-700 ${isActive ? "bg-blue-700" : ""}`;

const RequireAuth: React.FC<{ children: React.ReactElement }> = ({ children }) => {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? children : <Navigate to="/login" replace />;
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
              <ul className="flex flex-wrap items-center gap-2">
                <li><NavLink to="/verify" className={navLink}>Verify</NavLink></li>
                {isAuthenticated ? (
                  <>
                    <li><NavLink to="/register" className={navLink}>Register</NavLink></li>
                    <li><NavLink to="/my-documents" className={navLink}>My documents</NavLink></li>
                    <li>
                      <button
                        onClick={logout}
                        className="ml-2 bg-red-500 hover:bg-red-600 text-white font-semibold py-2 px-4 rounded-md shadow-md"
                      >
                        Log out
                      </button>
                    </li>
                  </>
                ) : (
                  <li>
                    <Link
                      to="/login"
                      className="ml-2 bg-green-500 hover:bg-green-600 text-white font-semibold py-2 px-4 rounded-md shadow-md"
                    >
                      Log in
                    </Link>
                  </li>
                )}
              </ul>
            </nav>
          </div>
        </header>

        <main className="flex-grow container mx-auto p-6">
          {configError && (
            <div className="max-w-4xl mx-auto mb-6">
              <Alert kind="error">{configError}</Alert>
            </div>
          )}
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/verify" element={<VerifyPage />} />
            <Route path="/verify/:hash" element={<VerifyPage />} />
            <Route path="/register" element={<RequireAuth><RegisterPage /></RequireAuth>} />
            <Route path="/my-documents" element={<RequireAuth><MyDocumentsPage /></RequireAuth>} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>

        <footer className="bg-gray-800 text-white p-4 text-center shadow-inner">
          <div className="container mx-auto">
            <p>&copy; {new Date().getFullYear()} MetaSupply</p>
            <p className="text-sm mt-1 text-gray-300">Document fingerprints recorded on the Internet Computer.</p>
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
