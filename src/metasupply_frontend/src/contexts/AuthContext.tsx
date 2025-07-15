import React, { createContext, useContext, useState, ReactNode } from "react";
import { AuthClient } from "@dfinity/auth-client";
import { Principal } from "@dfinity/principal";

type AuthContextType = {
  principal: Principal | null;
  login: () => Promise<void>;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [principal, setPrincipal] = useState<Principal | null>(null);

  const login = async () => {
    const authClient = await AuthClient.create();
    await authClient.login({
      identityProvider: `http://uxrrr-q7777-77774-qaaaq-cai.localhost:4943/`,
      onSuccess: async () => {
        const identity = await authClient.getIdentity();
        setPrincipal(identity.getPrincipal());
      },
    });
  };


  const logout = async () => {
    const authClient = await AuthClient.create();
    await authClient.logout();
    setPrincipal(null);
  };

  return (
    <AuthContext.Provider value={{ principal, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within an AuthProvider");
  return context;
};
