import React, { createContext, useCallback, useContext, useEffect, useState } from "react";
import { AuthClient } from "@icp-sdk/auth/client";
import type { Principal } from "@icp-sdk/core/principal";
import {
  configError,
  createBackendActor,
  host,
  isMainnet,
  localIdentityProvider,
  type BackendActor,
} from "../services/agent";

interface AuthContextType {
  isAuthenticated: boolean;
  isAuthReady: boolean;
  principal: Principal | null;
  /** Signed with the user's identity when logged in, anonymous otherwise; null if unconfigured. */
  actor: BackendActor | null;
  configError: string | null;
  login: () => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const authClient = new AuthClient({
  identityProvider: localIdentityProvider,
  agentOptions: { host, shouldFetchRootKey: !isMainnet },
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isAuthReady, setIsAuthReady] = useState(false);
  const [principal, setPrincipal] = useState<Principal | null>(null);
  const [actor, setActor] = useState<BackendActor | null>(null);
  const [error, setError] = useState<string | null>(configError);

  const syncState = useCallback(async () => {
    const identity = authClient.isAuthenticated() ? await authClient.getIdentity() : undefined;
    setPrincipal(identity ? identity.getPrincipal() : null);
    if (configError) return;
    try {
      setActor(await createBackendActor(identity));
    } catch (err) {
      setActor(null);
      setError(err instanceof Error ? err.message : String(err));
    }
  }, []);

  useEffect(() => {
    syncState()
      .catch((err) => console.error("Could not restore the session:", err))
      .finally(() => setIsAuthReady(true));
    // Picks up sign-ins, sign-outs and expiry, including from other tabs.
    return authClient.subscribe(() => void syncState());
  }, [syncState]);

  const login = useCallback(async () => {
    try {
      await authClient.signIn({ maxTimeToLive: BigInt(7 * 24 * 60 * 60) * 1_000_000_000n });
    } catch (err) {
      console.error("Internet Identity login failed:", err);
    }
    await syncState();
  }, [syncState]);

  const logout = useCallback(async () => {
    await authClient.signOut();
    await syncState();
  }, [syncState]);

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated: principal !== null,
        isAuthReady,
        principal,
        actor,
        configError: error,
        login,
        logout,
      }}
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
