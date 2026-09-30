"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";
import axios from "axios";

interface AdminUser {
  email: string;
  name: string;
  role: "admin";
}

interface AuthContextType {
  auth: boolean;
  user: AdminUser | null;
  isAdmin: boolean;
  isLoggedIn: boolean;
  setAuth: (value: boolean) => void;
  setUser: (user: AdminUser | null) => void;
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
  initialAuth = false,
  initialUser = null,
}: {
  children: React.ReactNode;
  initialAuth?: boolean;
  initialUser?: AdminUser | null;
}) {
  const [auth, setAuth] = useState(initialAuth);
  const [user, setUser] = useState<AdminUser | null>(initialUser);

  useEffect(() => {
    let cancelled = false;

    const timeoutId = window.setTimeout(async () => {
      try {
        const response = await fetch("/api/auth/me", {
          credentials: "include",
          cache: "no-store",
        });

        if (!response.ok) return;

        const data = await response.json();

        if (cancelled || data?.user?.role !== "admin") return;

        setAuth(true);
        setUser(data.user);
      } catch {
        // Public visitors do not need this request to succeed.
      }
    }, 2500);

    return () => {
      cancelled = true;
      window.clearTimeout(timeoutId);
    };
  }, []);

  const logout = async () => {
    try {
      await axios.get("/api/admin/logout");
    } finally {
      setAuth(false);
      setUser(null);
      window.location.href = "/";
    }
  };

  return (
    <AuthContext.Provider
      value={{
        auth,
        user,
        isAdmin: auth,
        isLoggedIn: auth,
        setAuth,
        setUser,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);