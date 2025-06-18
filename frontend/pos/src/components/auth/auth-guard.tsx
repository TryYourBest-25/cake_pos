"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/stores/auth";

interface AuthGuardProps {
  children: React.ReactNode;
}

export function AuthGuard({ children }: AuthGuardProps) {
  const { isAuthenticated, isHydrated } = useAuthStore();
  const router = useRouter();

  useEffect(() => {
    // Wait for hydration to complete
    if (!isHydrated) return;
    
    // Redirect to login if not authenticated
    if (!isAuthenticated) {
      router.push("/login");
    }
  }, [isAuthenticated, isHydrated, router]);

  // Show loading while hydrating
  if (!isHydrated) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // Show loading while redirecting to login
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return <>{children}</>;
} 