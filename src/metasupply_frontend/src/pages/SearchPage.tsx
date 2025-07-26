// metasupply/src/metasupply_frontend/src/pages/SearchPage.tsx

import React, { useState, useEffect, useMemo } from "react";
import { useAuth } from "../contexts/AuthContext"; // Import auth context
import { getAllFiles } from "../services/file"; // Import file service
import { FileMetadata } from "../types"; // Import type definition
import LoadingSpinner from "../components/LoadingSpinner"; // Loading spinner component
import QRCodeDisplay from "../components/QRCodeDisplay"; // QR code display component

const SearchPage: React.FC = () => {
  const { backendActor, isAuthenticated, isAuthReady } = useAuth();
  const [allFiles, setAllFiles] = useState<FileMetadata[]>([]); // State to store all fetched files
  const [loading, setLoading] = useState(true); // Loading state for initial fetch
  const [error, setError] = useState(""); // Error message state
  const [searchTerm, setSearchTerm] = useState(""); // State for search input
  const [filterBy, setFilterBy] = useState("filename"); // State for filter criteria (filename, dataset, model)
  const [selectedFileForQR, setSelectedFileForQR] = useState<FileMetadata | null>(null); // State for QR modal

  // Function to fetch all files for the current user
  const fetchAllFiles = async () => {
    // Only fetch if authenticated and actor is ready
    if (!isAuthenticated || !backendActor || !isAuthReady) {
      setLoading(false);
      return;
    }

    setLoading(true); // Set loading true before fetching
    setError(""); // Clear any previous errors
    try {
      // For this application, "search uploaded files" implies searching *your* uploaded files.
      // If cross-user search were needed, the backend `get_all_files` would need to be public
      // or a new public search method would be required.
      const userFiles = await getAllFiles(backendActor);
      setAllFiles(userFiles);
    } catch (err) {
      console.error("Error fetching all files for search:", err);
      setError(`Failed to fetch files for search: ${err instanceof Error ? err.message : String(err)}`);
    } finally {
      setLoading(false); // Set loading false after fetch completes
    }
  };

  // Effect hook to fetch files when authentication state changes or actor becomes available
  useEffect(() => {
    if (isAuthReady && isAuthenticated) {
      fetchAllFiles();
    } else if (isAuthReady && !isAuthenticated) {
      setLoading(false);
      setError("Please log in to search files.");
    }
  }, [isAuthenticated, backendActor, isAuthReady]); // Dependencies for the effect

  // Memoized client-side filtering logic
  const filteredFiles = useMemo(() => {
    if (!searchTerm) {
      return allFiles; // If no search term, return all files
    }
    const lowerCaseSearchTerm = searchTerm.toLowerCase();
    return allFiles.filter((file) => {
      switch (filterBy) {
        case "filename":
          return file.filename.toLowerCase().includes(lowerCaseSearchTerm);
        case "dataset":
          return file.dataset.toLowerCase().includes(lowerCaseSearchTerm);
        case "model":
          return file.model.toLowerCase().includes(lowerCaseSearchTerm);
        default:
          return false; // Should not happen with controlled select
      }
    });
  }, [allFiles, searchTerm, filterBy]); // Recalculate when these dependencies change

  // Function to close the QR code modal
  const closeModal = () => {
    setSelectedFileForQR(null);
  };

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
        <p className="text-lg text-gray-600">Please log in to search your files.</p>
      </div>
    );
  }

  return (
    <div className="bg-white p-8 rounded-lg shadow-xl max-w-5xl mx-auto mt-10">
      <h2 className="text-4xl font-extrabold text-gray-800 mb-8 text-center">
        Search Your Files
      </h2>

      {/* Search Input and Filter Select */}
      <div className="mb-8 flex flex-col sm:flex-row items-center space-y-4 sm:space-y-0 sm:space-x-4">
        <input
          type="text"
          placeholder={`Search by ${filterBy}...`}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="shadow-sm appearance-none border rounded-md w-full sm:w-2/3 py-3 px-4 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
        />
        <select
          value={filterBy}
          onChange={(e) => setFilterBy(e.target.value)}
          className="shadow-sm border rounded-md w-full sm:w-1/3 py-3 px-4 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white"
        >
          <option value="filename">Filename</option>
          <option value="dataset">Dataset</option>
          <option value="model">Model</option>
        </select>
      </div>

      {/* Display filtered results or messages */}
      {filteredFiles.length === 0 && searchTerm ? (
        <p className="text-center text-gray-600 text-lg">No files found matching your search criteria.</p>
      ) : filteredFiles.length === 0 && !searchTerm ? (
        <p className="text-center text-gray-600 text-lg">Start typing to search your uploaded files.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-100">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider rounded-tl-lg">Filename</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Model</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Dataset</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Prompt</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Timestamp</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Creator</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Previous Hash</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider rounded-tr-lg">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredFiles.map((file) => (
                <tr key={file.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">{file.filename}</td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">{file.model}</td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">{file.dataset}</td>
                  <td className="px-4 py-3 text-sm text-gray-900 max-w-xs truncate">{file.prompt}</td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                    {new Date(Number(file.timestamp / 1_000_000n)).toLocaleString()}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500 font-mono">
                    {file.creator.toText().substring(0, 8)}... {/* Truncate principal for display */}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500 font-mono">
                    {file.previous_hash ? `${file.previous_hash.substring(0, 10)}...` : "N/A"}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm font-medium">
                    <button
                      onClick={() => setSelectedFileForQR(file)}
                      className="text-purple-600 hover:text-purple-900 transition-colors py-1 px-3 rounded-md bg-purple-100 hover:bg-purple-200"
                    >
                      Show QR
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
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
    </div>
  );
};

export default SearchPage;
