import React, { useEffect, useState } from "react";
import { backendActor } from "../utils/backend";

interface FileRecord {
  filename: string;
  model: string;
  dataset: string;
  prompt: string | null;
  timestamp: bigint;
  creator: string;
  previous_hash: string | null;
}

const MyFiles: React.FC = () => {
  const [files, setFiles] = useState<FileRecord[]>([]);
  const [newModel, setNewModel] = useState("");

  const fetchFiles = async () => {
    try {
      // Replace with actual backend method if you have `get_all_files`
      const res: unknown = await backendActor.get_all_files();
      if (Array.isArray(res)) {
        setFiles(res as FileRecord[]);
      } else {
        console.error("Unexpected files format", res);
      }
    } catch (e) {
      console.error("Failed to load files", e);
    }
  };

  useEffect(() => {
    fetchFiles();
  }, []);

  const handleUpdate = async (file: FileRecord) => {
    try {
      const concat = file.filename + newModel + file.dataset + (file.prompt ?? "");
      const encoder = new TextEncoder();
      const hashBuffer = await crypto.subtle.digest("SHA-256", encoder.encode(concat));
      const newHash = Array.from(new Uint8Array(hashBuffer)).map(b => b.toString(16).padStart(2, "0")).join("");

      await backendActor.upload_file({
        filename: file.filename,
        model: newModel,
        dataset: file.dataset,
        hash: newHash,
        prompt: file.prompt ? [file.prompt] : [],
        previous_hash: file.previous_hash ? [file.previous_hash] : [],
      });
      fetchFiles();
    } catch (e) {
      console.error("Update failed", e);
    }
  };

  return (
    <div className="space-y-4 p-4">
      <h2 className="text-xl font-semibold">My Files</h2>
      {files.map((file, idx) => (
        <div key={idx} className="border p-2 rounded">
          <p><strong>Name:</strong> {file.filename}</p>
          <p><strong>Model:</strong> {file.model}</p>
          <p><strong>Dataset:</strong> {file.dataset}</p>
          <p><strong>Prompt:</strong> {file.prompt}</p>
          <p><strong>Previous Hash:</strong> {file.previous_hash}</p>
          <p><strong>Creator:</strong> {file.creator}</p>
          <p><strong>Time:</strong> {file.timestamp.toString()}</p>
          <input placeholder="New Model" value={newModel} onChange={e => setNewModel(e.target.value)} />
          <button onClick={() => handleUpdate(file)} className="bg-blue-500 text-white p-1 mt-2 rounded">Update File</button>
        </div>
      ))}
    </div>
  );
};

export default MyFiles;
