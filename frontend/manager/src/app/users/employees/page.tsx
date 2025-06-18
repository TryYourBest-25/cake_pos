"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { 
  Plus, 
  MoreHorizontal, 
  Trash2, 
  Users, 
  Eye,
  ArrowUpDown,
  Loader2,
  X
} from "lucide-react";
import { ColumnDef } from "@tanstack/react-table";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Checkbox } from "@/components/ui/checkbox";


import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
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
} from "@/components/ui/alert-dialog";
import { DataTable } from "@/components/ui/data-table";
import { AuthGuard } from "@/components/auth/auth-guard";
import { CreateEmployeeDialog } from "@/components/forms/create-employee-dialog";
import { useEmployeeStore } from "@/stores/employees";
import { Employee } from "@/types/api";
import { CreateEmployeeFormData } from "@/lib/validations/employee";

function formatDate(date: Date): string {
  return new Intl.DateTimeFormat("vi-VN", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(date);
}

export default function EmployeesPage() {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState("");
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isBulkDeleteDialogOpen, setIsBulkDeleteDialogOpen] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
  const [selectedEmployees, setSelectedEmployees] = useState<number[]>([]);
  
  const {
    employees,
    totalItems,
    isLoading,
    error,
    currentPage,
    totalPages,
    fetchEmployees,
    createEmployee,
    deleteEmployee,
    bulkDeleteEmployees,
    isCreating,
    isDeleting,
  } = useEmployeeStore();

  useEffect(() => {
    fetchEmployees({ page: 1, limit: 10 });
  }, [fetchEmployees]);

  const handleCreateEmployee = async (data: CreateEmployeeFormData) => {
    try {
      await createEmployee(data);
      setShowCreateDialog(false);
      toast.success("Tạo nhân viên thành công!");
    } catch (error) {
      console.error("Lỗi tạo nhân viên:", error);
      toast.error("Lỗi khi tạo nhân viên. Vui lòng thử lại.");
    }
  };

  const handleDeleteEmployee = async () => {
    if (!selectedEmployee) return;
    
    try {
      await deleteEmployee(selectedEmployee.id);
      setIsDeleteDialogOpen(false);
      setSelectedEmployee(null);
      toast.success("Xóa nhân viên thành công!");
    } catch (error) {
      console.error("Lỗi xóa nhân viên:", error);
      toast.error("Không thể xóa nhân viên. Vui lòng thử lại.");
    }
  };

  const handleBulkDelete = async () => {
    if (selectedEmployees.length === 0) return;
    
    try {
      const result = await bulkDeleteEmployees({ ids: selectedEmployees });
      setIsBulkDeleteDialogOpen(false);
      setSelectedEmployees([]);
      
      if (result.summary.failed > 0) {
        toast.warning(`Xóa thành công ${result.summary.success} nhân viên. ${result.summary.failed} nhân viên không thể xóa.`);
      } else {
        toast.success(`Xóa thành công ${result.summary.success} nhân viên!`);
      }
    } catch (error) {
      console.error("Lỗi xóa nhiều nhân viên:", error);
      toast.error("Không thể xóa các nhân viên đã chọn. Vui lòng thử lại.");
    }
  };

  const openDeleteDialog = (employee: Employee) => {
    setSelectedEmployee(employee);
    setIsDeleteDialogOpen(true);
  };

  const openBulkDeleteDialog = () => {
    setIsBulkDeleteDialogOpen(true);
  };

  const handleSelectEmployee = (employeeId: number, selected: boolean) => {
    if (selected) {
      setSelectedEmployees([...selectedEmployees, employeeId]);
    } else {
      setSelectedEmployees(selectedEmployees.filter(id => id !== employeeId));
    }
  };

  const handleSelectAll = (selected: boolean) => {
    if (selected) {
      setSelectedEmployees(employees.map(e => e.id));
    } else {
      setSelectedEmployees([]);
    }
  };

  const clearSelection = () => {
    setSelectedEmployees([]);
  };

  const handleViewEmployee = (id: number) => {
    router.push(`/users/employees/${id}`);
  };

  const filteredEmployees = employees.filter((employee) =>
    employee.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    employee.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    employee.phone.includes(searchTerm) ||
    employee.position?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    employee.username?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalEmployees = employees.length;

  const columns: ColumnDef<Employee>[] = [
    {
      id: "select",
      header: ({ table }) => (
        <Checkbox
          checked={table.getIsAllPageRowsSelected()}
          onCheckedChange={(value) => {
            table.toggleAllPageRowsSelected(!!value);
            handleSelectAll(!!value);
          }}
          aria-label="Chọn tất cả"
        />
      ),
      cell: ({ row }) => (
        <Checkbox
          checked={selectedEmployees.includes(row.original.id)}
          onCheckedChange={(value) => {
            row.toggleSelected(!!value);
            handleSelectEmployee(row.original.id, !!value);
          }}
          aria-label="Chọn hàng"
        />
      ),
      enableSorting: false,
      enableHiding: false,
    },
    {
      accessorKey: "name",
      header: "Nhân Viên",
      cell: ({ row }) => {
        const employee = row.original;
        return (
          <div className="flex items-center gap-3">
            <Avatar className="h-8 w-8">
              <AvatarFallback>
                {employee.name ? employee.name.split(' ').map(n => n[0]).join('') : 'NV'}
              </AvatarFallback>
            </Avatar>
            <div>
              <div className="font-medium">{employee.name}</div>
              <div className="text-sm text-muted-foreground">@{employee.username}</div>
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
      cell: ({ row }) => <div className="lowercase">{row.getValue("email")}</div>,
    },
    {
      accessorKey: "phone",
      header: "Số Điện Thoại",
      cell: ({ row }) => <div>{row.getValue("phone")}</div>,
    },
    {
      accessorKey: "position",
      header: "Chức Vụ",
      cell: ({ row }) => {
        const position = row.getValue("position") as string;
        return <Badge variant="outline">{position}</Badge>;
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
        return <div>{formatDate(date)}</div>;
      },
    },
    {
      id: "actions",
      enableHiding: false,
      cell: ({ row }) => {
        const employee = row.original;

        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <span className="sr-only">Mở menu</span>
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => handleViewEmployee(employee.id)}>
                <Eye className="mr-2 h-4 w-4" />
                Xem Chi Tiết
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem 
                className="text-red-600"
                onClick={() => openDeleteDialog(employee)}
                disabled={isDeleting}
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Xóa
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    },
  ];

  return (
    <AuthGuard>
      <div className="space-y-6">
        {/* Page Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">Quản Lý Nhân Viên</h1>
            <p className="text-muted-foreground">
              Quản lý thông tin và tài khoản nhân viên
            </p>
          </div>
          <Button onClick={() => setShowCreateDialog(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Thêm Nhân Viên
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-1">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Tổng Nhân Viên</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalEmployees}</div>
              <p className="text-xs text-muted-foreground">
                nhân viên trong hệ thống
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Bulk Actions */}
        {selectedEmployees.length > 0 && (
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">
                    Đã chọn {selectedEmployees.length} nhân viên
                  </span>
                  <Button variant="outline" size="sm" onClick={clearSelection}>
                    <X className="mr-2 h-4 w-4" />
                    Bỏ chọn
                  </Button>
                </div>
                <Button 
                  variant="destructive" 
                  size="sm" 
                  onClick={openBulkDeleteDialog}
                  disabled={isDeleting}
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Xóa đã chọn
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Data Table */}
        <Card>
          <CardContent className="p-0">
            {isLoading ? (
              <div className="flex justify-center items-center py-8">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                  <p className="mt-2 text-sm text-muted-foreground">Đang tải...</p>
                </div>
              </div>
            ) : (
              <DataTable 
                columns={columns} 
                data={filteredEmployees}
                searchKey="name"
                searchPlaceholder="Tìm kiếm theo tên, email hoặc chức vụ..."
              />
            )}
          </CardContent>
        </Card>

        {error && (
          <div className="text-center py-4">
            <p className="text-destructive">{error}</p>
            <Button 
              variant="outline" 
              onClick={() => fetchEmployees({ page: currentPage, limit: 10 })}
              className="mt-2"
            >
              Thử Lại
            </Button>
          </div>
        )}

        {/* Create Employee Dialog */}
        <CreateEmployeeDialog
          open={showCreateDialog}
          onOpenChange={setShowCreateDialog}
          onSubmit={handleCreateEmployee}
          isSubmitting={isCreating}
        />

        {/* Delete Confirmation Dialog */}
        <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Xác nhận xóa nhân viên</AlertDialogTitle>
              <AlertDialogDescription>
                Bạn có chắc chắn muốn xóa nhân viên &ldquo;{selectedEmployee?.name}&rdquo;? 
                Hành động này không thể hoàn tác.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Hủy</AlertDialogCancel>
              <AlertDialogAction 
                onClick={handleDeleteEmployee}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                disabled={isDeleting}
              >
                {isDeleting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Đang xóa...
                  </>
                ) : (
                  "Xóa"
                )}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        {/* Bulk Delete Confirmation Dialog */}
        <AlertDialog open={isBulkDeleteDialogOpen} onOpenChange={setIsBulkDeleteDialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Xác nhận xóa nhiều nhân viên</AlertDialogTitle>
              <AlertDialogDescription>
                Bạn có chắc chắn muốn xóa {selectedEmployees.length} nhân viên đã chọn? 
                Hành động này không thể hoàn tác.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Hủy</AlertDialogCancel>
              <AlertDialogAction 
                onClick={handleBulkDelete}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                disabled={isDeleting}
              >
                {isDeleting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Đang xóa...
                  </>
                ) : (
                  `Xóa ${selectedEmployees.length} nhân viên`
                )}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </AuthGuard>
  );
} 