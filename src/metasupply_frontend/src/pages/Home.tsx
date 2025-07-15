import React from "react";
import { useAuth } from "../contexts/AuthContext";
import { Link } from "react-router-dom";

const Home: React.FC = () => {
  const { principal } = useAuth();

  return (
    <div className="p-6 space-y-4 text-center">
      <h1 className="text-3xl font-bold">Welcome to MetaSupply</h1>

      <div className="flex justify-center space-x-4">
        {principal ? (
          <>
            <Link
              to="/upload"
              className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
            >
              Upload Files
            </Link>
          </>
        ) : (
          <>
            <Link
              to="/login"
              className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
            >
              Login
            </Link>
          </>
        )}
      </div>

      <p className="text-gray-500 mt-4">
        {principal ? `Logged in as: ${principal}` : "Please login to upload files."}
      </p>
    </div>
  );
};

export default Home;
