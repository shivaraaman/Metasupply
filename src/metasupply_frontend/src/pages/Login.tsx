import React from "react";
import { useAuth } from "../contexts/AuthContext";

const Login: React.FC = () => {
  const { login, principal } = useAuth();

  return (
    <div className="p-4 space-y-4">
      {principal ? (
        <p className="text-green-500">Logged in as: {principal.toString()}</p>
      ) : (
        <button onClick={login} className="bg-green-500 text-white p-2 rounded">
          Login with Internet Identity
        </button>
      )}
    </div>
  );
};

export default Login;
