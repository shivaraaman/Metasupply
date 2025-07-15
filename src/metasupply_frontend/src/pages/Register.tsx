import React, { useState } from "react";
import { backendActor } from "../utils/backend";


const Register: React.FC = () => {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [result, setResult] = useState("");

  const handleRegister = async () => {
    try {
      const res = await backendActor.register_user(username, email);
      setResult(`Registered! Backend says: ${res}`);
    } catch (err) {
      console.error(err);
      setResult("Registration failed");
    }
  };

  return (
    <div className="p-4 space-y-2">
      <input placeholder="Username" value={username} onChange={(e) => setUsername(e.target.value)} />
      <input placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} />
      <button onClick={handleRegister} className="bg-blue-500 text-white p-2 rounded">Register</button>
      <div>{result}</div>
    </div>
  );
};

export default Register;
