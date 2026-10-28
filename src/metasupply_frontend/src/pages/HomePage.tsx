import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { getTotalDocuments } from "../services/documents";

const steps = [
  {
    title: "1. Register",
    text: "Pick your file. Your browser computes its SHA-256 fingerprint. The fingerprint, title, author and the blockchain's date and time are recorded permanently.",
  },
  {
    title: "2. Update",
    text: "Changed the document? Register the new file as a new version. It is linked to the earlier one, so the whole history is kept.",
  },
  {
    title: "3. Verify",
    text: "Anyone can check a file or fingerprint to see when it was registered, by whom, and every version before and after it.",
  },
];

const HomePage: React.FC = () => {
  const { actor, isAuthenticated } = useAuth();
  const [total, setTotal] = useState<bigint | null>(null);

  useEffect(() => {
    if (actor) getTotalDocuments(actor).then(setTotal).catch(() => setTotal(null));
  }, [actor]);

  return (
    <div className="max-w-5xl mx-auto">
      <section className="text-center py-14">
        <h1 className="text-4xl sm:text-5xl font-extrabold text-gray-800 mb-6">
          Prove when a document existed
        </h1>
        <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
          MetaSupply records a tamper-proof fingerprint of your papers and files on the Internet Computer blockchain,
          with the date, time, author and every later version. Records can never be edited or deleted.
        </p>
        <div className="flex flex-wrap justify-center gap-4">
          <Link
            to="/verify"
            className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-8 rounded-lg shadow-lg transition-transform hover:scale-105"
          >
            Verify a document
          </Link>
          <Link
            to={isAuthenticated ? "/register" : "/login"}
            className="bg-white hover:bg-gray-50 text-blue-700 border border-blue-600 font-bold py-3 px-8 rounded-lg shadow-lg transition-transform hover:scale-105"
          >
            Register a document
          </Link>
        </div>
        {total !== null && (
          <p className="text-sm text-gray-500 mt-6">{total.toString()} documents registered so far</p>
        )}
      </section>

      <section className="grid md:grid-cols-3 gap-6 pb-10">
        {steps.map((step) => (
          <div key={step.title} className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-bold text-gray-800 mb-2">{step.title}</h2>
            <p className="text-gray-600">{step.text}</p>
          </div>
        ))}
      </section>

      <section className="bg-white p-6 rounded-lg shadow-md mb-10">
        <h2 className="text-xl font-bold text-gray-800 mb-2">Your file stays private</h2>
        <p className="text-gray-600">
          The file itself is never uploaded. Only its fingerprint is stored: a 64-character code that changes completely
          if even one character of the file changes. That is enough to prove a file existed, without revealing what is
          in it. Keep your original file safe, because it is the only file that will match the record.
        </p>
      </section>
    </div>
  );
};

export default HomePage;
