// src/utils/backend.ts
import { Actor, HttpAgent } from "@dfinity/agent";
import { idlFactory, canisterId as backendCanisterId } from "/home/abc/metasupply/src/declarations/metasupply_backend";

export const backendActor = Actor.createActor(idlFactory, {
  agent: new HttpAgent(),
  canisterId: backendCanisterId,
});

