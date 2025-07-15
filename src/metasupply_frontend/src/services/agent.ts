import { HttpAgent, Actor } from '@dfinity/agent';
import { idlFactory } from '/home/abc/metasupply/src/declarations/metasupply_backend';


const canisterId = import.meta.env.VITE_CANISTER_ID_METASUPPLY_BACKEND as string;

export const agent = new HttpAgent({
  host: 'http://127.0.0.1:4943',
});

// Only fetch root key if in dev or local network
if (import.meta.env.DEV || import.meta.env.VITE_DFX_NETWORK === 'local') {
  agent.fetchRootKey().catch(err => {
    console.warn('⚠️ Unable to fetch root key. Is local replica running?');
    console.error(err);
  });
}

export const backendActor = Actor.createActor(idlFactory, {
  agent,
  canisterId,
});
