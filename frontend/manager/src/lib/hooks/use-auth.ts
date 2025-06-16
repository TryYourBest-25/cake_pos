"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/stores/auth";
import { authService } from "@/lib/services/auth-service";

export function useAuth() {
  const router = useRouter();
  const { 
    user, 
    token, 
    isAuthenticated, 
    isLoading, 
    clearAuth,
    setToken 
  } = useAuthStore();

  // Không tự động load profile nữa

  // Auto refresh token
  useEffect(() => {
    if (!token || !isAuthenticated) return;

    // Refresh token every 14 minutes (access token expires in 15 minutes)
    const refreshInterval = setInterval(async () => {
      try {
        const response = await authService.refreshToken();
        setToken(response.access_token);
      } catch (error) {
        console.error("Lỗi refresh token:", error);
        // Nếu refresh token thất bại, clear auth và redirect về login
        clearAuth();
        router.push("/login");
      }
    }, 14 * 60 * 1000); // 14 minutes

    return () => clearInterval(refreshInterval);
  }, [token, isAuthenticated, setToken, clearAuth, router]);

  const logout = async () => {
    try {
      await authService.logout();
    } catch (error) {
      console.error("Lỗi khi đăng xuất:", error);
    } finally {
      clearAuth();
      router.push("/login");
    }
  };

  const requireAuth = () => {
    if (!isAuthenticated) {
      router.push("/login");
      return false;
    }
    return true;
  };

  const requireRole = (requiredRoles: string[]) => {
    if (!user || !requiredRoles.includes(user.role.name)) {
      router.push("/dashboard");
      return false;
    }
    return true;
  };

  const hasRole = (roleName: string) => {
    return user?.role?.name === roleName;
  };

  const isManager = () => hasRole('MANAGER');
  const isEmployee = () => hasRole('EMPLOYEE') || hasRole('STAFF');
  const isCustomer = () => hasRole('CUSTOMER');

  return {
    user,
    token,
    isAuthenticated,
    isLoading,
    logout,
    requireAuth,
    requireRole,
    hasRole,
    isManager,
    isEmployee,
    isCustomer,
  };
} 