// File: context/auth-context.tsx
"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { useRouter } from "next/navigation";

interface AuthContextType {
  isAuthenticated: boolean;
  isLoading: boolean;
  checkAuthStatus: () => Promise<boolean>;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [justLoggedIn, setJustLoggedIn] = useState(false);

  const checkAuthStatus = async () => {
    try {
      // If the user just logged in, trust that state
      if (justLoggedIn) {
        console.log("User just logged in, using that state");
        return true;
      }

      // Otherwise check localStorage
      const isAuthed = localStorage.getItem("isAuthenticated") === "true";
      console.log("Auth check from localStorage:", isAuthed);

      setIsAuthenticated(isAuthed);
      setIsLoading(false);
      return isAuthed;
    } catch (error) {
      console.error("Auth check error:", error);
      setIsAuthenticated(false);
      setIsLoading(false);
      return false;
    }
  };

  const login = async (email: string, password: string) => {
    setIsLoading(true);

    try {
      console.log("Attempting login...");
      const response = await fetch("http://localhost:8080/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
        credentials: "include",
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error("Login failed:", errorText);
        setIsLoading(false);
        throw new Error(errorText || "Login failed");
      }

      console.log("Login successful!");

      // Store authentication state in localStorage as a fallback
      localStorage.setItem("isAuthenticated", "true");

      // Set auth state after successful login
      setIsAuthenticated(true);
      setJustLoggedIn(true);
      setIsLoading(false);
    } catch (error) {
      console.error("Login error:", error);
      setIsAuthenticated(false);
      setIsLoading(false);
      throw error;
    }
  };

  // Update the logout function in context/auth-context.tsx
  const logout = async () => {
    setIsLoading(true);

    try {
      // If you have a logout endpoint
      await fetch("http://localhost:8080/logout", {
        method: "POST",
        credentials: "include",
      });
    } catch (error) {
      console.error("Logout error:", error);
    }

    // Clear local storage
    localStorage.removeItem("isAuthenticated");

    // Reset all auth state
    setIsAuthenticated(false);
    setJustLoggedIn(false);
    setIsLoading(false);

    // Redirect to home page instead of login page
    router.push("/");
  };

  useEffect(() => {
    console.log("Auth Provider mounted, checking status...");
    checkAuthStatus();
  }, []);

  return (
    <AuthContext.Provider
      value={{ isAuthenticated, isLoading, checkAuthStatus, login, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
