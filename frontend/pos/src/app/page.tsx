"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/stores/auth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function HomePage() {
  const { user, isAuthenticated, logout } = useAuthStore();
  const router = useRouter();

  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/login");
    } else {
      router.push("/pos");
    }
  }, [isAuthenticated, router]);

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  const handleLogout = async () => {
    await logout();
    router.push("/login");
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4">
      <div className="container mx-auto">
        {/* Header */}
        <header className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center">
              <span className="text-xl font-bold text-primary-foreground">🧁</span>
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                Cake POS
              </h1>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Hệ thống bán hàng
              </p>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="text-right">
              <p className="font-medium text-gray-900 dark:text-white">
                {user?.employee?.first_name} {user?.employee?.last_name}
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {user?.role?.name}
              </p>
            </div>
            <Button 
              variant="outline" 
              onClick={handleLogout}
              className="text-sm"
            >
              Đăng xuất
            </Button>
          </div>
        </header>

        {/* Welcome Card */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Chào mừng đến với Cake POS</CardTitle>
            <CardDescription>
              Hệ thống bán hàng dành cho cửa hàng bánh ngọt
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="p-4 border rounded-lg">
                <div className="flex items-center space-x-3 mb-2">
                  <span className="text-2xl">🛒</span>
                  <h3 className="font-semibold">Bán hàng</h3>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Tạo đơn hàng và xử lý thanh toán
                </p>
              </div>
              
              <div className="p-4 border rounded-lg">
                <div className="flex items-center space-x-3 mb-2">
                  <span className="text-2xl">📋</span>
                  <h3 className="font-semibold">Quản lý đơn hàng</h3>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Theo dõi và xử lý đơn hàng
                </p>
              </div>
              
              <div className="p-4 border rounded-lg">
                <div className="flex items-center space-x-3 mb-2">
                  <span className="text-2xl">📊</span>
                  <h3 className="font-semibold">Báo cáo</h3>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Xem thống kê và báo cáo bán hàng
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Button className="h-20 flex flex-col space-y-2">
            <span className="text-2xl">➕</span>
            <span>Đơn hàng mới</span>
          </Button>
          
          <Button variant="outline" className="h-20 flex flex-col space-y-2">
            <span className="text-2xl">📋</span>
            <span>Danh sách đơn hàng</span>
          </Button>
          
          <Button variant="outline" className="h-20 flex flex-col space-y-2">
            <span className="text-2xl">🍰</span>
            <span>Sản phẩm</span>
          </Button>
          
          <Button variant="outline" className="h-20 flex flex-col space-y-2">
            <span className="text-2xl">👥</span>
            <span>Khách hàng</span>
          </Button>
        </div>
      </div>
    </div>
  );
}
