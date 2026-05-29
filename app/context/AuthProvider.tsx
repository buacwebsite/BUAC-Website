"use client";

import { createContext, useContext, useState, ReactNode } from "react";
import axios from "axios";

interface User {
  email: string;
  name: string;
  role: "admin" | "member" | "alumni";
}

interface AuthContextType {
  auth: boolean;
  user: User | null;
  isAdmin: boolean;
  isLoggedIn: boolean;
  setAuth: (value: boolean) => void;
  setUser: (user: User | null) => void;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  auth: false,
  user: null,
  isAdmin: false,
  isLoggedIn: false,
  setAuth: () => {},
  setUser: () => {},
  logout: async () => {},
});

export function AuthProvider({
  children,
  initialAuth,
  initialUser,
}: {
  children: ReactNode;
  initialAuth: boolean;
  initialUser: User | null;
}) {
  const [auth, setAuth] = useState(initialAuth);
  const [user, setUser] = useState<User | null>(initialUser);

  const isAdmin = auth || user?.role === "admin";
  const isLoggedIn = !!user || auth;

  const logout = async () => {
    await axios.get("/api/auth/logout");
    setAuth(false);
    setUser(null);
    window.location.href = "/";
  };

  return (
    <AuthContext.Provider
      value={{ auth, user, isAdmin, isLoggedIn, setAuth, setUser, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);