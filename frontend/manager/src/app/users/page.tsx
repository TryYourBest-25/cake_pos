import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  Users, 
  User, 
  UserCheck, 
  UserX,
  ArrowRight,
  Plus
} from "lucide-react";
import Link from "next/link";

const userCategories = [
  {
    title: "Quản Lý",
    description: "Quản lý thông tin và quyền hạn của các quản lý viên",
    icon: User,
    href: "/users/managers",
    count: 3,
    color: "text-blue-600"
  },
  {
    title: "Nhân Viên", 
    description: "Quản lý thông tin nhân viên trong hệ thống",
    icon: UserCheck,
    href: "/users/employees",
    count: 12,
    color: "text-green-600"
  },
  {
    title: "Khách Hàng",
    description: "Quản lý thông tin khách hàng và lịch sử mua hàng",
    icon: UserX,
    href: "/users/customers", 
    count: 248,
    color: "text-purple-600"
  }
];

export default function UsersPage() {
  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Người Dùng</h1>
          <p className="text-muted-foreground">
            Quản lý tất cả người dùng trong hệ thống
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Plus className="mr-2 h-4 w-4" />
            Thêm Khách Hàng
          </Button>
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Thêm Nhân Viên
          </Button>
        </div>
      </div>

      {/* Statistics Overview */}
      <div className="grid gap-4 md:grid-cols-3">
        {userCategories.map((category) => {
          const Icon = category.icon;
          return (
            <Card key={category.title}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  {category.title}
                </CardTitle>
                <Icon className={`h-4 w-4 ${category.color}`} />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{category.count}</div>
                <p className="text-xs text-muted-foreground">
                  Tổng số {category.title.toLowerCase()}
                </p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* User Categories */}
      <div className="grid gap-6 md:grid-cols-1 lg:grid-cols-3">
        {userCategories.map((category) => {
          const Icon = category.icon;
          return (
            <Card key={category.title} className="group hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg bg-muted ${category.color}`}>
                    <Icon className="h-6 w-6" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">{category.title}</CardTitle>
                    <CardDescription className="text-sm">
                      {category.count} người dùng
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4">
                  {category.description}
                </p>
                <Button asChild variant="outline" className="w-full group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                  <Link href={category.href}>
                    Quản lý {category.title}
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Recent Activities */}
      <Card>
        <CardHeader>
          <CardTitle>Hoạt Động Gần Đây</CardTitle>
          <CardDescription>
            Các hoạt động liên quan đến người dùng trong 7 ngày qua
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center gap-4 p-3 bg-muted/50 rounded-lg">
              <div className="p-2 bg-green-100 rounded-full">
                <UserCheck className="h-4 w-4 text-green-600" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium">Nhân viên mới được thêm</p>
                <p className="text-xs text-muted-foreground">Phạm Thị Lan - Kế Toán</p>
              </div>
              <span className="text-xs text-muted-foreground">2 giờ trước</span>
            </div>
            
            <div className="flex items-center gap-4 p-3 bg-muted/50 rounded-lg">
              <div className="p-2 bg-purple-100 rounded-full">
                <UserX className="h-4 w-4 text-purple-600" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium">Khách hàng mới đăng ký</p>
                <p className="text-xs text-muted-foreground">Nguyễn Thị Mai - VIP Member</p>
              </div>
              <span className="text-xs text-muted-foreground">5 giờ trước</span>
            </div>
            
            <div className="flex items-center gap-4 p-3 bg-muted/50 rounded-lg">
              <div className="p-2 bg-blue-100 rounded-full">
                <User className="h-4 w-4 text-blue-600" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium">Cập nhật quyền hạn quản lý</p>
                <p className="text-xs text-muted-foreground">Trần Thị Bình - Thêm quyền báo cáo</p>
              </div>
              <span className="text-xs text-muted-foreground">1 ngày trước</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 