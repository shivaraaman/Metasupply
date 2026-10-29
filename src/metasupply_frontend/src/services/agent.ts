import { Actor, HttpAgent, type ActorSubclass, type Identity } from "@icp-sdk/core/agent";
import { idlFactory } from "declarations/metasupply_backend/metasupply_backend.did.js";
import type { _SERVICE } from "declarations/metasupply_backend/metasupply_backend.did";

export type BackendActor = ActorSubclass<_SERVICE>;

export const isMainnet = process.env.DFX_NETWORK === "ic";
export const backendCanisterId = process.env.CANISTER_ID_METASUPPLY_BACKEND;

export const host = isMainnet ? "https://icp-api.io" : "http://localhost:4943";

const localIdentityCanister = process.env.CANISTER_ID_INTERNET_IDENTITY;

/** Local Internet Identity, when deployed; otherwise the auth client's mainnet defaults are used. */
export const localIdentityProvider =
  !isMainnet && localIdentityCanister
    ? {
        authorizeUrl: `http://${localIdentityCanister}.localhost:4943/authorize`,
        canisterId: localIdentityCanister,
      }
    : undefined;

/**
 * On a local replica without Internet Identity, "log in" creates a throwaway key in the browser instead,
 * so the register flow can be tried locally. Never enabled in mainnet builds.
 */
export const localTestLogin = !isMainnet && !localIdentityProvider;

export const configError = backendCanisterId
  ? null
  : "The backend canister ID is not configured, so documents cannot be registered or verified yet. " +
    "Set CANISTER_ID_METASUPPLY_BACKEND when building the site.";

/** Creates a backend actor. Without an identity, calls are anonymous (enough for verifying). */
export const createBackendActor = async (identity?: Identity): Promise<BackendActor> => {
  if (!backendCanisterId) {
    throw new Error(configError ?? "");
  }
  const agent = await HttpAgent.create({
    host,
    identity,
    // A local replica uses its own root key, which must be fetched before responses can be verified.
    shouldFetchRootKey: !isMainnet,
  });
  return Actor.createActor<_SERVICE>(idlFactory, { agent, canisterId: backendCanisterId });
};
