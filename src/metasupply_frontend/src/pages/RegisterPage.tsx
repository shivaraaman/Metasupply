import React, { useEffect, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import {
  formatTimestamp,
  getDocument,
  getMyDocuments,
  groupIntoChains,
  registerDocument,
  type DocumentRecord,
} from "../services/documents";
import FileDrop, { type HashedFile } from "../components/FileDrop";
import DocumentDetails from "../components/DocumentDetails";
import ShareLink from "../components/ShareLink";
import Alert from "../components/Alert";
import { inputClass, primaryButtonClass } from "../styles";

const withoutExtension = (name: string) => name.replace(/\.[^.]+$/, "");

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

  useEffect(() => {
    if (previous && !author) setAuthor(previous.author);
  }, [previous, author]);

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
    setPreviousHash("");
  };

  if (registered) {
    return (
      <div className="bg-white p-8 rounded-lg shadow-xl max-w-4xl mx-auto mt-6 border-l-8 border-green-500">
        <h2 className="text-3xl font-extrabold text-green-700 mb-2">Registered</h2>
        <p className="text-gray-700 mb-6">
          The fingerprint of “{registered.file_name}” is now permanently recorded on the Internet Computer. Keep the
          original file safe: it is the only file that will match this record.
        </p>
        <div className="grid md:grid-cols-3 gap-8">
          <div className="md:col-span-2">
            <DocumentDetails document={registered} />
          </div>
          <ShareLink hash={registered.hash} />
        </div>
        <div className="flex flex-wrap gap-3 mt-8">
          <Link to={`/verify/${registered.hash}`} className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-md">
            Open verification page
          </Link>
          <button onClick={reset} className="bg-gray-100 hover:bg-gray-200 text-gray-800 font-semibold py-2 px-4 rounded-md">
            Register another file
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white p-8 rounded-lg shadow-xl max-w-2xl mx-auto mt-6">
      <h2 className="text-3xl font-extrabold text-gray-800 mb-2">Register a document</h2>
      <p className="text-gray-600 mb-6">
        Records the file's fingerprint with the current date and time. Records cannot be edited or deleted
        afterwards, so check the details before you submit.
      </p>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label htmlFor="previous" className="block text-gray-700 text-sm font-bold mb-2">
            Is this an update of a document you registered before?
          </label>
          <select
            id="previous"
            value={previousHash}
            onChange={(e) => setPreviousHash(e.target.value)}
            className={`${inputClass} bg-white`}
          >
            <option value="">No, this is a new document</option>
            {latestVersions.map((doc) => (
              <option key={doc.hash} value={doc.hash}>
                Yes, new version of “{doc.title}” (currently version {doc.version})
              </option>
            ))}
          </select>
          {previousHash && !previous && latestVersions.length > 0 && (
            <p className="text-sm text-red-600 mt-1">
              That document is not one of your latest versions, so it cannot be updated from here.
            </p>
          )}
        </div>

        <FileDrop onHashed={handleHashed} prompt="Choose the file to register, or drag it here" />

        {hashed && (
          <p className="text-xs text-gray-500 font-mono break-all -mt-3">SHA-256: {hashed.hash}</p>
        )}

        {existing && (
          <Alert kind="warning">
            This exact file was already registered on {formatTimestamp(existing.registered_at)} as “
            {existing.title}”.{" "}
            <Link to={`/verify/${existing.hash}`} className="underline font-semibold">
              View the record
            </Link>
          </Alert>
        )}

        <div>
          <label htmlFor="title" className="block text-gray-700 text-sm font-bold mb-2">Title</label>
          <input id="title" type="text" value={title} onChange={(e) => setTitle(e.target.value)}
            className={inputClass} maxLength={200} required placeholder="e.g., Research paper on solar cells" />
        </div>
        <div>
          <label htmlFor="author" className="block text-gray-700 text-sm font-bold mb-2">Author</label>
          <input id="author" type="text" value={author} onChange={(e) => setAuthor(e.target.value)}
            className={inputClass} maxLength={100} required placeholder="Your name or organization" />
        </div>
        <div>
          <label htmlFor="description" className="block text-gray-700 text-sm font-bold mb-2">
            Description <span className="font-normal text-gray-500">(optional)</span>
          </label>
          <textarea id="description" value={description} onChange={(e) => setDescription(e.target.value)}
            rows={3} maxLength={2000} className={`${inputClass} resize-y`}
            placeholder={previousHash ? "What changed in this version?" : "What is this document?"} />
        </div>

        {error && <Alert kind="error">{error}</Alert>}

        <button
          type="submit"
          className={primaryButtonClass}
          disabled={!hashed || !!existing || submitting || (!!previousHash && !previous)}
        >
          {submitting ? "Registering…" : "Register permanently"}
        </button>
      </form>
    </div>
  );
};

export default RegisterPage;
