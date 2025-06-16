"use client";

import { Plus, MoreHorizontal, Edit, Trash2, Eye, ArrowUpDown, Phone, MapPin, DollarSign, Calendar } from "lucide-react";
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
import { Customer } from "@/types/api";

// Mock data - sẽ thay thế bằng API calls
const mockCustomers: Customer[] = [
  {
    id: 1,
    name: "Nguyễn Thị Mai",
    email: "mai.nguyen@gmail.com",
    phone: "0901234567",
    avatar: "/avatars/08.png",
    address: "123 Trần Hưng Đạo, Q1, TP.HCM",
    dateOfBirth: new Date("1990-05-15"),
    isActive: true,
    membershipTypeId: 1,
    createdAt: new Date("2024-01-15"),
    updatedAt: new Date("2024-01-15"),
    totalSpent: 2500000,
    visitCount: 15
  },
  {
    id: 2, 
    name: "Trần Văn Hùng",
    email: "hung.tran@yahoo.com",
    phone: "0907654321",
    avatar: "/avatars/09.png",
    address: "456 Nguyễn Huệ, Q1, TP.HCM",
    dateOfBirth: new Date("1985-08-20"),
    isActive: true,
    membershipTypeId: 2,
    createdAt: new Date("2024-02-10"),
    updatedAt: new Date("2024-02-10"),
    totalSpent: 5200000,
    visitCount: 28
  },
  {
    id: 3,
    name: "Lê Thị Hương", 
    email: "huong.le@outlook.com",
    phone: "0909876543",
    avatar: "/avatars/10.png",
    address: "789 Lê Lợi, Q3, TP.HCM",
    dateOfBirth: new Date("1992-12-03"),
    isActive: false,
    membershipTypeId: 1,
    createdAt: new Date("2024-01-05"),
    updatedAt: new Date("2024-01-05"),
    totalSpent: 850000,
    visitCount: 7
  },
  {
    id: 4,
    name: "Phạm Minh Tuấn",
    email: "tuan.pham@gmail.com", 
    phone: "0912345678",
    avatar: "/avatars/11.png",
    address: "321 Võ Thị Sáu, Q3, TP.HCM",
    dateOfBirth: new Date("1988-03-18"),
    isActive: true,
    membershipTypeId: 3,
    createdAt: new Date("2023-12-20"),
    updatedAt: new Date("2023-12-20"),
    totalSpent: 8750000,
    visitCount: 45
  },
];

function formatDate(date: Date): string {
  return new Intl.DateTimeFormat("vi-VN", {
    year: "numeric",
    month: "2-digit", 
    day: "2-digit",
  }).format(date);
}

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(amount);
}

// Define columns for Tanstack Table
const columns: ColumnDef<Customer>[] = [
  {
    accessorKey: "name",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Khách Hàng
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => {
      const customer = row.original;
      return (
        <div className="flex items-center gap-3">
          <Avatar className="h-8 w-8">
            <AvatarImage src={customer.avatar} alt={customer.name} />
            <AvatarFallback>
              {customer.name.split(' ').map(n => n[0]).join('')}
            </AvatarFallback>
          </Avatar>
          <div>
            <div className="font-medium">{customer.name}</div>
            <div className="text-sm text-muted-foreground">ID: {customer.id}</div>
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
    accessorKey: "address",
    header: "Địa Chỉ",
    cell: ({ row }) => {
      const address = row.getValue("address") as string;
      if (!address) return null;
      
      return (
        <div className="flex items-center gap-2 max-w-[200px]">
          <MapPin className="h-4 w-4 text-muted-foreground flex-shrink-0" />
          <span className="truncate" title={address}>{address}</span>
        </div>
      );
    },
  },
  {
    accessorKey: "totalSpent",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Tổng Chi Tiêu
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => {
      const totalSpent = row.getValue("totalSpent") as number;
      if (!totalSpent) return null;
      
      return (
        <div className="flex items-center gap-2">
          <DollarSign className="h-4 w-4 text-green-600" />
          <span className="font-medium">{formatCurrency(totalSpent)}</span>
        </div>
      );
    },
  },
  {
    accessorKey: "visitCount",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Lần Ghé Thăm
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => {
      const visitCount = row.getValue("visitCount") as number;
      return (
        <Badge variant="outline">
          {visitCount} lần
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
      const customer = row.original;
      
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

export default function CustomersPage() {
  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Khách Hàng</h1>
          <p className="text-muted-foreground">
            Quản lý thông tin khách hàng và lịch sử mua hàng
          </p>
        </div>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Thêm Khách Hàng
        </Button>
      </div>

      {/* Statistics Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tổng Khách Hàng</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{mockCustomers.length}</div>
            <p className="text-xs text-muted-foreground">
              +2 từ tháng trước
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Khách Hàng Hoạt Động</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {mockCustomers.filter(c => c.isActive).length}
            </div>
            <p className="text-xs text-muted-foreground">
              {Math.round((mockCustomers.filter(c => c.isActive).length / mockCustomers.length) * 100)}% tổng số
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tổng Doanh Thu</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(mockCustomers.reduce((acc, c) => acc + (c.totalSpent || 0), 0))}
            </div>
            <p className="text-xs text-muted-foreground">
              +15% từ tháng trước
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Trung Bình Mỗi Khách</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(mockCustomers.reduce((acc, c) => acc + (c.totalSpent || 0), 0) / mockCustomers.length)}
            </div>
            <p className="text-xs text-muted-foreground">
              +8% từ tháng trước
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Customers Data Table */}
      <Card>
        <CardContent className="p-0">
          <DataTable 
            columns={columns} 
            data={mockCustomers}
            searchKey="name"
            searchPlaceholder="Tìm kiếm theo tên, email hoặc số điện thoại..."
          />
        </CardContent>
      </Card>
    </div>
  );
} 