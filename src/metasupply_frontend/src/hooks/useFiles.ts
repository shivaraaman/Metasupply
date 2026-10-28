import { useCallback, useEffect, useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import { getAllFiles } from "../services/file";
import type { FileMetadata } from "../types";

/** Loads the logged-in user's files and exposes a `refresh` to reload them. */
export const useFiles = () => {
  const { backendActor } = useAuth();
  const [files, setFiles] = useState<FileMetadata[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const refresh = useCallback(async () => {
    if (!backendActor) {
      setLoading(false);
      return;
    }
    setLoading(true);
    setError("");
    try {
      setFiles(await getAllFiles(backendActor));
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setLoading(false);
    }
  }, [backendActor]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return { files, loading, error, refresh };
};
