import React, { useRef, useState } from "react";
import { formatBytes, hashFile } from "../services/documents";

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
        className={`w-full border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
          dragging ? "border-blue-500 bg-blue-50" : "border-gray-300 hover:border-blue-400 bg-gray-50"
        }`}
      >
        {file ? (
          <>
            <p className="font-semibold text-gray-800 break-all">{file.name}</p>
            <p className="text-sm text-gray-500 mt-1">
              {formatBytes(file.size)} · {hashing ? "Computing fingerprint…" : "Click to choose a different file"}
            </p>
          </>
        ) : (
          <>
            <p className="font-semibold text-gray-700">{prompt}</p>
            <p className="text-sm text-gray-500 mt-1">
              The file stays on your computer. Only its SHA-256 fingerprint is used.
            </p>
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
      {error && <p className="text-sm text-red-600 mt-2">{error}</p>}
    </div>
  );
};

export default FileDrop;
