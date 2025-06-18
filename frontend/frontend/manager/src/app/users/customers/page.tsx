"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, MoreHorizontal, Trash2, Eye, ArrowUpDown, Phone, CreditCard, Calendar, Users, Crown, Trash } from "lucide-react";
import { ColumnDef } from "@tanstack/react-table";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { DataTable } from "@/components/ui/data-table";
import { AuthGuard } from "@/components/auth/auth-guard";
import { CreateCustomerDialog } from "@/components/forms/create-customer-dialog";
import { CreateMembershipTypeDialog } from "@/components/forms/create-membership-type-dialog";
import { Customer, MembershipType } from "@/types/api";
import { useCustomerStore } from "@/stores/customers";
import { useMembershipTypeStore } from "@/stores/membership-types";



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

function getGenderLabel(gender?: string): string {
  switch (gender) {
    case 'MALE': return 'Nam';
    case 'FEMALE': return 'Nữ';
    case 'OTHER': return 'Khác';
    default: return 'Không xác định';
  }
}

// Customer columns function
const createCustomerColumns = (
  router: any, 
  membershipTypes: MembershipType[],
  selectedIds: Set<number>,
  onSelectCustomer: (id: number) => void,
  onDeselectCustomer: (id: number) => void
): ColumnDef<Customer>[] => [
  {
    id: "select",
    header: ({ table }) => {
      const allRowsSelected = table.getRowModel().rows.every(row => selectedIds.has(row.original.id));
      const someRowsSelected = table.getRowModel().rows.some(row => selectedIds.has(row.original.id));
      
      return (
        <Checkbox
          checked={allRowsSelected}
          onCheckedChange={(value) => {
            if (value) {
              table.getRowModel().rows.forEach(row => onSelectCustomer(row.original.id));
            } else {
              table.getRowModel().rows.forEach(row => onDeselectCustomer(row.original.id));
            }
          }}
          aria-label="Chọn tất cả"
        />
      );
    },
    cell: ({ row }) => (
      <Checkbox
        checked={selectedIds.has(row.original.id)}
        onCheckedChange={(value) => {
          if (value) {
            onSelectCustomer(row.original.id);
          } else {
            onDeselectCustomer(row.original.id);
          }
        }}
        aria-label="Chọn hàng"
      />
    ),
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: "name",
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      >
        Khách Hàng
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    cell: ({ row }) => {
      const customer = row.original;
      return (
        <div className="flex items-center gap-3">
          <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
            <Users className="h-4 w-4" />
          </div>
          <div>
            <div className="font-medium">{customer.name}</div>
            <div className="text-sm text-muted-foreground">ID: {customer.id}</div>
          </div>
        </div>
      );
    },
  },
  {
    accessorKey: "phone",
    header: "Điện Thoại",
    cell: ({ row }) => {
      const phone = row.getValue("phone") as string;
      return (
        <div className="flex items-center gap-2">
          <Phone className="h-4 w-4 text-muted-foreground" />
          <span>{phone}</span>
        </div>
      );
    },
  },
  {
    accessorKey: "membershipTypeId",
    header: "Loại Thành Viên",
    cell: ({ row }) => {
      const membershipTypeId = row.original.membershipTypeId;
      const membershipType = membershipTypes.find(mt => mt.id === membershipTypeId);
      
      if (!membershipType) return <span className="text-muted-foreground">Chưa có</span>;
      
      return (
        <div className="flex items-center gap-2">
          <Crown className="h-4 w-4 text-yellow-600" />
          <Badge variant="secondary">
            {membershipType.type}
          </Badge>
        </div>
      );
    },
  },
  {
    accessorKey: "currentPoints",
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      >
        Điểm Tích Lũy
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    cell: ({ row }) => {
      const points = row.getValue("currentPoints") as number;
      return (
        <div className="flex items-center gap-2">
          <CreditCard className="h-4 w-4 text-blue-600" />
          <span className="font-medium">{points || 0} điểm</span>
        </div>
      );
    },
  },
  {
    accessorKey: "gender",
    header: "Giới Tính",
    cell: ({ row }) => {
      const gender = row.getValue("gender") as string;
      return <Badge variant="outline">{getGenderLabel(gender)}</Badge>;
    },
  },
  {
    accessorKey: "createdAt",
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      >
        Ngày Tạo
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    cell: ({ row }) => {
      const date = row.getValue("createdAt") as Date;
      return (
        <div className="flex items-center gap-2">
          <Calendar className="h-4 w-4 text-muted-foreground" />
          {formatDate(date)}
        </div>
      );
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
            <DropdownMenuItem onClick={() => router.push(`/users/customers/${customer.id}`)}>
              <Eye className="mr-2 h-4 w-4" />
              Xem Chi Tiết
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

// Membership Type columns function  
const createMembershipTypeColumns = (router: any): ColumnDef<MembershipType>[] => [
  {
    accessorKey: "type",
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      >
        Loại Thành Viên
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    cell: ({ row }) => {
      const type = row.getValue("type") as string;
      return (
        <div className="flex items-center gap-2">
          <Crown className="h-4 w-4 text-yellow-600" />
          <span className="font-medium">{type}</span>
        </div>
      );
    },
  },
  {
    accessorKey: "discountValue",
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      >
        Giảm Giá
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    cell: ({ row }) => {
      const discount = row.getValue("discountValue") as number;
      return (
        <Badge variant="secondary">
          {discount}%
        </Badge>
      );
    },
  },
  {
    accessorKey: "requiredPoint",
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      >
        Điểm Yêu Cầu
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    cell: ({ row }) => {
      const points = row.getValue("requiredPoint") as number;
      return (
        <div className="flex items-center gap-2">
          <CreditCard className="h-4 w-4 text-blue-600" />
          <span>{points} điểm</span>
        </div>
      );
    },
  },
  {
    accessorKey: "description",
    header: "Mô Tả",
    cell: ({ row }) => {
      const description = row.getValue("description") as string;
      return description ? (
        <span className="max-w-[200px] truncate block" title={description}>
          {description}
        </span>
      ) : (
        <span className="text-muted-foreground">Không có mô tả</span>
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
    accessorKey: "validUntil",
    header: "Có Hiệu Lực Đến",
    cell: ({ row }) => {
      const validUntil = row.getValue("validUntil") as Date;
      return validUntil ? (
        <div className="flex items-center gap-2">
          <Calendar className="h-4 w-4 text-muted-foreground" />
          {formatDate(validUntil)}
        </div>
      ) : (
        <span className="text-muted-foreground">Vĩnh viễn</span>
      );
    },
  },
  {
    id: "actions",
    header: "Thao Tác",
    cell: ({ row }) => {
      const membershipType = row.original;
      
      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => router.push(`/users/membership-types/${membershipType.id}`)}>
              <Eye className="mr-2 h-4 w-4" />
              Xem Chi Tiết
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
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("customers");
  const [showBulkDeleteDialog, setShowBulkDeleteDialog] = useState(false);
  
  const { 
    customers, 
    currentPage: customerPage,
    totalPages: customerTotalPages,
    totalItems: customerTotal,
    selectedIds,
    fetchCustomers,
    isLoading: customersLoading,
    isDeleting,
    selectCustomer,
    deselectCustomer,
    selectAllCustomers,
    deselectAllCustomers,
    bulkDeleteCustomers
  } = useCustomerStore();
  
  const { 
    membershipTypes, 
    currentPage: membershipPage,
    totalPages: membershipTotalPages,
    totalItems: membershipTotal,
    fetchMembershipTypes,
    isLoading: membershipTypesLoading 
  } = useMembershipTypeStore();

  // Load data when component mounts
  useEffect(() => {
    if (activeTab === "customers") {
      fetchCustomers();
    } else if (activeTab === "membership-types") {
      fetchMembershipTypes();
    }
  }, [activeTab, fetchCustomers, fetchMembershipTypes]);

  // Bulk delete handler
  const handleBulkDelete = async () => {
    const selectedArray = Array.from(selectedIds);
    if (selectedArray.length === 0) return;

    try {
      await bulkDeleteCustomers({ ids: selectedArray });
      setShowBulkDeleteDialog(false);
      deselectAllCustomers();
    } catch (error) {
      // Error is handled in store
    }
  };

  return (
    <AuthGuard>
      <div className="space-y-6">
        {/* Page Header */}
        <div>
          <h1 className="text-3xl font-bold">Quản Lý Khách Hàng</h1>
          <p className="text-muted-foreground">
            Quản lý thông tin khách hàng và loại thành viên
          </p>
        </div>

        {/* Statistics Cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Tổng Khách Hàng</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
                         <CardContent>
               <div className="text-2xl font-bold">{customerTotal}</div>
               <p className="text-xs text-muted-foreground">
                 Trang {customerPage}/{customerTotalPages}
               </p>
             </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Loại Thành Viên</CardTitle>
              <Crown className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
                         <CardContent>
               <div className="text-2xl font-bold">{membershipTotal}</div>
               <p className="text-xs text-muted-foreground">
                 {membershipTypes.filter(mt => mt.isActive).length} đang hoạt động
               </p>
             </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Điểm Tích Lũy</CardTitle>
              <CreditCard className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {customers.reduce((acc, c) => acc + (c.currentPoints || 0), 0)}
              </div>
              <p className="text-xs text-muted-foreground">
                Tổng điểm của tất cả khách hàng
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Trung Bình</CardTitle>
              <CreditCard className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {customers.length > 0 
                  ? Math.round(customers.reduce((acc, c) => acc + (c.currentPoints || 0), 0) / customers.length)
                  : 0
                }
              </div>
              <p className="text-xs text-muted-foreground">
                Điểm tích lũy/khách hàng
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList>
            <TabsTrigger value="customers">Khách Hàng</TabsTrigger>
            <TabsTrigger value="membership-types">Loại Thành Viên</TabsTrigger>
          </TabsList>

          <TabsContent value="customers" className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-semibold">Danh Sách Khách Hàng</h2>
                <p className="text-sm text-muted-foreground">
                  Quản lý thông tin và lịch sử của khách hàng
                </p>
              </div>
              <div className="flex items-center gap-2">
                {selectedIds.size > 0 && (
                  <AlertDialog open={showBulkDeleteDialog} onOpenChange={setShowBulkDeleteDialog}>
                    <AlertDialogTrigger asChild>
                      <Button variant="destructive" size="sm">
                        <Trash className="mr-2 h-4 w-4" />
                        Xóa ({selectedIds.size})
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Xác nhận xóa khách hàng</AlertDialogTitle>
                        <AlertDialogDescription>
                          Bạn có chắc chắn muốn xóa {selectedIds.size} khách hàng đã chọn? 
                          Hành động này không thể hoàn tác.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Hủy</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={handleBulkDelete}
                          disabled={isDeleting}
                          className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                          {isDeleting ? "Đang xóa..." : "Xóa"}
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                )}
                <CreateCustomerDialog>
                  <Button>
                    <Plus className="mr-2 h-4 w-4" />
                    Thêm Khách Hàng
                  </Button>
                </CreateCustomerDialog>
              </div>
            </div>

            <Card>
              <CardContent className="p-0">
                                                 <DataTable 
                  columns={createCustomerColumns(router, membershipTypes, selectedIds, selectCustomer, deselectCustomer)} 
                  data={customers}
                  searchKey="name"
                  searchPlaceholder="Tìm kiếm theo tên hoặc số điện thoại..."
                />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="membership-types" className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-semibold">Loại Thành Viên</h2>
                <p className="text-sm text-muted-foreground">
                  Quản lý các loại thành viên và quyền lợi
                </p>
              </div>
              <CreateMembershipTypeDialog>
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  Thêm Loại Thành Viên
                </Button>
              </CreateMembershipTypeDialog>
            </div>

            <Card>
              <CardContent className="p-0">
                                                 <DataTable 
                  columns={createMembershipTypeColumns(router)} 
                  data={membershipTypes}
                  searchKey="type"
                  searchPlaceholder="Tìm kiếm theo tên loại thành viên..."
                />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AuthGuard>
  );
} 