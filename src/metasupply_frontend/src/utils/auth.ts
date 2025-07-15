import { AuthClient } from "@dfinity/auth-client";

export const II_CANISTER_ID = import.meta.env.VITE_II_CANISTER_ID;

export const initAuth = async () => {
  const authClient = await AuthClient.create();

  const isAuthenticated = await authClient.isAuthenticated();

  if (!isAuthenticated) {
    await authClient.login({
      identityProvider: `http://uxrrr-q7777-77774-qaaaq-cai.localhost:4943/`,
      onSuccess: () => {
        console.log("✅ Login successful");
        window.location.reload();
      },
    });
  }

  return authClient;
};

export const logout = async (authClient: AuthClient) => {
  await authClient.logout();
  window.location.reload();
};
