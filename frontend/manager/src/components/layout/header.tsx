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
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
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
const breadcrumbMap: Record<string, { label: string; href?: string }[]> = {
  "/dashboard": [
    { label: "Dashboard" }
  ],
  "/users": [
    { label: "Dashboard", href: "/dashboard" },
    { label: "Người Dùng" }
  ],
  "/users/managers": [
    { label: "Dashboard", href: "/dashboard" },
    { label: "Người Dùng", href: "/users" },
    { label: "Quản Lý" }
  ],
  "/users/employees": [
    { label: "Dashboard", href: "/dashboard" },
    { label: "Người Dùng", href: "/users" },
    { label: "Nhân Viên" }
  ],
  "/users/customers": [
    { label: "Dashboard", href: "/dashboard" },
    { label: "Người Dùng", href: "/users" },
    { label: "Khách Hàng" }
  ],
};

// Dynamic breadcrumb for manager detail and edit pages
function getDynamicBreadcrumbs(pathname: string): { label: string; href?: string }[] {
  // Manager detail page: /users/managers/[id]
  if (pathname.match(/^\/users\/managers\/\d+$/)) {
    return [
      { label: "Dashboard", href: "/dashboard" },
      { label: "Người Dùng", href: "/users" },
      { label: "Quản Lý", href: "/users/managers" },
      { label: "Chi Tiết" }
    ];
  }
  
  // Manager edit page: /users/managers/[id]/edit
  if (pathname.match(/^\/users\/managers\/\d+\/edit$/)) {
    const managerId = pathname.split('/')[3];
    return [
      { label: "Dashboard", href: "/dashboard" },
      { label: "Người Dùng", href: "/users" },
      { label: "Quản Lý", href: "/users/managers" },
      { label: "Chi Tiết", href: `/users/managers/${managerId}` },
      { label: "Chỉnh Sửa" }
    ];
  }
  
  return breadcrumbMap[pathname] || [{ label: "Dashboard", href: "/dashboard" }];
}

export function Header({ onMenuClick, className }: HeaderProps) {
  const pathname = usePathname();
  const breadcrumbs = getDynamicBreadcrumbs(pathname);

  return (
    <header className="border-b bg-background px-6 py-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={onMenuClick}
            className="md:hidden"
          >
            <Menu className="h-4 w-4" />
          </Button>
          
          <div className="hidden sm:block">
            <Breadcrumb>
              <BreadcrumbList>
                {breadcrumbs.map((breadcrumb, index) => (
                  <React.Fragment key={breadcrumb.label}>
                    <BreadcrumbItem>
                      {breadcrumb.href ? (
                        <BreadcrumbLink href={breadcrumb.href}>
                          {breadcrumb.label}
                        </BreadcrumbLink>
                      ) : (
                        <BreadcrumbPage>{breadcrumb.label}</BreadcrumbPage>
                      )}
                    </BreadcrumbItem>
                    {index < breadcrumbs.length - 1 && <BreadcrumbSeparator />}
                  </React.Fragment>
                ))}
              </BreadcrumbList>
            </Breadcrumb>
          </div>
        </div>

        <div className="flex items-center gap-4">
          {/* Search */}
          <div className="relative hidden md:block">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Tìm kiếm..."
              className="w-64 pl-8"
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

          {/* User Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                <Avatar className="h-8 w-8">
                  <AvatarImage src="/avatars/01.png" alt="Avatar" />
                  <AvatarFallback>AD</AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="end" forceMount>
              <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium leading-none">Admin</p>
                  <p className="text-xs leading-none text-muted-foreground">
                    admin@example.com
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