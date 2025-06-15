"use client";

import { Plus, MoreHorizontal, Edit, Trash2, Eye, ArrowUpDown } from "lucide-react";
import { ColumnDef } from "@tanstack/react-table";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { DataTable } from "@/components/ui/data-table";
import { Manager } from "@/types/api";

// Mock data - sẽ thay thế bằng API calls
const mockManagers: Manager[] = [
  {
    id: 1,
    name: "Nguyễn Văn An",
    email: "an.nguyen@company.com",
    avatar: "/avatars/01.png",
    isActive: true,
    createdAt: new Date("2024-01-15"),
    updatedAt: new Date("2024-01-15"),
    permissions: ["USER_MANAGEMENT", "PRODUCT_MANAGEMENT", "ORDER_MANAGEMENT"]
  },
  {
    id: 2, 
    name: "Trần Thị Bình",
    email: "binh.tran@company.com",
    avatar: "/avatars/02.png",
    isActive: true,
    createdAt: new Date("2024-02-20"),
    updatedAt: new Date("2024-02-20"),
    permissions: ["PRODUCT_MANAGEMENT", "REPORT_VIEW"]
  },
  {
    id: 3,
    name: "Lê Hoàng Cường", 
    email: "cuong.le@company.com",
    avatar: "/avatars/03.png",
    isActive: false,
    createdAt: new Date("2024-03-10"),
    updatedAt: new Date("2024-03-10"),
    permissions: ["ORDER_MANAGEMENT"]
  },
];

function formatDate(date: Date): string {
  return new Intl.DateTimeFormat("vi-VN", {
    year: "numeric",
    month: "2-digit", 
    day: "2-digit",
  }).format(date);
}

// Define columns for Tanstack Table
const columns: ColumnDef<Manager>[] = [
  {
    accessorKey: "name",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Người Dùng
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => {
      const manager = row.original;
      return (
        <div className="flex items-center gap-3">
          <Avatar className="h-8 w-8">
            <AvatarImage src={manager.avatar} alt={manager.name} />
            <AvatarFallback>
              {manager.name.split(' ').map(n => n[0]).join('')}
            </AvatarFallback>
          </Avatar>
          <div>
            <div className="font-medium">{manager.name}</div>
            <div className="text-sm text-muted-foreground">ID: {manager.id}</div>
          </div>
        </div>
      );
    },
  },
  {
    accessorKey: "email",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Email
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
  },
  {
    accessorKey: "isActive",
    header: "Trạng Thái",
    cell: ({ row }) => {
      const isActive = row.getValue("isActive") as boolean;
      return (
        <Badge variant={isActive ? "default" : "secondary"}>
          {isActive ? "Hoạt Động" : "Vô Hiệu Hóa"}
        </Badge>
      );
    },
  },
  {
    accessorKey: "permissions",
    header: "Quyền Hạn",
    cell: ({ row }) => {
      const permissions = row.getValue("permissions") as string[];
      if (!permissions) return null;
      
      return (
        <div className="flex flex-wrap gap-1">
          {permissions.slice(0, 2).map((permission) => (
            <Badge key={permission} variant="outline" className="text-xs">
              {permission.replace(/_/g, ' ')}
            </Badge>
          ))}
          {permissions.length > 2 && (
            <Badge variant="outline" className="text-xs">
              +{permissions.length - 2}
            </Badge>
          )}
        </div>
      );
    },
  },
  {
    accessorKey: "createdAt",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Ngày Tạo
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => {
      const date = row.getValue("createdAt") as Date;
      return formatDate(date);
    },
  },
  {
    id: "actions",
    header: "Thao Tác",
    cell: ({ row }) => {
      const manager = row.original;
      
      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem>
              <Eye className="mr-2 h-4 w-4" />
              Xem Chi Tiết
            </DropdownMenuItem>
            <DropdownMenuItem>
              <Edit className="mr-2 h-4 w-4" />
              Chỉnh Sửa
            </DropdownMenuItem>
            <DropdownMenuItem className="text-destructive">
              <Trash2 className="mr-2 h-4 w-4" />
              Xóa
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];

export default function ManagersPage() {
  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Quản Lý</h1>
          <p className="text-muted-foreground">
            Quản lý thông tin và quyền hạn của các quản lý viên
          </p>
        </div>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Thêm Quản Lý
        </Button>
      </div>

      {/* Managers Data Table */}
      <Card>
        <CardContent className="p-0">
          <DataTable 
            columns={columns} 
            data={mockManagers}
            searchKey="name"
            searchPlaceholder="Tìm kiếm theo tên hoặc email..."
          />
        </CardContent>
      </Card>
    </div>
  );
}
