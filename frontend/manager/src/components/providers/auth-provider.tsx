"use client";

import { useEffect, ReactNode, useState } from "react";
import { useAuthStore } from "@/stores/auth";
import { AuthLoading } from "@/components/ui/auth-loading";

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const { isLoading } = useAuthStore();
  const [isInitializing, setIsInitializing] = useState(true);

  useEffect(() => {
    setIsInitializing(false);
  }, []);

  if (isInitializing || isLoading) {
    return <AuthLoading />;
  }

  return <>{children}</>;
} 