import React, { useMemo, useState } from "react";
import { useFiles } from "../hooks/useFiles";
import { formatTimestamp } from "../services/file";
import type { FileMetadata } from "../types";
import LoadingSpinner from "../components/LoadingSpinner";
import Alert from "../components/Alert";
import QRModal from "../components/QRModal";
import { inputClass, qrButtonClass, thClass } from "../styles";

type SearchField = "filename" | "dataset" | "model";

const SearchPage: React.FC = () => {
  const { files, loading, error } = useFiles();
  const [searchTerm, setSearchTerm] = useState("");
  const [filterBy, setFilterBy] = useState<SearchField>("filename");
  const [qrFile, setQrFile] = useState<FileMetadata | null>(null);

  const filteredFiles = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    return term ? files.filter((file) => file[filterBy].toLowerCase().includes(term)) : files;
  }, [files, searchTerm, filterBy]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <LoadingSpinner />
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-lg mx-auto mt-10">
        <Alert kind="error"><strong>Error!</strong> {error}</Alert>
      </div>
    );
  }

  return (
    <div className="bg-white p-8 rounded-lg shadow-xl max-w-5xl mx-auto mt-10">
      <h2 className="text-4xl font-extrabold text-gray-800 mb-8 text-center">Search Your Files</h2>

      <div className="mb-8 flex flex-col sm:flex-row items-center gap-4">
        <input
          type="text"
          placeholder={`Search by ${filterBy}...`}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className={`${inputClass} sm:w-2/3`}
        />
        <select
          value={filterBy}
          onChange={(e) => setFilterBy(e.target.value as SearchField)}
          className={`${inputClass} sm:w-1/3 bg-white`}
        >
          <option value="filename">Filename</option>
          <option value="dataset">Dataset</option>
          <option value="model">Model</option>
        </select>
      </div>

      {filteredFiles.length === 0 ? (
        <p className="text-center text-gray-600 text-lg">
          {searchTerm ? "No files found matching your search criteria." : "You haven't uploaded any files yet."}
        </p>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-100">
              <tr>
                <th className={thClass}>Filename</th>
                <th className={thClass}>Model</th>
                <th className={thClass}>Dataset</th>
                <th className={thClass}>Prompt</th>
                <th className={thClass}>Timestamp</th>
                <th className={thClass}>Previous Hash</th>
                <th className={thClass}>Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredFiles.map((file) => (
                <tr key={file.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">{file.filename}</td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">{file.model}</td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">{file.dataset}</td>
                  <td className="px-4 py-3 text-sm text-gray-900 max-w-xs truncate">{file.prompt}</td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">{formatTimestamp(file.timestamp)}</td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500 font-mono" title={file.previous_hash}>
                    {file.previous_hash ? `${file.previous_hash.substring(0, 10)}...` : "N/A"}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm font-medium">
                    <button onClick={() => setQrFile(file)} className={qrButtonClass}>Show QR</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {qrFile && <QRModal file={qrFile} onClose={() => setQrFile(null)} />}
    </div>
  );
};

export default SearchPage;
