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
  userEmail: string | null;
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
  const [userEmail, setUserEmail] = useState<string | null>(null);

  // Extract email from JWT
  const extractEmailFromJWT = (): string | null => {
    try {
      // Get access_token cookie
      const tokenCookie = document.cookie
        .split('; ')
        .find(cookie => cookie.startsWith('access_token='));

      if (!tokenCookie) return null;

      const token = tokenCookie.split('=')[1];
      if (!token) return null;

      // Get payload part and decode it
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const payload = JSON.parse(window.atob(base64));

      // JWT sub field contains email
      return payload.sub || null;
    } catch (err) {
      console.error("Error decoding JWT", err);
      return null;
    }
  };

  const checkAuthStatus = async () => {
    try {
      // Check for JWT cookie first
      const hasToken = document.cookie.includes('access_token=');
      
      // If token exists, try to extract email
      let email = null;
      if (hasToken) {
        email = extractEmailFromJWT();
      }
      
      // If we just logged in, trust that state
      if (justLoggedIn) {
        console.log("User just logged in, using that state");
        return true;
      }

      // Check localStorage as fallback
      const isAuthed = hasToken || localStorage.getItem("isAuthenticated") === "true";
      console.log("Auth check result:", isAuthed);
      
      if (email) {
        setUserEmail(email);
      }

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
      const response = await fetch("http://54.202.205.174:8080/login", {
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
      
      // Set user email
      setUserEmail(email);

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

  const logout = async () => {
    setIsLoading(true);
  
    try {
      // Clear the access_token cookie
      document.cookie = "access_token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
      document.cookie = "access_token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/dashboard;";
      console.log("Logged out by clearing JWT cookie");
    } catch (error) {
      console.error("Logout error:", error);
    }
  
    // Clear local storage
    localStorage.removeItem("isAuthenticated");
  
    // Reset all auth state
    setIsAuthenticated(false);
    setJustLoggedIn(false);
    setIsLoading(false);
  
    // Redirect to home page
    router.push("/");
  }
  useEffect(() => {
    console.log("Auth Provider mounted, checking status...");
    checkAuthStatus();
  }, []);

  return (
    <AuthContext.Provider
      value={{ 
        isAuthenticated, 
        isLoading, 
        userEmail, 
        checkAuthStatus, 
        login, 
        logout 
      }}
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