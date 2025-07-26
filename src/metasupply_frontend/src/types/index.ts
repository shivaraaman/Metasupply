// metasupply/src/metasupply_frontend/src/types/index.ts

import { Principal } from "@dfinity/principal";

// Define the TypeScript interface for FileMetadata, matching the Rust struct
export interface FileMetadata {
  id: string; // SHA-256 hash
  filename: string;
  model: string;
  dataset: string;
  prompt: string;
  previous_hash?: string; // Optional previous hash for versioning
  creator: Principal;
  timestamp: bigint; // Use bigint for u64/u128 from Rust
}