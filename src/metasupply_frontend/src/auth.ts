// src/auth.ts
import { AuthClient } from '@dfinity/auth-client';

const IDENTITY_CANISTER_ID = import.meta.env.VITE_II_CANISTER_ID!;
const HOST = "http://127.0.0.1:4943"; // local network

export async function initAuthClient() {
  return await AuthClient.create();
}

export async function login(authClient: AuthClient) {
  return await authClient.login({
    identityProvider: `${HOST}/?canisterId=${IDENTITY_CANISTER_ID}`,
    onSuccess: () => {
      console.log("Login successful");
      window.location.reload();
    },
  });
}

export async function logout(authClient: AuthClient) {
  await authClient.logout();
  window.location.reload();
}
