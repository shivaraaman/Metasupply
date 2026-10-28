import type { BackendActor } from "./agent";
import type { FileMetadata } from "../types";

interface UploadFileArgs {
  id: string;
  filename: string;
  model: string;
  dataset: string;
  prompt: string;
  previous_hash?: string;
}

const describe = (error: unknown) => (error instanceof Error ? error.message : String(error));

/** Stores file metadata in the backend. Candid `opt text` is `[] | [string]` in JS. */
export const uploadFile = async (actor: BackendActor, args: UploadFileArgs): Promise<string> => {
  let result;
  try {
    result = await actor.upload_file(
      args.id,
      args.filename,
      args.model,
      args.dataset,
      args.prompt,
      args.previous_hash ? [args.previous_hash] : []
    );
  } catch (error) {
    throw new Error(`Could not reach the backend: ${describe(error)}`);
  }
  if ("Err" in result) {
    throw new Error(result.Err);
  }
  return result.Ok;
};

/** Fetches every file uploaded by the logged-in user, newest first. */
export const getAllFiles = async (actor: BackendActor): Promise<FileMetadata[]> => {
  try {
    const files = await actor.get_all_files();
    return files
      .map((file) => ({ ...file, previous_hash: file.previous_hash[0] }))
      .sort((a, b) => Number(b.timestamp - a.timestamp));
  } catch (error) {
    throw new Error(`Failed to fetch files: ${describe(error)}`);
  }
};

/** Builds a JSON payload for QR codes (JSON.stringify cannot handle BigInt or Principal). */
export const toQRPayload = (file: FileMetadata): string =>
  JSON.stringify({
    ...file,
    creator: file.creator.toText(),
    timestamp: file.timestamp.toString(),
  });

export const formatTimestamp = (nanos: bigint): string =>
  new Date(Number(nanos / 1_000_000n)).toLocaleString();
