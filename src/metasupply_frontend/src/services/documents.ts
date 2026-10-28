import type { BackendActor } from "./agent";
import type {
  Document as CandidDocument,
  RegisterError,
} from "declarations/metasupply_backend/metasupply_backend.did";

/** A registered file, with Candid's `opt text` unwrapped. */
export interface DocumentRecord extends Omit<CandidDocument, "previous_hash"> {
  previous_hash?: string;
}

export interface RegisterInput {
  hash: string;
  title: string;
  author: string;
  description: string;
  fileName: string;
  fileSize: number;
  previousHash?: string;
}

export type RegisterOutcome =
  | { kind: "registered"; document: DocumentRecord }
  | { kind: "alreadyRegistered"; document: DocumentRecord };

const fromCandid = ({ previous_hash, ...rest }: CandidDocument): DocumentRecord => ({
  ...rest,
  previous_hash: previous_hash[0],
});

const describe = (error: unknown) => (error instanceof Error ? error.message : String(error));

const call = async <T>(what: string, run: () => Promise<T>): Promise<T> => {
  try {
    return await run();
  } catch (error) {
    throw new Error(`Could not ${what}: ${describe(error)}`);
  }
};

export const isSha256 = (value: string) => /^[0-9a-f]{64}$/i.test(value.trim());

/** SHA-256 of the file contents as lowercase hex. The file never leaves the browser. */
export const hashFile = async (file: File): Promise<string> => {
  const digest = await crypto.subtle.digest("SHA-256", await file.arrayBuffer());
  return Array.from(new Uint8Array(digest), (b) => b.toString(16).padStart(2, "0")).join("");
};

export const registerDocument = async (
  actor: BackendActor,
  input: RegisterInput
): Promise<RegisterOutcome> => {
  const result = await call("reach the registry", () =>
    actor.register({
      hash: input.hash,
      title: input.title,
      author: input.author,
      description: input.description,
      file_name: input.fileName,
      file_size: BigInt(input.fileSize),
      previous_hash: input.previousHash ? [input.previousHash] : [],
    })
  );
  if ("Ok" in result) {
    return { kind: "registered", document: fromCandid(result.Ok) };
  }
  const error: RegisterError = result.Err;
  if ("AlreadyRegistered" in error) {
    return { kind: "alreadyRegistered", document: fromCandid(error.AlreadyRegistered) };
  }
  throw new Error(error.Rejected);
};

/** All versions of the document `hash` belongs to, oldest first; empty if it is unknown. */
export const getHistory = async (actor: BackendActor, hash: string): Promise<DocumentRecord[]> =>
  (await call("look up the document", () => actor.get_history(hash))).map(fromCandid);

export const getDocument = async (actor: BackendActor, hash: string): Promise<DocumentRecord | undefined> => {
  const [document] = await call("look up the document", () => actor.get_document(hash));
  return document && fromCandid(document);
};

export const getMyDocuments = async (actor: BackendActor): Promise<DocumentRecord[]> =>
  (await call("load your documents", () => actor.get_my_documents())).map(fromCandid);

export const getTotalDocuments = (actor: BackendActor) =>
  call("load statistics", () => actor.total_documents());

/** Groups an owner's documents into version chains, each oldest first, newest chain first. */
export const groupIntoChains = (documents: DocumentRecord[]): DocumentRecord[][] => {
  const byPrevious = new Map(documents.filter((d) => d.previous_hash).map((d) => [d.previous_hash!, d]));
  const chains = documents
    .filter((d) => !d.previous_hash)
    .map((first) => {
      const chain = [first];
      for (let next = byPrevious.get(first.hash); next; next = byPrevious.get(next.hash)) {
        chain.push(next);
      }
      return chain;
    });
  const latestTime = (chain: DocumentRecord[]) => chain[chain.length - 1].registered_at;
  return chains.sort((a, b) => Number(latestTime(b) - latestTime(a)));
};

export const formatTimestamp = (nanos: bigint): string =>
  new Date(Number(nanos / 1_000_000n)).toLocaleString(undefined, {
    dateStyle: "long",
    timeStyle: "medium",
  });

export const formatBytes = (bytes: bigint | number): string => {
  const n = Number(bytes);
  if (n < 1024) return `${n} B`;
  const units = ["KB", "MB", "GB", "TB"];
  let value = n / 1024;
  let unit = 0;
  while (value >= 1024 && unit < units.length - 1) {
    value /= 1024;
    unit += 1;
  }
  return `${value.toFixed(1)} ${units[unit]}`;
};

export const shortHash = (hash: string) => `${hash.slice(0, 10)}…${hash.slice(-6)}`;

/** Public link to the verification page for a hash, used for sharing and QR codes. */
export const verifyUrl = (hash: string) =>
  `${window.location.origin}${import.meta.env.BASE_URL}#/verify/${hash}`;
