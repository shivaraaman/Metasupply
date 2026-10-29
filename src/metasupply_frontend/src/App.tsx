import React from "react";
import { HashRouter as Router, Navigate, Route, Routes, useLocation } from "react-router-dom";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import HomePage from "./pages/HomePage";
import LoginPage from "./pages/LoginPage";
import VerifyPage from "./pages/VerifyPage";
import RegisterPage from "./pages/RegisterPage";
import MyDocumentsPage from "./pages/MyDocumentsPage";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import LoadingSpinner from "./components/LoadingSpinner";
import Alert from "./components/Alert";

const RequireAuth: React.FC<{ children: React.ReactElement }> = ({ children }) => {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? children : <Navigate to="/login" replace />;
};

const Layout: React.FC = () => {
  const { configError } = useAuth();
  const isHome = useLocation().pathname === "/";

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      {configError && (
        <div className="mx-auto mt-4 w-full max-w-4xl px-4">
          <Alert kind="error">{configError}</Alert>
        </div>
      )}
      <main className={isHome ? "flex-grow" : "mx-auto w-full max-w-7xl flex-grow px-4 py-10 sm:px-6"}>
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
      {!isHome && <Footer />}
    </div>
  );
};

const AppContent: React.FC = () => {
  const { isAuthReady } = useAuth();

  if (!isAuthReady) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <Router>
      <Layout />
    </Router>
  );
};

const App: React.FC = () => (
  <AuthProvider>
    <AppContent />
  </AuthProvider>
);

export default App;
