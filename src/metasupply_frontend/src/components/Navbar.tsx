import React from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

const Navbar: React.FC = () => {
  const { principal, logout } = useAuth();

  return (
    <nav className="bg-gray-800 text-white p-3 flex justify-between items-center">
      <div className="space-x-4">
        <Link to="/" className="hover:underline">Home</Link>
        <Link to="/upload" className="hover:underline">Upload</Link>
        <Link to="/myfiles" className="hover:underline">My Files</Link>
        <Link to="/search" className="hover:underline">Search</Link>
      </div>
      <div>
        {principal ? (
          <div className="flex items-center space-x-2">
            <span className="text-xs">{principal.toString().slice(0, 8)}...</span>
            <button onClick={logout} className="bg-red-500 text-white px-2 py-1 rounded text-xs">
              Logout
            </button>
          </div>
        ) : (
          <Link to="/login" className="bg-green-500 px-2 py-1 rounded text-xs">Login</Link>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
