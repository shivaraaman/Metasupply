import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { getMyDocuments, groupIntoChains, type DocumentRecord } from "../services/documents";
import VersionTimeline from "../components/VersionTimeline";
import LoadingSpinner from "../components/LoadingSpinner";
import Alert from "../components/Alert";

const MyDocumentsPage: React.FC = () => {
  const { actor, principal } = useAuth();
  const [chains, setChains] = useState<DocumentRecord[][] | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!actor) return;
    getMyDocuments(actor)
      .then((docs) => setChains(groupIntoChains(docs)))
      .catch((err) => setError(err.message));
  }, [actor]);

  if (error) {
    return (
      <div className="max-w-lg mx-auto mt-10">
        <Alert kind="error">{error}</Alert>
      </div>
    );
  }

  if (!chains) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto mt-6">
      <div className="flex flex-wrap items-end justify-between gap-4 mb-6">
        <div>
          <h2 className="text-3xl font-extrabold text-gray-800">My documents</h2>
          {principal && (
            <p className="text-xs text-gray-500 font-mono mt-1 break-all">Account: {principal.toText()}</p>
          )}
        </div>
        <Link to="/register" className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-md">
          Register a document
        </Link>
      </div>

      {chains.length === 0 ? (
        <div className="bg-white p-8 rounded-lg shadow-xl text-center text-gray-600">
          You haven't registered any documents yet.{" "}
          <Link to="/register" className="text-blue-600 hover:underline">Register your first one.</Link>
        </div>
      ) : (
        <div className="space-y-8">
          {chains.map((versions) => {
            const latest = versions[versions.length - 1];
            return (
              <section key={versions[0].hash} className="bg-white p-6 rounded-lg shadow-xl">
                <div className="flex flex-wrap items-start justify-between gap-4 mb-4">
                  <div>
                    <h3 className="text-xl font-bold text-gray-800 break-words">{latest.title}</h3>
                    <p className="text-sm text-gray-500">
                      {versions.length} {versions.length === 1 ? "version" : "versions"}
                    </p>
                  </div>
                  <Link
                    to={`/register?previous=${latest.hash}`}
                    className="text-blue-600 hover:text-blue-900 py-1 px-3 rounded-md bg-blue-100 hover:bg-blue-200 font-medium"
                  >
                    Register new version
                  </Link>
                </div>
                <VersionTimeline versions={versions} />
              </section>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default MyDocumentsPage;
