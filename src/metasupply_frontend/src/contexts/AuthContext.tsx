import React, { createContext, useCallback, useContext, useEffect, useState } from "react";
import { AuthClient } from "@dfinity/auth-client";
import type { Principal } from "@dfinity/principal";
import { createBackendActor, identityProvider, type BackendActor } from "../services/agent";

interface AuthContextType {
  isAuthenticated: boolean;
  isAuthReady: boolean;
  principal: Principal | null;
  backendActor: BackendActor | null;
  /** Set when the backend cannot be reached, e.g. a missing canister ID. */
  configError: string | null;
  login: () => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [authClient, setAuthClient] = useState<AuthClient | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isAuthReady, setIsAuthReady] = useState(false);
  const [principal, setPrincipal] = useState<Principal | null>(null);
  const [backendActor, setBackendActor] = useState<BackendActor | null>(null);
  const [configError, setConfigError] = useState<string | null>(null);

  const syncState = useCallback(async (client: AuthClient) => {
    const authenticated = await client.isAuthenticated();
    setIsAuthenticated(authenticated);
    if (!authenticated) {
      setPrincipal(null);
      setBackendActor(null);
      return;
    }
    const identity = client.getIdentity();
    setPrincipal(identity.getPrincipal());
    try {
      setBackendActor(await createBackendActor(identity));
      setConfigError(null);
    } catch (error) {
      console.error("Could not create backend actor:", error);
      setBackendActor(null);
      setConfigError(error instanceof Error ? error.message : String(error));
    }
  }, []);

  useEffect(() => {
    AuthClient.create()
      .then(async (client) => {
        setAuthClient(client);
        await syncState(client);
      })
      .catch((error) => console.error("Error initializing AuthClient:", error))
      .finally(() => setIsAuthReady(true));
  }, [syncState]);

  const login = useCallback(async () => {
    if (!authClient) return;
    await new Promise<void>((resolve) => {
      authClient.login({
        identityProvider,
        maxTimeToLive: BigInt(7 * 24 * 60 * 60) * 1_000_000_000n,
        onSuccess: () => syncState(authClient).then(resolve),
        onError: (error) => {
          console.error("Internet Identity login failed:", error);
          resolve();
        },
      });
    });
  }, [authClient, syncState]);

  const logout = useCallback(async () => {
    if (!authClient) return;
    await authClient.logout();
    await syncState(authClient);
  }, [authClient, syncState]);

  return (
    <AuthContext.Provider
      value={{ isAuthenticated, isAuthReady, principal, backendActor, configError, login, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
