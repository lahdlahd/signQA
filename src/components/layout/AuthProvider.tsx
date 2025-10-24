"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode
} from "react";

import { AUTH_HEADER_KEY, demoUsers, type DemoUser } from "@/lib/auth";

type AuthContextValue = {
  currentUser: DemoUser;
  availableUsers: DemoUser[];
  switchUser: (id: number) => void;
  authedFetch: typeof fetch;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [currentUser, setCurrentUser] = useState<DemoUser>(demoUsers[0]);

  const switchUser = useCallback((id: number) => {
    const nextUser = demoUsers.find((user) => user.id === id);
    if (nextUser) {
      setCurrentUser(nextUser);
    }
  }, []);

  const authedFetch = useCallback(
    (input: RequestInfo | URL, init?: RequestInit) => {
      const headers = new Headers(init?.headers);
      headers.set(AUTH_HEADER_KEY, currentUser.id.toString());

      return fetch(input, {
        ...init,
        headers
      });
    },
    [currentUser.id]
  );

  const value = useMemo<AuthContextValue>(
    () => ({
      currentUser,
      availableUsers: demoUsers,
      switchUser,
      authedFetch
    }),
    [authedFetch, currentUser, switchUser]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
