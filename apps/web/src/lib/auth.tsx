import { createContext, useContext, useState, useEffect, type ReactNode } from "react";
import type { User } from "./api";

interface AuthState {
  user: User | null;
  token: string | null;
  login: (token: string, user: User) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthState | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(() => localStorage.getItem("echoes_token"));
  const [user, setUser] = useState<User | null>(() => {
    const raw = localStorage.getItem("echoes_user");
    return raw ? (JSON.parse(raw) as User) : null;
  });

  function login(newToken: string, newUser: User) {
    localStorage.setItem("echoes_token", newToken);
    localStorage.setItem("echoes_user", JSON.stringify(newUser));
    setToken(newToken);
    setUser(newUser);
  }

  function logout() {
    localStorage.removeItem("echoes_token");
    localStorage.removeItem("echoes_user");
    setToken(null);
    setUser(null);
  }

  return (
    <AuthContext.Provider value={{ user, token, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthState {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
