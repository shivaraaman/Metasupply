import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { getMyDocuments, groupIntoChains, type DocumentRecord } from "../services/documents";
import VersionTimeline from "../components/VersionTimeline";
import LoadingSpinner from "../components/LoadingSpinner";
import Alert from "../components/Alert";
import { ArrowRight, Layers } from "../components/icons";

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
      <div className="mx-auto mt-10 max-w-lg">
        <Alert kind="error">{error}</Alert>
      </div>
    );
  }

  if (!chains) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl">
      <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="eyebrow">Creator panel</p>
          <h1 className="mt-3 font-display text-4xl font-bold tracking-tight text-white">My documents</h1>
          {principal && <p className="mt-2 break-all font-mono text-xs text-slate-500">Account: {principal.toText()}</p>}
        </div>
        <Link to="/register" className="btn-primary">
          Register a document <ArrowRight className="h-4 w-4" />
        </Link>
      </div>

      {chains.length === 0 ? (
        <div className="card text-center">
          <Layers className="mx-auto h-10 w-10 text-brand-violet" />
          <p className="mt-4 text-slate-300">You haven't registered any documents yet.</p>
          <Link to="/register" className="btn-ghost mt-6">Register your first one</Link>
        </div>
      ) : (
        <div className="space-y-6">
          {chains.map((versions) => {
            const latest = versions[versions.length - 1];
            return (
              <section key={versions[0].hash} className="card">
                <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
                  <div>
                    <h2 className="break-words font-display text-xl font-bold text-white">{latest.title}</h2>
                    <p className="text-sm text-slate-400">
                      {versions.length} {versions.length === 1 ? "version" : "versions"} · {latest.content_type}
                      {latest.ai && " · AI-generated"}
                    </p>
                  </div>
                  <Link to={`/register?previous=${latest.hash}`} className="btn-ghost btn-sm">
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
