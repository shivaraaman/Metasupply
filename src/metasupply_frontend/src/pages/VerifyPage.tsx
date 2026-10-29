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
import { ArrowRight, Close, ShieldCheck } from "../components/icons";

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
    <div className="mx-auto max-w-5xl space-y-8">
      <section className="card">
        <p className="eyebrow">Verify</p>
        <h1 className="mt-3 font-display text-4xl font-bold tracking-tight text-white">Is this the original?</h1>
        <p className="mt-3 max-w-2xl text-slate-400">
          Check whether a file is registered, when, by whom, how it was made, and whether newer versions exist. Anyone
          can verify; no login needed.
        </p>
        <div className="mt-8">
          <FileDrop
            prompt="Choose the file to check, or drag it here"
            onHashed={(result) =>
              result && navigate(`/verify/${result.hash}`, { state: { fileName: result.file.name } })
            }
          />
        </div>
        <form onSubmit={submitHash} className="mt-4 flex flex-col gap-3 sm:flex-row">
          <input
            type="text"
            value={hashInput}
            onChange={(e) => setHashInput(e.target.value)}
            placeholder="…or paste a SHA-256 fingerprint"
            className="input font-mono text-sm"
            aria-label="SHA-256 fingerprint"
          />
          <button type="submit" disabled={!isSha256(hashInput)} className="btn-primary shrink-0">
            Look up <ArrowRight className="h-4 w-4" />
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
        <section className="card border-rose-500/30 bg-rose-500/[0.06]">
          <div className="flex items-start gap-4">
            <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-rose-500/15 text-rose-300">
              <Close className="h-6 w-6" />
            </span>
            <div>
              <h2 className="font-display text-2xl font-bold text-rose-200">Not registered</h2>
              <p className="mt-2 text-slate-300">
                {checkedFileName ? <>“{checkedFileName}” is</> : <>This fingerprint is</>} not on record. Either it
                was never registered, or the file has been changed. Changing even one character gives a completely
                different fingerprint.
              </p>
              <p className="mt-4 break-all font-mono text-xs text-slate-500">{hash}</p>
            </div>
          </div>
        </section>
      )}

      {match && latest && lookup.state === "done" && (
        <>
          <section className="card border-emerald-400/25">
            <div className="flex items-start gap-4">
              <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-emerald-400/15 text-emerald-300 shadow-[0_0_30px_-6px_rgba(52,211,153,0.6)]">
                <ShieldCheck className="h-6 w-6" />
              </span>
              <div>
                <h2 className="font-display text-2xl font-bold text-emerald-200">Registered</h2>
                <p className="mt-2 text-slate-300">
                  {checkedFileName ? <>“{checkedFileName}” matches</> : <>This fingerprint matches</>} version{" "}
                  {match.version} of “{match.title}”, recorded on the Internet Computer and unchanged since.
                </p>
              </div>
            </div>
            {latest.hash !== match.hash && (
              <div className="mt-5">
                <Alert kind="warning">
                  A newer version exists (version {latest.version}).{" "}
                  <Link to={`/verify/${latest.hash}`} className="font-semibold underline">
                    View the latest version
                  </Link>
                </Alert>
              </div>
            )}
            <div className="mt-8 grid gap-8 md:grid-cols-[1fr_auto]">
              <DocumentDetails document={match} />
              <ShareLink hash={match.hash} />
            </div>
          </section>

          <section className="card">
            <h2 className="mb-6 font-display text-2xl font-bold text-white">
              Version history{" "}
              <span className="text-base font-normal text-slate-400">
                ({lookup.versions.length} {lookup.versions.length === 1 ? "version" : "versions"})
              </span>
            </h2>
            <VersionTimeline versions={lookup.versions} current={match.hash} />
          </section>
        </>
      )}
    </div>
  );
};

export default VerifyPage;
