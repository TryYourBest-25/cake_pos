"use client";

import { useEffect, ReactNode, useState } from "react";
import { useAuthStore } from "@/stores/auth";
import { AuthLoading } from "@/components/ui/auth-loading";

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const { isLoading, initializeAuth } = useAuthStore();
  const [isInitializing, setIsInitializing] = useState(true);

  useEffect(() => {
    // Khởi tạo auth system
    const cleanup = initializeAuth();
    setIsInitializing(false);
    
    return cleanup;
  }, [initializeAuth]);

  if (isInitializing || isLoading) {
    return <AuthLoading />;
  }

  return <>{children}</>;
} 