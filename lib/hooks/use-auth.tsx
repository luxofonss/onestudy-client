"use client";

import type React from "react";

import { useState, useEffect, createContext, useContext } from "react";
import { authService } from "@/lib/services/auth-service";
import { apiService } from "@/lib/services/api-service";
import { SUCCESS_CODE } from "../constants";

interface User {
  id: string;
  name: string;
  email: string;
  username: string;
  avatarUrl?: string;
  role?: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (username: string, password: string) => Promise<void>;
  register: (
    name: string,
    email: string,
    username: string,
    password: string
  ) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const checkAuthStatus = async () => {
      console.log("checkAuthStatus");
      try {
        if (authService.isAuthenticated()) {
          const userData = await authService.getMe();
          if (userData.meta.code === SUCCESS_CODE && userData.data) {
            setIsAuthenticated(true);
            setUser(userData.data);
          } else {
            authService.logout();
          }
        }
      } catch (error) {
        console.error("Auth check failed:", error);
        authService.logout();
      } finally {
        setIsLoading(false);
      }
    };

    checkAuthStatus();
  }, []);

  const login = async (username: string, password: string) => {
    setIsLoading(true);
    try {
      const response = await authService.login(username, password);
      console.log("login response", response);

      const user = await authService.getMe();
      if (user.meta.code === SUCCESS_CODE && user.data) {
        setUser(user.data);
      }
      setIsAuthenticated(true);
      return response;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async ({
    name,
    email,
    username,
    password,
  }: {
    name: string;
    email: string;
    username: string;
    password: string;
  }) => {
    setIsLoading(true);
    try {
      const response = await authService.register({
        name,
        email,
        username,
        password,
      });
      return response;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    setIsLoading(true);
    try {
      await authService.logout();
      setUser(null);
      setIsAuthenticated(false);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthContext.Provider
      value={{ user, isAuthenticated, isLoading, login, register, logout }}
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
