import React, { useState } from "react";
import { sha256 } from "js-sha256";
import { useAuth } from "../contexts/AuthContext";
import { uploadFile } from "../services/file";
import Alert from "../components/Alert";
import { inputClass, primaryButtonClass } from "../styles";

const emptyForm = { filename: "", model: "", dataset: "", prompt: "", previousHash: "" };

const UploadPage: React.FC = () => {
  const { backendActor, principal } = useAuth();
  const [form, setForm] = useState(emptyForm);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const update = (field: keyof typeof emptyForm) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      setForm({ ...form, [field]: e.target.value });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage("");
    setError("");

    if (!backendActor || !principal) {
      setError("The backend is not available. Please log in again.");
      return;
    }

    const filename = form.filename.trim();
    const model = form.model.trim();
    const dataset = form.dataset.trim();
    const prompt = form.prompt.trim();
    if (!filename || !model || !dataset || !prompt) {
      setError("Please fill in all required fields.");
      return;
    }

    setLoading(true);
    try {
      // Including the principal keeps IDs unique across users even for identical metadata.
      const id = sha256(`${filename}-${model}-${dataset}-${prompt}-${principal.toText()}`);
      const result = await uploadFile(backendActor, {
        id,
        filename,
        model,
        dataset,
        prompt,
        previous_hash: form.previousHash.trim() || undefined,
      });
      setMessage(result);
      setForm(emptyForm);
    } catch (err) {
      setError(`Failed to upload file: ${err instanceof Error ? err.message : String(err)}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white p-8 rounded-lg shadow-xl max-w-2xl mx-auto mt-10">
      <h2 className="text-4xl font-extrabold text-gray-800 mb-8 text-center">Upload New File Metadata</h2>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label htmlFor="filename" className="block text-gray-700 text-sm font-bold mb-2">Filename:</label>
          <input id="filename" type="text" value={form.filename} onChange={update("filename")}
            className={inputClass} placeholder="e.g., my_research_paper.pdf" maxLength={256} required />
        </div>
        <div>
          <label htmlFor="model" className="block text-gray-700 text-sm font-bold mb-2">Model:</label>
          <input id="model" type="text" value={form.model} onChange={update("model")}
            className={inputClass} placeholder="e.g., GPT-4, Stable Diffusion v2" maxLength={128} required />
        </div>
        <div>
          <label htmlFor="dataset" className="block text-gray-700 text-sm font-bold mb-2">Dataset:</label>
          <input id="dataset" type="text" value={form.dataset} onChange={update("dataset")}
            className={inputClass} placeholder="e.g., COCO, ImageNet, CustomDataV1" maxLength={128} required />
        </div>
        <div>
          <label htmlFor="prompt" className="block text-gray-700 text-sm font-bold mb-2">Prompt/Description:</label>
          <textarea id="prompt" value={form.prompt} onChange={update("prompt")} rows={4}
            className={`${inputClass} resize-y`} maxLength={2048} required
            placeholder="Detailed description of the file or prompt used to generate it." />
        </div>
        <div>
          <label htmlFor="previousHash" className="block text-gray-700 text-sm font-bold mb-2">
            Previous Version Hash (Optional):
          </label>
          <input id="previousHash" type="text" value={form.previousHash} onChange={update("previousHash")}
            className={inputClass} placeholder="Enter hash of previous version if updating" maxLength={128} />
          <p className="text-xs text-gray-500 mt-1">
            If this is a new version of an existing file, enter the ID (hash) of the previous version.
          </p>
        </div>

        {message && <Alert kind="success"><strong>Success!</strong> {message}</Alert>}
        {error && <Alert kind="error"><strong>Error!</strong> {error}</Alert>}

        <button type="submit" className={primaryButtonClass} disabled={loading}>
          {loading ? "Uploading..." : "Upload File Metadata"}
        </button>
      </form>
    </div>
  );
};

export default UploadPage;
