import { Actor, ActorSubclass, HttpAgent, Identity } from "@dfinity/agent";
import { idlFactory } from "declarations/metasupply_backend/metasupply_backend.did.js";
import type { _SERVICE } from "declarations/metasupply_backend/metasupply_backend.did";

export type BackendActor = ActorSubclass<_SERVICE>;

export const isMainnet = process.env.DFX_NETWORK === "ic";
export const backendCanisterId = process.env.CANISTER_ID_METASUPPLY_BACKEND;

export const identityProvider = isMainnet
  ? "https://identity.ic0.app"
  : `http://${process.env.CANISTER_ID_INTERNET_IDENTITY}.localhost:4943`;

const host = isMainnet ? "https://icp-api.io" : "http://127.0.0.1:4943";

/** Creates an actor for the backend canister that signs calls with `identity`. */
export const createBackendActor = async (identity: Identity): Promise<BackendActor> => {
  if (!backendCanisterId) {
    throw new Error(
      "Backend canister ID is not configured. Set CANISTER_ID_METASUPPLY_BACKEND when building."
    );
  }

  const agent = new HttpAgent({ host, identity });
  // A local replica uses its own root key, which must be fetched before any call is verified.
  if (!isMainnet) {
    await agent.fetchRootKey();
  }

  return Actor.createActor<_SERVICE>(idlFactory, { agent, canisterId: backendCanisterId });
};
