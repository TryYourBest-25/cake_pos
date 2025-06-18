import { 
  DollarSign, 
  ShoppingCart, 
  Package, 
  Users,
  TrendingUp,
  Activity
} from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AuthGuard } from "@/components/auth/auth-guard";
// Utility function
function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(amount);
}

// Mock data - thay thế bằng API calls thực tế
const mockStats = {
  todayRevenue: 15420000,
  newOrders: 24,
  productsSold: 128,
  newCustomers: 12,
};

const mockRecentActivities = [
  {
    id: 1,
    type: "order",
    message: "Đơn hàng #123 đã được tạo",
    time: "2 phút trước",
  },
  {
    id: 2, 
    type: "product",
    message: "Sản phẩm Bánh Red Velvet đã hết hàng",
    time: "15 phút trước",
  },
  {
    id: 3,
    type: "customer", 
    message: "Khách hàng Nguyễn Văn A đã đăng ký",
    time: "1 giờ trước",
  },
];

export default function DashboardPage() {
  return (
    <AuthGuard>
      <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground">
          Tổng quan hoạt động cửa hàng hôm nay
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Doanh Thu Hôm Nay
            </CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(mockStats.todayRevenue)}
            </div>
            <p className="text-xs text-muted-foreground">
              <span className="text-green-600 flex items-center">
                <TrendingUp className="h-3 w-3 mr-1" />
                +12.5%
              </span>
              so với hôm qua
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Đơn Hàng Mới
            </CardTitle>
            <ShoppingCart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{mockStats.newOrders}</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-green-600 flex items-center">
                <TrendingUp className="h-3 w-3 mr-1" />
                +8.2%
              </span>
              so với hôm qua
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Sản Phẩm Đã Bán
            </CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{mockStats.productsSold}</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-green-600 flex items-center">
                <TrendingUp className="h-3 w-3 mr-1" />
                +15.3%
              </span>
              so với hôm qua
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Khách Hàng Mới
            </CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{mockStats.newCustomers}</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-green-600 flex items-center">
                <TrendingUp className="h-3 w-3 mr-1" />
                +3.1%
              </span>
              so với hôm qua
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts and Recent Activity */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4">
          <CardHeader>
            <CardTitle>Biểu Đồ Doanh Thu</CardTitle>
          </CardHeader>
          <CardContent className="pl-2">
            <div className="h-80 flex items-center justify-center text-muted-foreground">
              {/* Placeholder cho chart - sẽ implement sau với Recharts */}
              <div className="text-center">
                <Activity className="h-12 w-12 mx-auto mb-2" />
                <p>Biểu đồ doanh thu theo thời gian</p>
                <p className="text-sm">(Sẽ implement với Recharts)</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="col-span-3">
          <CardHeader>
            <CardTitle>Hoạt Động Gần Đây</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {mockRecentActivities.map((activity) => (
                <div key={activity.id} className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-blue-500 rounded-full" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-muted-foreground truncate">
                      {activity.message}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {activity.time}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
    </AuthGuard>
  );
} 