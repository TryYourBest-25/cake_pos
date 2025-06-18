"use client";

import * as React from "react";
import { usePathname } from "next/navigation";
import { Search, Bell, User, Settings, LogOut, Menu } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";

interface HeaderProps {
  onMenuClick?: () => void;
  className?: string;
}

// Breadcrumb mapping
const breadcrumbMap: Record<string, string> = {
  "/dashboard": "Dashboard",
  "/users": "Quản lý người dùng",
  "/users/managers": "Quản lý viên",
  "/users/employees": "Nhân viên",
  "/users/customers": "Khách hàng",
  "/users/membership-types": "Loại thành viên",
  "/products": "Sản phẩm",
  "/products/categories": "Danh mục sản phẩm",
  "/products/product-sizes": "Kích thước sản phẩm",
  "/promotions": "Chương trình khuyến mãi",
  "/orders": "Đơn hàng",
  "/orders/processing": "Đang Xử Lý",
  "/orders/completed": "Đã Hoàn Thành",
  "/orders/cancelled": "Đã Hủy",
  "/reports": "Báo cáo",
  "/settings": "Cài đặt",
};

function generateBreadcrumbs(pathname: string) {
  const segments = pathname.split("/").filter(Boolean);
  const breadcrumbs = [];

  // Only add Dashboard if we're not on dashboard or if dashboard is not part of path
  if (pathname !== "/dashboard") {
    breadcrumbs.push({
      label: "Dashboard",
      href: "/dashboard",
      isActive: false,
    });
  }

  // Build path progressively
  let currentPath = "";
  for (let i = 0; i < segments.length; i++) {
    currentPath += `/${segments[i]}`;
    let label = breadcrumbMap[currentPath];
    
    // Handle dynamic routes
    if (!label) {
      // Check for dynamic routes patterns
      if (currentPath.match(/^\/products\/categories\/\d+$/)) {
        label = "Chi tiết danh mục";
      } else if (currentPath.match(/^\/products\/\d+$/)) {
        label = "Chi tiết sản phẩm";
      } else if (currentPath.match(/^\/users\/managers\/\d+$/)) {
        label = "Chi tiết quản lý";
      } else if (currentPath.match(/^\/users\/employees\/\d+$/)) {
        label = "Chi tiết nhân viên";
      } else if (currentPath.match(/^\/users\/customers\/\d+$/)) {
        label = "Chi tiết khách hàng";
      } else if (currentPath.match(/^\/users\/membership-types\/\d+$/)) {
        label = "Chi tiết loại thành viên";
      } else if (currentPath.match(/^\/promotions\/\d+$/)) {
        label = "Chi tiết khuyến mãi";
      } else if (currentPath.match(/^\/orders\/\d+$/)) {
        label = "Chi tiết đơn hàng";
      }
    }
    
    if (label) {
      breadcrumbs.push({
        label,
        href: currentPath,
        isActive: i === segments.length - 1,
      });
    }
  }

  return breadcrumbs;
}

export function Header({ onMenuClick, className }: HeaderProps) {
  const pathname = usePathname();
  const breadcrumbs = generateBreadcrumbs(pathname);

  return (
    <header className={`border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 ${className}`}>
      <div className="flex h-14 items-center px-4 lg:px-6">
        {/* Mobile menu button */}
        <Button
          variant="ghost"
          size="icon"
          className="md:hidden"
          onClick={onMenuClick}
        >
          <Menu className="h-5 w-5" />
        </Button>

        {/* Breadcrumb */}
        <div className="flex-1">
          <Breadcrumb>
            <BreadcrumbList>
              {breadcrumbs.map((breadcrumb, index) => (
                <React.Fragment key={`${breadcrumb.href}-${index}`}>
                  {index > 0 && <BreadcrumbSeparator />}
                  <BreadcrumbItem>
                    {breadcrumb.isActive ? (
                      <BreadcrumbPage>{breadcrumb.label}</BreadcrumbPage>
                    ) : (
                      <BreadcrumbLink href={breadcrumb.href}>
                        {breadcrumb.label}
                      </BreadcrumbLink>
                    )}
                  </BreadcrumbItem>
                </React.Fragment>
              ))}
            </BreadcrumbList>
          </Breadcrumb>
        </div>

        {/* Search */}
        <div className="flex items-center space-x-4">
          <div className="relative hidden md:block">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Tìm kiếm..."
              className="w-[200px] pl-8 lg:w-[300px]"
            />
          </div>

          {/* Notifications */}
          <Button variant="ghost" size="icon" className="relative">
            <Bell className="h-4 w-4" />
            <Badge 
              variant="destructive" 
              className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 text-xs"
            >
              3
            </Badge>
          </Button>

          {/* User menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                <Avatar className="h-8 w-8">
                  <AvatarFallback>QT</AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="end" forceMount>
              <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium leading-none">Quản trị viên</p>
                  <p className="text-xs leading-none text-muted-foreground">
                    admin@banhngotnhalam.com
                  </p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem>
                <User className="mr-2 h-4 w-4" />
                <span>Hồ sơ</span>
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Settings className="mr-2 h-4 w-4" />
                <span>Cài đặt</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem>
                <LogOut className="mr-2 h-4 w-4" />
                <span>Đăng xuất</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
} 