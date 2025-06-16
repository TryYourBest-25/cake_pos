"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, MoreHorizontal, Edit, Trash2, Eye, ArrowUpDown, Loader2 } from "lucide-react";
import { ColumnDef } from "@tanstack/react-table";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { DataTable } from "@/components/ui/data-table";
import { CreateManagerForm } from "@/components/forms/create-manager-form";
import { Manager } from "@/types/api";
import { CreateManagerFormData } from "@/lib/validations/manager";
import { useManagersStore } from "@/stores/managers";
import { useUIStore } from "@/stores/ui";

function formatDate(date: Date): string {
  return new Intl.DateTimeFormat("vi-VN", {
    year: "numeric",
    month: "2-digit", 
    day: "2-digit",
  }).format(date);
}

export default function ManagersPage() {
  const router = useRouter();
  
  // Zustand stores
  const {
    managers,
    isLoading,
    isCreating,
    isDeleting,
    fetchManagers,
    createManager,
    deleteManager,
    setSelectedManager,
    selectedManager,
  } = useManagersStore();
  
  const { addNotification } = useUIStore();

  // Load managers on component mount
  useEffect(() => {
    fetchManagers();
  }, [fetchManagers]);

  const handleCreateManager = async (data: CreateManagerFormData) => {
    try {
      await createManager(data);
      addNotification({
        type: 'success',
        title: 'Thành công',
        message: 'Tạo quản lý thành công!',
      });
      setIsCreateDialogOpen(false);
    } catch (error) {
      console.error("Lỗi tạo quản lý:", error);
      addNotification({
        type: 'error',
        title: 'Lỗi',
        message: 'Không thể tạo quản lý. Vui lòng thử lại.',
      });
    }
  };

  const handleDeleteManager = async () => {
    if (!selectedManager) return;
    
    try {
      await deleteManager(selectedManager.id);
      addNotification({
        type: 'success',
        title: 'Thành công',
        message: 'Xóa quản lý thành công!',
      });
      setIsDeleteDialogOpen(false);
      setSelectedManager(null);
    } catch (error) {
      console.error("Lỗi xóa quản lý:", error);
      addNotification({
        type: 'error',
        title: 'Lỗi',
        message: 'Không thể xóa quản lý. Vui lòng thử lại.',
      });
    }
  };

  // UI state for dialogs (local state is fine for UI-only state)
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  const openDeleteDialog = (manager: Manager) => {
    setSelectedManager(manager);
    setIsDeleteDialogOpen(true);
  };

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
              <DropdownMenuItem onClick={() => router.push(`/users/managers/${manager.id}`)}>
                <Eye className="mr-2 h-4 w-4" />
                Xem Chi Tiết
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => router.push(`/users/managers/${manager.id}/edit`)}>
                <Edit className="mr-2 h-4 w-4" />
                Chỉnh Sửa
              </DropdownMenuItem>
              <DropdownMenuItem 
                className="text-destructive"
                onClick={() => openDeleteDialog(manager)}
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

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

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
        <Button onClick={() => setIsCreateDialogOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Thêm Quản Lý
        </Button>
      </div>

      {/* Managers Data Table */}
      <Card>
        <CardContent className="p-0">
          <DataTable 
            columns={columns} 
            data={managers}
            searchKey="name"
            searchPlaceholder="Tìm kiếm theo tên hoặc email..."
          />
        </CardContent>
      </Card>

      {/* Create Manager Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Thêm Quản Lý Mới</DialogTitle>
            <DialogDescription>
              Điền thông tin để tạo tài khoản quản lý mới
            </DialogDescription>
          </DialogHeader>
          <CreateManagerForm 
            onSubmit={handleCreateManager}
            isSubmitting={isCreating}
          />
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Xác nhận xóa</AlertDialogTitle>
            <AlertDialogDescription>
              Bạn có chắc chắn muốn xóa quản lý <strong>{selectedManager?.name}</strong>? 
              Hành động này không thể hoàn tác.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Hủy</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDeleteManager}
              disabled={isDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
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
    </div>
  );
}
