import type { Principal } from "@dfinity/principal";

/** Mirrors the backend's FileMetadata, with `opt text` unwrapped to an optional string. */
export interface FileMetadata {
  id: string;
  filename: string;
  model: string;
  dataset: string;
  prompt: string;
  previous_hash?: string;
  creator: Principal;
  /** Nanoseconds since the Unix epoch. */
  timestamp: bigint;
}
