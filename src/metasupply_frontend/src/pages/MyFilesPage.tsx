import React, { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { sha256 } from "js-sha256";
import { useAuth } from "../contexts/AuthContext";
import { useFiles } from "../hooks/useFiles";
import { formatTimestamp, uploadFile } from "../services/file";
import type { FileMetadata } from "../types";
import LoadingSpinner from "../components/LoadingSpinner";
import Alert from "../components/Alert";
import Modal from "../components/Modal";
import QRModal from "../components/QRModal";
import { inputClass, primaryButtonClass, qrButtonClass, thClass } from "../styles";

const MyFilesPage: React.FC = () => {
  const { backendActor, principal } = useAuth();
  const { files, loading, error, refresh } = useFiles();
  const [qrFile, setQrFile] = useState<FileMetadata | null>(null);
  const [editingFile, setEditingFile] = useState<FileMetadata | null>(null);
  const [newModel, setNewModel] = useState("");
  const [updateMessage, setUpdateMessage] = useState("");
  const [updateError, setUpdateError] = useState("");
  const [updateLoading, setUpdateLoading] = useState(false);

  // Group versions of the same logical file (files arrive sorted newest first).
  const groupedFiles = useMemo(() => {
    const groups = new Map<string, FileMetadata[]>();
    for (const file of files) {
      const group = groups.get(file.filename) ?? [];
      group.push(file);
      groups.set(file.filename, group);
    }
    return groups;
  }, [files]);

  const startEditing = (file: FileMetadata) => {
    setEditingFile(file);
    setNewModel(file.model);
    setUpdateError("");
  };

  const handleUpdateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingFile || !backendActor || !principal) return;

    setUpdateLoading(true);
    setUpdateError("");
    try {
      // Date.now() keeps repeated updates of the same file unique.
      const id = sha256(
        `${editingFile.filename}-${newModel}-${editingFile.dataset}-${editingFile.prompt}-${principal.toText()}-${Date.now()}`
      );
      const result = await uploadFile(backendActor, {
        id,
        filename: editingFile.filename,
        model: newModel.trim(),
        dataset: editingFile.dataset,
        prompt: editingFile.prompt,
        previous_hash: editingFile.id,
      });
      setUpdateMessage(result);
      setEditingFile(null);
      await refresh();
    } catch (err) {
      setUpdateError(`Failed to update file: ${err instanceof Error ? err.message : String(err)}`);
    } finally {
      setUpdateLoading(false);
    }
  };

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
      <h2 className="text-4xl font-extrabold text-gray-800 mb-8 text-center">My Uploaded Files</h2>

      {updateMessage && (
        <div className="mb-6">
          <Alert kind="success">{updateMessage}</Alert>
        </div>
      )}

      {groupedFiles.size === 0 ? (
        <p className="text-center text-gray-600 text-lg">
          You haven't uploaded any files yet. Go to the{" "}
          <Link to="/upload" className="text-blue-600 hover:underline">Upload page</Link> to add your first file.
        </p>
      ) : (
        <div className="space-y-8">
          {[...groupedFiles].map(([filename, versions]) => (
            <div key={filename} className="border border-gray-200 rounded-lg p-6 bg-gray-50 shadow-sm">
              <h3 className="text-2xl font-bold text-gray-700 mb-4 break-all">{filename}</h3>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-100">
                    <tr>
                      <th className={thClass}>Version ID (Hash)</th>
                      <th className={thClass}>Model</th>
                      <th className={thClass}>Dataset</th>
                      <th className={thClass}>Prompt</th>
                      <th className={thClass}>Timestamp</th>
                      <th className={thClass}>Previous Hash</th>
                      <th className={thClass}>Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {versions.map((file) => (
                      <tr key={file.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900 font-mono" title={file.id}>
                          {file.id.substring(0, 10)}...
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">{file.model}</td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">{file.dataset}</td>
                        <td className="px-4 py-3 text-sm text-gray-900 max-w-xs truncate">{file.prompt}</td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                          {formatTimestamp(file.timestamp)}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500 font-mono" title={file.previous_hash}>
                          {file.previous_hash ? `${file.previous_hash.substring(0, 10)}...` : "N/A"}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm font-medium">
                          <div className="flex space-x-2">
                            <button
                              onClick={() => startEditing(file)}
                              className="text-blue-600 hover:text-blue-900 transition-colors py-1 px-3 rounded-md bg-blue-100 hover:bg-blue-200"
                            >
                              Update Model
                            </button>
                            <button onClick={() => setQrFile(file)} className={qrButtonClass}>
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

      {qrFile && <QRModal file={qrFile} onClose={() => setQrFile(null)} />}

      {editingFile && (
        <Modal title={`Update Model for "${editingFile.filename}"`} onClose={() => setEditingFile(null)}>
          <p className="text-center text-gray-600 mb-4 text-sm">
            This will create a new version of the file with the updated model.
          </p>
          <form onSubmit={handleUpdateSubmit} className="space-y-4">
            <div>
              <label htmlFor="newModel" className="block text-gray-700 text-sm font-bold mb-2">New Model:</label>
              <input id="newModel" type="text" value={newModel} onChange={(e) => setNewModel(e.target.value)}
                className={inputClass} maxLength={128} required />
            </div>
            {updateError && <Alert kind="error">{updateError}</Alert>}
            <button type="submit" className={primaryButtonClass} disabled={updateLoading}>
              {updateLoading ? "Updating..." : "Create New Version"}
            </button>
          </form>
        </Modal>
      )}
    </div>
  );
};

export default MyFilesPage;
