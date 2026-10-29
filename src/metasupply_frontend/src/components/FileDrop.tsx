import React, { useRef, useState } from "react";
import { formatBytes, hashFile } from "../services/documents";
import { FileCheck, Upload } from "./icons";

export interface HashedFile {
  file: File;
  hash: string;
}

interface FileDropProps {
  onHashed: (result: HashedFile | null) => void;
  prompt?: string;
}

/** Lets the user pick or drop a file and computes its SHA-256 locally. */
const FileDrop: React.FC<FileDropProps> = ({ onHashed, prompt = "Choose a file or drag it here" }) => {
  const input = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [hashing, setHashing] = useState(false);
  const [error, setError] = useState("");

  const handleFile = async (picked: File | undefined) => {
    if (!picked) return;
    setFile(picked);
    setError("");
    setHashing(true);
    onHashed(null);
    try {
      onHashed({ file: picked, hash: await hashFile(picked) });
    } catch (err) {
      setError(`Could not read this file: ${err instanceof Error ? err.message : String(err)}`);
    } finally {
      setHashing(false);
    }
  };

  return (
    <div>
      <button
        type="button"
        onClick={() => input.current?.click()}
        onDragOver={(e) => {
          e.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragging(false);
          handleFile(e.dataTransfer.files[0]);
        }}
        className={`group relative w-full overflow-hidden rounded-2xl border-2 border-dashed p-8 text-center transition-all duration-300 ${
          dragging
            ? "scale-[1.01] border-brand-cyan bg-brand-cyan/10"
            : "border-white/15 bg-white/[0.02] hover:border-brand-violet/60 hover:bg-brand-violet/[0.06]"
        }`}
      >
        {hashing && (
          <span className="absolute inset-x-0 h-0.5 animate-scan bg-gradient-to-r from-transparent via-brand-cyan to-transparent" />
        )}
        <span
          className={`mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-brand-cyan/20 to-brand-magenta/20 text-white transition-transform duration-300 group-hover:-translate-y-1 ${
            dragging ? "-translate-y-1" : ""
          }`}
        >
          {file && !hashing ? <FileCheck className="h-6 w-6" /> : <Upload className="h-6 w-6" />}
        </span>
        {file ? (
          <>
            <p className="break-all font-semibold text-white">{file.name}</p>
            <p className="mt-1 text-sm text-slate-400">
              {formatBytes(file.size)} · {hashing ? "Computing fingerprint…" : "Click to choose a different file"}
            </p>
          </>
        ) : (
          <>
            <p className="font-semibold text-white">{prompt}</p>
            <p className="mt-1 text-sm text-slate-400">The file stays on your device. Only its fingerprint is used.</p>
          </>
        )}
      </button>
      <input
        ref={input}
        type="file"
        className="hidden"
        onChange={(e) => {
          handleFile(e.target.files?.[0]);
          e.target.value = "";
        }}
      />
      {error && <p className="mt-2 text-sm text-rose-300">{error}</p>}
    </div>
  );
};

export default FileDrop;
