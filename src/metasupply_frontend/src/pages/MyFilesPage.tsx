// metasupply/src/metasupply_frontend/src/pages/MyFilesPage.tsx

import React, { useEffect, useState, useMemo } from "react";
import { useAuth } from "../contexts/AuthContext"; // Import auth context
import { getAllFiles, uploadFile } from "../services/file"; // Import file services
import { FileMetadata } from "../types"; // Import type definition
import QRCodeDisplay from "../components/QRCodeDisplay"; // QR code display component
import LoadingSpinner from "../components/LoadingSpinner"; // Loading spinner component
import { sha256 } from "js-sha256"; // For generating SHA-256 hashes

const MyFilesPage: React.FC = () => {
  const { backendActor, isAuthenticated, principal, isAuthReady } = useAuth();
  const [files, setFiles] = useState<FileMetadata[]>([]); // State to store fetched files
  const [loading, setLoading] = useState(true); // Loading state for initial fetch
  const [error, setError] = useState(""); // Error message state
  const [selectedFileForQR, setSelectedFileForQR] = useState<FileMetadata | null>(null); // State for QR modal
  const [editingFile, setEditingFile] = useState<FileMetadata | null>(null); // State for update modal
  const [newModel, setNewModel] = useState(""); // State for new model input in update modal
  const [updateMessage, setUpdateMessage] = useState(""); // Success message for update
  const [updateError, setUpdateError] = useState(""); // Error message for update
  const [updateLoading, setUpdateLoading] = useState(false); // Loading state for update submission

  // Function to fetch all files for the current user
  const fetchFiles = async () => {
    // Only fetch if authenticated and actor is ready
    if (!isAuthenticated || !backendActor || !isAuthReady) {
      setLoading(false);
      return;
    }

    setLoading(true); // Set loading true before fetching
    setError(""); // Clear any previous errors
    try {
      const userFiles = await getAllFiles(backendActor);
      // Sort files by timestamp in descending order (most recent first)
      userFiles.sort((a, b) => Number(b.timestamp - a.timestamp));
      setFiles(userFiles);
    } catch (err) {
      console.error("Error fetching files:", err);
      setError(`Failed to fetch your files: ${err instanceof Error ? err.message : String(err)}`);
    } finally {
      setLoading(false); // Set loading false after fetch completes
    }
  };

  // Effect hook to run fetchFiles when authentication state changes or actor becomes available
  useEffect(() => {
    if (isAuthReady && isAuthenticated) {
      fetchFiles();
    } else if (isAuthReady && !isAuthenticated) {
      setLoading(false);
      setError("Please log in to view your files.");
    }
  }, [isAuthenticated, backendActor, isAuthReady]); // Dependencies for the effect

  // Handler for opening the update model modal
  const handleUpdateClick = (file: FileMetadata) => {
    setEditingFile(file); // Set the file to be edited
    setNewModel(file.model); // Pre-fill the new model input with the current model
    setUpdateMessage(""); // Clear previous messages
    setUpdateError("");
  };

  // Handler for submitting the model update
  const handleUpdateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // Ensure we have a file to edit, backend actor, and principal
    if (!editingFile || !backendActor || !principal) return;

    setUpdateLoading(true); // Set update loading state
    setUpdateMessage(""); // Clear previous messages
    setUpdateError("");

    try {
      // Create a new ID for the updated version.
      // Include current timestamp to ensure uniqueness for subsequent updates of the same file.
      const combinedData = `${editingFile.filename}-${newModel}-${editingFile.dataset}-${editingFile.prompt}-${principal.toText()}-${Date.now()}`;
      const newFileId = sha256(combinedData);

      // Call uploadFile to create a new version of the file
      const result = await uploadFile(backendActor, {
        id: newFileId,
        filename: editingFile.filename,
        model: newModel, // The updated model
        dataset: editingFile.dataset,
        prompt: editingFile.prompt,
        previous_hash: editingFile.id, // Link to the current file's ID as the previous version
      });
      setUpdateMessage(result); // Display success message
      setEditingFile(null); // Close the edit form
      setNewModel(""); // Clear new model input
      fetchFiles(); // Re-fetch files to show the newly created version
    } catch (err) {
      console.error("Update error:", err);
      setUpdateError(`Failed to update file: ${err instanceof Error ? err.message : String(err)}`);
    } finally {
      setUpdateLoading(false); // Always set update loading to false
    }
  };

  // Function to close any open modals (QR or Update)
  const closeModal = () => {
    setSelectedFileForQR(null);
    setEditingFile(null);
  };

  // Memoize grouped files for efficient rendering.
  // This groups different versions of the same logical file together.
  const groupedFiles = useMemo(() => {
    const groups: { [key: string]: FileMetadata[] } = {};
    files.forEach(file => {
      // Use filename + creator as a base for grouping versions
      const groupKey = `${file.filename}-${file.creator.toText()}`;
      if (!groups[groupKey]) {
        groups[groupKey] = [];
      }
      groups[groupKey].push(file);
    });

    // Sort versions within each group by timestamp (most recent first)
    for (const key in groups) {
      groups[key].sort((a, b) => Number(b.timestamp - a.timestamp));
    }
    return groups;
  }, [files]); // Recalculate when `files` state changes


  // Conditional rendering based on loading, error, or authentication state
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <LoadingSpinner />
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative max-w-lg mx-auto mt-10" role="alert">
        <strong className="font-bold">Error!</strong>
        <span className="block sm:inline ml-2">{error}</span>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="text-center py-20">
        <h2 className="text-3xl font-bold text-gray-800 mb-4">Access Denied</h2>
        <p className="text-lg text-gray-600">Please log in to view your uploaded files.</p>
      </div>
    );
  }

  return (
    <div className="bg-white p-8 rounded-lg shadow-xl max-w-5xl mx-auto mt-10">
      <h2 className="text-4xl font-extrabold text-gray-800 mb-8 text-center">
        My Uploaded Files
      </h2>

      {Object.keys(groupedFiles).length === 0 ? (
        <p className="text-center text-gray-600 text-lg">
          You haven't uploaded any files yet. Go to the <a href="/upload" className="text-blue-600 hover:underline">Upload page</a> to add your first file.
        </p>
      ) : (
        <div className="space-y-8">
          {/* Iterate through each grouped file (original filename + creator) */}
          {Object.entries(groupedFiles).map(([groupKey, versions]) => (
            <div key={groupKey} className="border border-gray-200 rounded-lg p-6 bg-gray-50 shadow-sm">
              <h3 className="text-2xl font-bold text-gray-700 mb-4">
                {versions[0].filename} <span className="text-base text-gray-500 font-normal">by {versions[0].creator.toText().substring(0, 8)}...</span>
              </h3>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-100">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider rounded-tl-lg">Version ID (Hash)</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Model</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Dataset</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Prompt</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Timestamp</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Previous Hash</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider rounded-tr-lg">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {/* Iterate through each version within the group */}
                    {versions.map((file) => (
                      <tr key={file.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900 font-mono">
                          {file.id.substring(0, 10)}... {/* Display truncated hash */}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                          {file.model}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                          {file.dataset}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-900 max-w-xs truncate">
                          {file.prompt}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                          {/* Convert nanoseconds timestamp to readable date */}
                          {new Date(Number(file.timestamp / 1_000_000n)).toLocaleString()}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500 font-mono">
                          {file.previous_hash ? `${file.previous_hash.substring(0, 10)}...` : "N/A"}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm font-medium">
                          <div className="flex space-x-2">
                            <button
                              onClick={() => handleUpdateClick(file)}
                              className="text-blue-600 hover:text-blue-900 transition-colors py-1 px-3 rounded-md bg-blue-100 hover:bg-blue-200"
                            >
                              Update Model
                            </button>
                            <button
                              onClick={() => setSelectedFileForQR(file)}
                              className="text-purple-600 hover:text-purple-900 transition-colors py-1 px-3 rounded-md bg-purple-100 hover:bg-purple-200"
                            >
                              Show QR
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* QR Code Modal */}
      {selectedFileForQR && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-75 flex items-center justify-center p-4 z-50">
          <div className="bg-white p-8 rounded-lg shadow-2xl relative max-w-md w-full">
            <button
              onClick={closeModal}
              className="absolute top-3 right-3 text-gray-500 hover:text-gray-800 text-2xl font-bold"
            >
              &times;
            </button>
            <h3 className="text-2xl font-bold text-gray-800 mb-4 text-center">QR Code for File</h3>
            <p className="text-center text-gray-600 mb-4 break-all">
              <span className="font-semibold">Filename:</span> {selectedFileForQR.filename}
              <br />
              <span className="font-semibold">Version ID:</span> {selectedFileForQR.id}
            </p>
            {/* Display the QR code, encoding the entire file metadata object as a JSON string */}
            <QRCodeDisplay value={JSON.stringify(selectedFileForQR)} size={256} />
            <p className="text-sm text-gray-500 mt-4 text-center">
              Scan this QR code to get the file metadata.
            </p>
          </div>
        </div>
      )}

      {/* Update Model Modal */}
      {editingFile && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-75 flex items-center justify-center p-4 z-50">
          <div className="bg-white p-8 rounded-lg shadow-2xl relative max-w-md w-full">
            <button
              onClick={closeModal}
              className="absolute top-3 right-3 text-gray-500 hover:text-gray-800 text-2xl font-bold"
            >
              &times;
            </button>
            <h3 className="text-2xl font-bold text-gray-800 mb-4 text-center">
              Update Model for "{editingFile.filename}"
            </h3>
            <p className="text-center text-gray-600 mb-4 text-sm">
              This will create a new version of the file with the updated model.
            </p>
            <form onSubmit={handleUpdateSubmit} className="space-y-4">
              <div>
                <label htmlFor="newModel" className="block text-gray-700 text-sm font-bold mb-2">
                  New Model:
                </label>
                <input
                  type="text"
                  id="newModel"
                  value={newModel}
                  onChange={(e) => setNewModel(e.target.value)}
                  className="shadow-sm appearance-none border rounded-md w-full py-3 px-4 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                  required
                />
              </div>
              {updateMessage && (
                <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative" role="alert">
                  {updateMessage}
                </div>
              )}
              {updateError && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
                  {updateError}
                </div>
              )}
              <button
                type="submit"
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-lg shadow-lg transition-all duration-300 ease-in-out transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={updateLoading}
              >
                {updateLoading ? "Updating..." : "Create New Version"}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyFilesPage;
