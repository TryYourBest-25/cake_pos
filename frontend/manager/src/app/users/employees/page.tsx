"use client";

import { Plus, MoreHorizontal, Edit, Trash2, Eye, ArrowUpDown, Phone, MapPin } from "lucide-react";
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
import { Employee } from "@/types/api";

// Mock data - sẽ thay thế bằng API calls
const mockEmployees: Employee[] = [
  {
    id: 1,
    name: "Trần Văn Đức",
    email: "duc.tran@company.com",
    phone: "0901234567",
    avatar: "/avatars/04.png",
    position: "Nhân Viên Bán Hàng",
    isActive: true,
    createdAt: new Date("2024-01-20"),
    updatedAt: new Date("2024-01-20"),
    managerId: 1
  },
  {
    id: 2, 
    name: "Nguyễn Thị Hoa",
    email: "hoa.nguyen@company.com",
    phone: "0907654321",
    avatar: "/avatars/05.png",
    position: "Thu Ngân",
    isActive: true,
    createdAt: new Date("2024-02-15"),
    updatedAt: new Date("2024-02-15"),
    managerId: 1
  },
  {
    id: 3,
    name: "Lê Văn Minh", 
    email: "minh.le@company.com",
    phone: "0909876543",
    avatar: "/avatars/06.png",
    position: "Bảo Vệ",
    isActive: false,
    createdAt: new Date("2024-01-10"),
    updatedAt: new Date("2024-01-10"),
    managerId: 2
  },
  {
    id: 4,
    name: "Phạm Thị Lan",
    email: "lan.pham@company.com", 
    phone: "0912345678",
    avatar: "/avatars/07.png",
    position: "Kế Toán",
    isActive: true,
    createdAt: new Date("2024-03-01"),
    updatedAt: new Date("2024-03-01"),
    managerId: 1
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
const columns: ColumnDef<Employee>[] = [
  {
    accessorKey: "name",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Nhân Viên
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => {
      const employee = row.original;
      return (
        <div className="flex items-center gap-3">
          <Avatar className="h-8 w-8">
            <AvatarImage src={employee.avatar} alt={employee.name} />
            <AvatarFallback>
              {employee.name.split(' ').map(n => n[0]).join('')}
            </AvatarFallback>
          </Avatar>
          <div>
            <div className="font-medium">{employee.name}</div>
            <div className="text-sm text-muted-foreground">ID: {employee.id}</div>
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
    accessorKey: "phone",
    header: "Điện Thoại",
    cell: ({ row }) => {
      const phone = row.getValue("phone") as string;
      if (!phone) return null;
      
      return (
        <div className="flex items-center gap-2">
          <Phone className="h-4 w-4 text-muted-foreground" />
          <span>{phone}</span>
        </div>
      );
    },
  },
  {
    accessorKey: "position",
    header: "Chức Vụ",
    cell: ({ row }) => {
      const position = row.getValue("position") as string;
      if (!position) return null;
      
      return (
        <Badge variant="outline">
          {position}
        </Badge>
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
      const employee = row.original;
      
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

export default function EmployeesPage() {
  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Nhân Viên</h1>
          <p className="text-muted-foreground">
            Quản lý thông tin nhân viên trong hệ thống
          </p>
        </div>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Thêm Nhân Viên
        </Button>
      </div>

      {/* Employees Data Table */}
      <Card>
        <CardContent className="p-0">
          <DataTable 
            columns={columns} 
            data={mockEmployees}
            searchKey="name"
            searchPlaceholder="Tìm kiếm theo tên, email hoặc chức vụ..."
          />
        </CardContent>
      </Card>
    </div>
  );
} 