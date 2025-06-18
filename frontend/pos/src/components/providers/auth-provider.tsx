"use client";

import { useEffect } from "react";
import { useAuthStore } from "@/stores/auth";

interface AuthProviderProps {
  children: React.ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const { initializeAuth } = useAuthStore();

  useEffect(() => {
    // Initialize auth when component mounts
    const cleanup = initializeAuth();
    
    // Return cleanup function if provided
    return cleanup;
  }, [initializeAuth]);

  return <>{children}</>;
} 