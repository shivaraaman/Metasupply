import React, { useState } from "react";
import { backendActor } from "../utils/backend";

const Upload: React.FC = () => {
  const [filename, setFilename] = useState("");
  const [model, setModel] = useState("");
  const [dataset, setDataset] = useState("");
  const [description, setDescription] = useState("");
  const [link, setLink] = useState("");
  const [generatedHash, setGeneratedHash] = useState<string | null>(null);
  const [uploadInfo, setUploadInfo] = useState<any>(null);

  async function generateHash(input: string): Promise<string> {
    const encoder = new TextEncoder();
    const data = encoder.encode(input);
    const hashBuffer = await crypto.subtle.digest("SHA-256", data);
    return Array.from(new Uint8Array(hashBuffer))
      .map(b => b.toString(16).padStart(2, "0"))
      .join("");
  }

  const handleUpload = async () => {
    try {
      const concat = filename + model + dataset + description + link;
      const hash = await generateHash(concat);
      setGeneratedHash(hash);

      await backendActor.upload_file({
        filename,
        model,
        dataset,
        hash,
        prompt: [description],         // since prompt is `opt text`
        previous_hash: [],            // no previous hash initially
      });

      setUploadInfo({
        filename,
        hash,
        creator: "You", // or your principal if available
        timestamp: new Date().toISOString(),
      });

    } catch (error) {
      console.error("Upload failed", error);
    }
  };

  return (
    <div className="space-y-2 p-4">
      <input placeholder="File Name" value={filename} onChange={e => setFilename(e.target.value)} />
      <input placeholder="Model" value={model} onChange={e => setModel(e.target.value)} />
      <input placeholder="Dataset" value={dataset} onChange={e => setDataset(e.target.value)} />
      <input placeholder="Link" value={link} onChange={e => setLink(e.target.value)} />
      <textarea placeholder="Description" value={description} onChange={e => setDescription(e.target.value)} />
      <button onClick={handleUpload} className="bg-green-500 text-white p-2 rounded">Upload</button>

      {generatedHash && (
        <div className="mt-2 border p-2 rounded">
          <p>✅ <strong>Hash:</strong> {generatedHash}</p>
          <p><strong>File Name:</strong> {uploadInfo?.filename}</p>
          <p><strong>Created at:</strong> {uploadInfo?.timestamp}</p>
          <p><strong>Creator:</strong> {uploadInfo?.creator}</p>
        </div>
      )}
    </div>
  );
};

export default Upload;
