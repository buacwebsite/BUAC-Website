"use client";

import {
  createContext,
  useContext,
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
  initialAuth,
  initialUser,
}: {
  children: React.ReactNode;
  initialAuth: boolean;
  initialUser: AdminUser | null;
}) {
  const [auth, setAuth] = useState(initialAuth);
  const [user, setUser] = useState<AdminUser | null>(initialUser);

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