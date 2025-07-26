import React, { useState } from "react";
import { useAuth } from "../contexts/AuthContext"; // Import auth context for backend actor and principal
import { uploadFile } from "../services/file"; // Import the file upload service
import { sha256 } from "js-sha256"; // For generating SHA-256 hashes
import LoadingSpinner from "../components/LoadingSpinner"; // Loading spinner component

const UploadPage: React.FC = () => {
  const { backendActor, isAuthenticated, principal } = useAuth(); // Get necessary auth state
  // State variables for form inputs
  const [filename, setFilename] = useState("");
  const [model, setModel] = useState("");
  const [dataset, setDataset] = useState("");
  const [prompt, setPrompt] = useState("");
  const [previousHash, setPreviousHash] = useState(""); // Optional field for linking versions
  // State variables for feedback messages
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false); // Loading state for the form submission

  // Handler for form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); // Prevent default form submission behavior
    setMessage(""); // Clear previous success messages
    setError(""); // Clear previous error messages
    setLoading(true); // Set loading state to true

    // Basic validation: ensure user is authenticated and backend actor is available
    if (!isAuthenticated || !backendActor || !principal) {
      setError("You must be logged in to upload files.");
      setLoading(false);
      return;
    }

    // Basic validation: ensure all required fields are filled
    if (!filename || !model || !dataset || !prompt) {
      setError("Please fill in all required fields.");
      setLoading(false);
      return;
    }

    try {
      // Generate SHA-256 hash of combined metadata for uniqueness.
      // Including principal ensures uniqueness across different users even for identical metadata.
      const combinedData = `${filename}-${model}-${dataset}-${prompt}-${principal.toText()}`;
      const fileId = sha256(combinedData);

      // Call the uploadFile service function to interact with the backend canister
      const result = await uploadFile(backendActor, {
        id: fileId,
        filename,
        model,
        dataset,
        prompt,
        previous_hash: previousHash || undefined, // Pass undefined if previousHash is an empty string
      });
      setMessage(result); // Display success message
      // Clear form fields after successful upload
      setFilename("");
      setModel("");
      setDataset("");
      setPrompt("");
      setPreviousHash("");
    } catch (err) {
      console.error("Upload error:", err);
      // Display error message to the user
      setError(`Failed to upload file: ${err instanceof Error ? err.message : String(err)}`);
    } finally {
      setLoading(false); // Always set loading to false after operation completes
    }
  };

  // Show loading spinner while submitting
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="bg-white p-8 rounded-lg shadow-xl max-w-2xl mx-auto mt-10">
      <h2 className="text-4xl font-extrabold text-gray-800 mb-8 text-center">
        Upload New File Metadata
      </h2>
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Filename Input */}
        <div>
          <label htmlFor="filename" className="block text-gray-700 text-sm font-bold mb-2">
            Filename:
          </label>
          <input
            type="text"
            id="filename"
            value={filename}
            onChange={(e) => setFilename(e.target.value)}
            className="shadow-sm appearance-none border rounded-md w-full py-3 px-4 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
            placeholder="e.g., my_research_paper.pdf"
            required
          />
        </div>
        {/* Model Input */}
        <div>
          <label htmlFor="model" className="block text-gray-700 text-sm font-bold mb-2">
            Model:
          </label>
          <input
            type="text"
            id="model"
            value={model}
            onChange={(e) => setModel(e.target.value)}
            className="shadow-sm appearance-none border rounded-md w-full py-3 px-4 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
            placeholder="e.g., GPT-4, Stable Diffusion v2"
            required
          />
        </div>
        {/* Dataset Input */}
        <div>
          <label htmlFor="dataset" className="block text-gray-700 text-sm font-bold mb-2">
            Dataset:
          </label>
          <input
            type="text"
            id="dataset"
            value={dataset}
            onChange={(e) => setDataset(e.target.value)}
            className="shadow-sm appearance-none border rounded-md w-full py-3 px-4 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
            placeholder="e.g., COCO, ImageNet, CustomDataV1"
            required
          />
        </div>
        {/* Prompt/Description Textarea */}
        <div>
          <label htmlFor="prompt" className="block text-gray-700 text-sm font-bold mb-2">
            Prompt/Description:
          </label>
          <textarea
            id="prompt"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            rows={4}
            className="shadow-sm appearance-none border rounded-md w-full py-3 px-4 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 resize-y"
            placeholder="Detailed description of the file or prompt used to generate it."
            required
          ></textarea>
        </div>
        {/* Previous Version Hash (Optional) */}
        <div>
          <label htmlFor="previousHash" className="block text-gray-700 text-sm font-bold mb-2">
            Previous Version Hash (Optional):
          </label>
          <input
            type="text"
            id="previousHash"
            value={previousHash}
            onChange={(e) => setPreviousHash(e.target.value)}
            className="shadow-sm appearance-none border rounded-md w-full py-3 px-4 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
            placeholder="Enter hash of previous version if updating"
          />
          <p className="text-xs text-gray-500 mt-1">
            If this is a new version of an existing file, enter the ID (hash) of the previous version.
          </p>
        </div>

        {/* Success and Error Messages */}
        {message && (
          <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative" role="alert">
            <strong className="font-bold">Success!</strong>
            <span className="block sm:inline ml-2">{message}</span>
          </div>
        )}
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
            <strong className="font-bold">Error!</strong>
            <span className="block sm:inline ml-2">{error}</span>
          </div>
        )}

        {/* Submit Button */}
        <button
          type="submit"
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-lg shadow-lg transition-all duration-300 ease-in-out transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
          disabled={loading} // Disable button while loading
        >
          {loading ? "Uploading..." : "Upload File Metadata"}
        </button>
      </form>
    </div>
  );
};

export default UploadPage;
