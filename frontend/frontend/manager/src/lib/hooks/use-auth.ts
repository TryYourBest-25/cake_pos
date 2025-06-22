"use client";

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
  } = useAuthStore();

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
    // State
    user,
    token,
    isAuthenticated,
    isLoading,
    
    // Actions
    logout,
    requireAuth,
    requireRole,
    
    // Role checks
    hasRole,
    isManager,
    isEmployee,
    isCustomer,
  };
} 