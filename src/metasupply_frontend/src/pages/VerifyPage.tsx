import React, { useEffect, useState } from "react";
import { Link, useLocation, useNavigate, useParams } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { getHistory, isSha256, type DocumentRecord } from "../services/documents";
import FileDrop from "../components/FileDrop";
import DocumentDetails from "../components/DocumentDetails";
import VersionTimeline from "../components/VersionTimeline";
import ShareLink from "../components/ShareLink";
import LoadingSpinner from "../components/LoadingSpinner";
import Alert from "../components/Alert";
import { inputClass } from "../styles";

type Lookup =
  | { state: "idle" }
  | { state: "loading" }
  | { state: "error"; message: string }
  | { state: "done"; versions: DocumentRecord[] };

const VerifyPage: React.FC = () => {
  const { hash: rawHash = "" } = useParams();
  const hash = rawHash.toLowerCase();
  const checkedFileName = (useLocation().state as { fileName?: string } | null)?.fileName;
  const navigate = useNavigate();
  const { actor } = useAuth();
  const [hashInput, setHashInput] = useState("");
  const [lookup, setLookup] = useState<Lookup>({ state: "idle" });

  useEffect(() => {
    if (!hash || !actor) {
      setLookup({ state: "idle" });
      return;
    }
    if (!isSha256(hash)) {
      setLookup({ state: "error", message: "That is not a valid SHA-256 fingerprint (64 hexadecimal characters)." });
      return;
    }
    let cancelled = false;
    setLookup({ state: "loading" });
    getHistory(actor, hash)
      .then((versions) => !cancelled && setLookup({ state: "done", versions }))
      .catch((err) => !cancelled && setLookup({ state: "error", message: err.message }));
    return () => {
      cancelled = true;
    };
  }, [actor, hash]);

  const submitHash = (e: React.FormEvent) => {
    e.preventDefault();
    navigate(`/verify/${hashInput.trim().toLowerCase()}`);
  };

  const match = lookup.state === "done" ? lookup.versions.find((d) => d.hash === hash) : undefined;
  const latest = lookup.state === "done" ? lookup.versions[lookup.versions.length - 1] : undefined;

  return (
    <div className="max-w-4xl mx-auto mt-6 space-y-8">
      <section className="bg-white p-8 rounded-lg shadow-xl">
        <h2 className="text-3xl font-extrabold text-gray-800 mb-2">Verify a document</h2>
        <p className="text-gray-600 mb-6">
          Check whether a file is registered, when it was registered, by whom, and whether newer versions exist.
          Anyone can verify; no login is needed.
        </p>
        <FileDrop
          prompt="Choose the file to check, or drag it here"
          onHashed={(result) =>
            result && navigate(`/verify/${result.hash}`, { state: { fileName: result.file.name } })
          }
        />
        <form onSubmit={submitHash} className="mt-4 flex flex-col sm:flex-row gap-3">
          <input
            type="text"
            value={hashInput}
            onChange={(e) => setHashInput(e.target.value)}
            placeholder="…or paste a SHA-256 fingerprint"
            className={`${inputClass} font-mono text-sm`}
          />
          <button
            type="submit"
            disabled={!isSha256(hashInput)}
            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-md disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Look up
          </button>
        </form>
      </section>

      {lookup.state === "loading" && (
        <div className="flex justify-center py-10">
          <LoadingSpinner />
        </div>
      )}

      {lookup.state === "error" && <Alert kind="error">{lookup.message}</Alert>}

      {lookup.state === "done" && !match && (
        <section className="bg-white p-8 rounded-lg shadow-xl border-l-8 border-red-500">
          <h3 className="text-2xl font-bold text-red-700">Not registered</h3>
          <p className="text-gray-700 mt-2">
            {checkedFileName ? <>“{checkedFileName}” is</> : <>This fingerprint is</>} not on record. Either it was
            never registered, or the file has been changed. Changing even one character gives a completely different
            fingerprint.
          </p>
          <p className="font-mono text-xs text-gray-500 mt-4 break-all">{hash}</p>
        </section>
      )}

      {match && latest && lookup.state === "done" && (
        <>
          <section className="bg-white p-8 rounded-lg shadow-xl border-l-8 border-green-500">
            <h3 className="text-2xl font-bold text-green-700">Registered</h3>
            <p className="text-gray-700 mt-2">
              {checkedFileName ? <>“{checkedFileName}” matches</> : <>This fingerprint matches</>} version{" "}
              {match.version} of “{match.title}”, recorded on the Internet Computer and unchanged since.
            </p>
            {latest.hash !== match.hash && (
              <div className="mt-4">
                <Alert kind="warning">
                  A newer version exists (version {latest.version}).{" "}
                  <Link to={`/verify/${latest.hash}`} className="underline font-semibold">
                    View the latest version
                  </Link>
                </Alert>
              </div>
            )}
            <div className="mt-6 grid md:grid-cols-3 gap-8">
              <div className="md:col-span-2">
                <DocumentDetails document={match} />
              </div>
              <ShareLink hash={match.hash} />
            </div>
          </section>

          <section className="bg-white p-8 rounded-lg shadow-xl">
            <h3 className="text-2xl font-bold text-gray-800 mb-6">
              Version history ({lookup.versions.length} {lookup.versions.length === 1 ? "version" : "versions"})
            </h3>
            <VersionTimeline versions={lookup.versions} current={match.hash} />
          </section>
        </>
      )}
    </div>
  );
};

export default VerifyPage;
