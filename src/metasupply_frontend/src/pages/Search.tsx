import React, { useState } from "react";
import { backendActor } from "../utils/backend";

interface FileDetail {
  filename: string;
  model: string;
  dataset: string;
  prompt: string | null;
  timestamp: bigint;
  creator: string;
  previous_hash: string | null;
}

const Search: React.FC = () => {
  const [hash, setHash] = useState("");
  const [result, setResult] = useState<FileDetail | null>(null);

  const handleSearch = async () => {
    try {
      const res: unknown = await backendActor.search_file(hash);
      if (res && typeof res === "object" && "filename" in res) {
        setResult(res as FileDetail);
      } else {
        console.log("No file found or wrong format");
        setResult(null);
      }
    } catch (e) {
      console.error("Search failed", e);
    }
  };

  return (
    <div className="space-y-2 p-4">
      <input placeholder="Enter hash" value={hash} onChange={e => setHash(e.target.value)} />
      <button onClick={handleSearch} className="bg-purple-500 text-white p-2 rounded">Search</button>

      {result && (
        <div className="border p-2 rounded mt-2">
          <p><strong>Name:</strong> {result.filename}</p>
          <p><strong>Model:</strong> {result.model}</p>
          <p><strong>Dataset:</strong> {result.dataset}</p>
          <p><strong>Prompt:</strong> {result.prompt}</p>
          <p><strong>Creator:</strong> {result.creator}</p>
          <p><strong>Time:</strong> {result.timestamp.toString()}</p>
          <p><strong>Previous Hash:</strong> {result.previous_hash}</p>
        </div>
      )}
    </div>
  );
};

export default Search;
