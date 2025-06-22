"use client";

import { useEffect, ReactNode } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/stores/auth";
import { AuthLoading } from "@/components/ui/auth-loading";

interface AuthGuardProps {
  children: ReactNode;
  requiredRoles?: string[];
  fallbackUrl?: string;
}

export function AuthGuard({ 
  children, 
  requiredRoles = [], 
  fallbackUrl = "/login" 
}: AuthGuardProps) {
  const router = useRouter();
  const { user, isAuthenticated, isLoading } = useAuthStore();

  useEffect(() => {
    // Nếu đang loading thì chờ
    if (isLoading) return;

    // Nếu chưa đăng nhập thì redirect về login
    if (!isAuthenticated) {
      router.push(fallbackUrl);
      return;
    }

    // Nếu có yêu cầu role cụ thể
    if (requiredRoles.length > 0 && user) {
      const hasRequiredRole = requiredRoles.includes(user.role.name);
      if (!hasRequiredRole) {
        router.push("/dashboard"); // Redirect về dashboard nếu không đủ quyền
        return;
      }
    }
  }, [isAuthenticated, isLoading, user, requiredRoles, router, fallbackUrl]);

  // Hiển thị loading khi đang kiểm tra auth
  if (isLoading) {
    return <AuthLoading />;
  }

  // Nếu chưa đăng nhập hoặc không đủ quyền thì không render children
  if (!isAuthenticated) {
    return <AuthLoading />;
  }

  if (requiredRoles.length > 0 && user) {
    const hasRequiredRole = requiredRoles.includes(user.role.name);
    if (!hasRequiredRole) {
      return <AuthLoading />;
    }
  }

  return <>{children}</>;
} 