import { ActorSubclass } from "@dfinity/agent";
import { _SERVICE } from "../../../declarations/metasupply_backend/metasupply_backend.did"; // Generated service type
import { FileMetadata } from "../types"; // Custom type definition

// Interface for arguments when uploading a file.
interface UploadFileArgs {
  id: string;
  filename: string;
  model: string;
  dataset: string;
  prompt: string;
  previous_hash?: string; // Optional previous hash
}

/**
 * Uploads file metadata to the backend canister.
 * This function interacts with the `upload_file` method of your Rust backend.
 * It handles the conversion of optional TypeScript strings to Candid's `Option<String>` (represented as `[string]` or `[]`).
 * @param actor The backend actor instance (authenticated).
 * @param args The file metadata arguments.
 * @returns A promise that resolves with a success message or rejects with an error.
 */
export const uploadFile = async (
  actor: ActorSubclass<_SERVICE>,
  args: UploadFileArgs
): Promise<string> => {
  try {
    // Call the backend's upload_file method.
    // Note: Rust's `Option<String>` maps to `[string]` or `[]` in Candid/TypeScript.
    // We convert `undefined` or empty string to `[]` for `Option::None`.
    const result = await actor.upload_file(
      args.id,
      args.filename,
      args.model,
      args.dataset,
      args.prompt,
      // Convert optional string to Candid Opt<String> format: [value] or []
      args.previous_hash ? [args.previous_hash] : []
    );

    // Check the result type from the backend (Rust `Result<String, String>` maps to `variant { Ok: text; Err: text }` in Candid)
    if (typeof result === "object" && "Ok" in result) {
      return result.Ok; // Success message
    } else if (typeof result === "object" && "Err" in result) {
      throw new Error(result.Err); // Error message from the backend
    }
    throw new Error("Unknown error: Backend did not return a valid 'Ok' or 'Err' response during file upload."); // Fallback for unexpected response
  } catch (error) {
    console.error("Error uploading file:", error);
    // Re-throw with a more user-friendly message
    throw new Error(`Failed to upload file: ${error instanceof Error ? error.message : String(error)}`);
  }
};

/**
 * Fetches all files owned by the currently authenticated user from the backend.
 * This function interacts with the `get_all_files` method of your Rust backend.
 * It handles the conversion of Candid's `Option<String>` (represented as `[string]` or `[]`) back to `string | undefined`.
 * @param actor The backend actor instance (authenticated).
 * @returns A promise that resolves with an array of FileMetadata.
 */
export const getAllFiles = async (
  actor: ActorSubclass<_SERVICE>
): Promise<FileMetadata[]> => {
  try {
    // Call the backend's get_all_files method.
    const files = await actor.get_all_files();

    // The `previous_hash` field from Rust's `Option<String>` will be an array `[string]` or empty `[]`.
    // We map it back to `string | undefined` for convenience in TypeScript.
    return files.map((file: any) => ({
      ...file,
      previous_hash: file.previous_hash && file.previous_hash.length > 0 ? file.previous_hash[0] : undefined,
    }));
  } catch (error) {
    console.error("Error fetching files:", error);
    throw new Error(`Failed to fetch files: ${error instanceof Error ? error.message : String(error)}`);
  }
};