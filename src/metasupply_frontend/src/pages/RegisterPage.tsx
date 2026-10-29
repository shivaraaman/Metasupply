import React, { useEffect, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import {
  CONTENT_TYPES,
  DATASET_LICENSES,
  DATASET_LICENSE_LABELS,
  formatTimestamp,
  getDocument,
  getMyDocuments,
  groupIntoChains,
  registerDocument,
  type AiInfo,
  type ContentTypeName,
  type DatasetLicenseName,
  type DocumentRecord,
} from "../services/documents";
import FileDrop, { type HashedFile } from "../components/FileDrop";
import DocumentDetails from "../components/DocumentDetails";
import ShareLink from "../components/ShareLink";
import Alert from "../components/Alert";
import { ArrowRight, ShieldCheck, Sparkles } from "../components/icons";
import { inputClass, primaryButtonClass } from "../styles";

const withoutExtension = (name: string) => name.replace(/\.[^.]+$/, "");

const emptyAi: AiInfo = { model: "", tool: "", prompt: "", dataset: "", datasetLicense: "Unknown" };

const RegisterPage: React.FC = () => {
  const { actor } = useAuth();
  const [searchParams] = useSearchParams();
  const [latestVersions, setLatestVersions] = useState<DocumentRecord[]>([]);
  const [previousHash, setPreviousHash] = useState(searchParams.get("previous") ?? "");
  const [hashed, setHashed] = useState<HashedFile | null>(null);
  const [existing, setExisting] = useState<DocumentRecord | null>(null);
  const [title, setTitle] = useState("");
  const [author, setAuthor] = useState("");
  const [description, setDescription] = useState("");
  const [contentType, setContentType] = useState<ContentTypeName>("Document");
  const [usedAi, setUsedAi] = useState(false);
  const [ai, setAi] = useState<AiInfo>(emptyAi);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [registered, setRegistered] = useState<DocumentRecord | null>(null);

  // Only the newest version of each of the user's documents can receive an update.
  useEffect(() => {
    if (!actor) return;
    getMyDocuments(actor)
      .then((docs) => setLatestVersions(groupIntoChains(docs).map((chain) => chain[chain.length - 1])))
      .catch((err) => setError(err.message));
  }, [actor]);

  const previous = useMemo(
    () => latestVersions.find((d) => d.hash === previousHash),
    [latestVersions, previousHash]
  );

  // A new version usually keeps the author, content type and AI details of the one it replaces.
  useEffect(() => {
    if (!previous) return;
    setAuthor((current) => current || previous.author);
    setContentType(previous.content_type);
    setUsedAi(Boolean(previous.ai));
    setAi(previous.ai ?? emptyAi);
  }, [previous]);

  const updateAi = (field: keyof AiInfo) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
      setAi({ ...ai, [field]: e.target.value });

  const handleHashed = async (result: HashedFile | null) => {
    setHashed(result);
    setExisting(null);
    setError("");
    if (!result) return;
    if (!title) setTitle(withoutExtension(result.file.name));
    if (actor) {
      try {
        setExisting((await getDocument(actor, result.hash)) ?? null);
      } catch (err) {
        setError(err instanceof Error ? err.message : String(err));
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!actor || !hashed) return;
    setSubmitting(true);
    setError("");
    try {
      const outcome = await registerDocument(actor, {
        hash: hashed.hash,
        title,
        author,
        description,
        fileName: hashed.file.name,
        fileSize: hashed.file.size,
        contentType,
        ai: usedAi ? ai : undefined,
        previousHash: previousHash || undefined,
      });
      if (outcome.kind === "registered") {
        setRegistered(outcome.document);
      } else {
        setExisting(outcome.document);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setSubmitting(false);
    }
  };

  const reset = () => {
    setRegistered(null);
    setHashed(null);
    setExisting(null);
    setTitle("");
    setDescription("");
    setContentType("Document");
    setUsedAi(false);
    setAi(emptyAi);
    setPreviousHash("");
  };

  if (registered) {
    return (
      <div className="card mx-auto max-w-5xl border-emerald-400/25">
        <div className="flex items-start gap-4">
          <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-emerald-400/15 text-emerald-300 shadow-[0_0_30px_-6px_rgba(52,211,153,0.6)]">
            <ShieldCheck className="h-6 w-6" />
          </span>
          <div>
            <h1 className="font-display text-3xl font-bold text-emerald-200">Sealed on-chain</h1>
            <p className="mt-2 text-slate-300">
              The fingerprint of “{registered.file_name}” is now permanently recorded on the Internet Computer. Keep the
              original file safe: it is the only file that will match this record.
            </p>
          </div>
        </div>
        <div className="mt-8 grid gap-8 md:grid-cols-[1fr_auto]">
          <DocumentDetails document={registered} />
          <ShareLink hash={registered.hash} />
        </div>
        <div className="mt-8 flex flex-wrap gap-3">
          <Link to={`/verify/${registered.hash}`} className="btn-primary">
            Open verification page <ArrowRight className="h-4 w-4" />
          </Link>
          <button onClick={reset} className="btn-ghost">
            Register another file
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl">
      <p className="eyebrow">Register</p>
      <h1 className="mt-3 font-display text-4xl font-bold tracking-tight text-white">Seal your work</h1>
      <p className="mt-3 text-slate-400">
        Records the file's fingerprint with the current date and time. Records can't be edited or deleted afterwards,
        so check the details before you submit.
      </p>

      <form onSubmit={handleSubmit} className="mt-8 space-y-6">
        <section className="card space-y-6">
          <h2 className="font-display text-lg font-semibold text-white">1 · The file</h2>
          <div>
            <label htmlFor="previous" className="label">Is this an update of a document you registered before?</label>
            <select
              id="previous"
              value={previousHash}
              onChange={(e) => setPreviousHash(e.target.value)}
              className={inputClass}
            >
              <option value="">No, this is a new document</option>
              {latestVersions.map((doc) => (
                <option key={doc.hash} value={doc.hash}>
                  Yes, new version of “{doc.title}” (currently version {doc.version})
                </option>
              ))}
            </select>
            {previousHash && !previous && latestVersions.length > 0 && (
              <p className="mt-2 text-sm text-rose-300">
                That document is not one of your latest versions, so it cannot be updated from here.
              </p>
            )}
          </div>

          <FileDrop onHashed={handleHashed} prompt="Choose the file to register, or drag it here" />

          {hashed && <p className="-mt-3 break-all font-mono text-xs text-brand-cyan">SHA-256: {hashed.hash}</p>}

          {existing && (
            <Alert kind="warning">
              This exact file was already registered on {formatTimestamp(existing.registered_at)} as “
              {existing.title}”.{" "}
              <Link to={`/verify/${existing.hash}`} className="font-semibold underline">
                View the record
              </Link>
            </Alert>
          )}
        </section>

        <section className="card space-y-6">
          <h2 className="font-display text-lg font-semibold text-white">2 · About it</h2>
          <div className="grid gap-6 sm:grid-cols-2">
            <div>
              <label htmlFor="title" className="label">Title</label>
              <input id="title" type="text" value={title} onChange={(e) => setTitle(e.target.value)}
                className={inputClass} maxLength={200} required placeholder="e.g., Research paper on solar cells" />
            </div>
            <div>
              <label htmlFor="author" className="label">Author</label>
              <input id="author" type="text" value={author} onChange={(e) => setAuthor(e.target.value)}
                className={inputClass} maxLength={100} required placeholder="Your name or organization" />
            </div>
          </div>
          <div>
            <label htmlFor="description" className="label">
              Description <span className="font-normal text-slate-500">(optional)</span>
            </label>
            <textarea id="description" value={description} onChange={(e) => setDescription(e.target.value)}
              rows={3} maxLength={2000} className={`${inputClass} resize-y`}
              placeholder={previousHash ? "What changed in this version?" : "What is this document?"} />
          </div>
          <div>
            <label htmlFor="contentType" className="label">Content type</label>
            <select id="contentType" value={contentType}
              onChange={(e) => setContentType(e.target.value as ContentTypeName)}
              className={inputClass}>
              {CONTENT_TYPES.map((type) => <option key={type} value={type}>{type}</option>)}
            </select>
          </div>
        </section>

        <section
          className={`card space-y-6 transition-colors ${usedAi ? "border-fuchsia-400/25 bg-gradient-to-br from-brand-violet/[0.08] to-brand-magenta/[0.06]" : ""}`}
        >
          <label className="flex cursor-pointer items-center justify-between gap-4">
            <span className="flex items-center gap-3">
              <Sparkles className="h-5 w-5 text-fuchsia-300" />
              <span className="font-display text-lg font-semibold text-white">3 · Generated with AI?</span>
            </span>
            <span className="relative inline-flex">
              <input type="checkbox" checked={usedAi} onChange={(e) => setUsedAi(e.target.checked)} className="peer sr-only" />
              <span className="h-7 w-12 rounded-full bg-white/10 transition-colors peer-checked:bg-gradient-to-r peer-checked:from-brand-violet peer-checked:to-brand-magenta peer-focus-visible:ring-2 peer-focus-visible:ring-brand-cyan" />
              <span className="absolute left-1 top-1 h-5 w-5 rounded-full bg-white transition-transform peer-checked:translate-x-5" />
            </span>
          </label>
          {usedAi ? (
            <>
              <p className="text-sm text-slate-400">
                These details are recorded with the file so anyone can see how it was made.
              </p>
              <div className="grid gap-6 sm:grid-cols-2">
                <div>
                  <label htmlFor="aiModel" className="label">AI model</label>
                  <input id="aiModel" type="text" value={ai.model} onChange={updateAi("model")} required
                    maxLength={128} className={inputClass} placeholder="e.g., GPT-4o, Stable Diffusion XL" />
                </div>
                <div>
                  <label htmlFor="aiTool" className="label">
                    Generation tool <span className="font-normal text-slate-500">(optional)</span>
                  </label>
                  <input id="aiTool" type="text" value={ai.tool} onChange={updateAi("tool")}
                    maxLength={128} className={inputClass} placeholder="e.g., ChatGPT, Midjourney, ComfyUI" />
                </div>
              </div>
              <div>
                <label htmlFor="aiPrompt" className="label">
                  Prompt <span className="font-normal text-slate-500">(optional)</span>
                </label>
                <textarea id="aiPrompt" value={ai.prompt} onChange={updateAi("prompt")} rows={3}
                  maxLength={4000} className={`${inputClass} resize-y`} placeholder="The prompt used to generate it" />
              </div>
              <div className="grid gap-6 sm:grid-cols-2">
                <div>
                  <label htmlFor="aiDataset" className="label">
                    Training dataset <span className="font-normal text-slate-500">(optional)</span>
                  </label>
                  <input id="aiDataset" type="text" value={ai.dataset} onChange={updateAi("dataset")}
                    maxLength={200} className={inputClass} placeholder="e.g., LAION-5B, company archive" />
                </div>
                <div>
                  <label htmlFor="aiLicense" className="label">Dataset licence</label>
                  <select id="aiLicense" value={ai.datasetLicense}
                    onChange={(e) => setAi({ ...ai, datasetLicense: e.target.value as DatasetLicenseName })}
                    className={inputClass}>
                    {DATASET_LICENSES.map((license) => (
                      <option key={license} value={license}>{DATASET_LICENSE_LABELS[license]}</option>
                    ))}
                  </select>
                </div>
              </div>
            </>
          ) : (
            <p className="text-sm text-slate-400">
              Turn this on to record the AI model, tool, prompt and training data used to make this content.
            </p>
          )}
        </section>

        {error && <Alert kind="error">{error}</Alert>}

        <button
          type="submit"
          className={primaryButtonClass}
          disabled={!hashed || !!existing || submitting || (!!previousHash && !previous)}
        >
          {submitting ? "Sealing on-chain…" : "Register permanently"}
        </button>
      </form>
    </div>
  );
};

export default RegisterPage;
