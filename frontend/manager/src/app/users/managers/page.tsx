"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, MoreHorizontal, Trash2, Eye, ArrowUpDown, Loader2, X } from "lucide-react";
import { ColumnDef } from "@tanstack/react-table";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
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

function formatDate(date: Date): string {
  return new Intl.DateTimeFormat("vi-VN", {
    year: "numeric",
    month: "2-digit", 
    day: "2-digit",
  }).format(date);
}

export default function ManagersPage() {
  const router = useRouter();
  
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isBulkDeleteDialogOpen, setIsBulkDeleteDialogOpen] = useState(false);
  const [selectedManager, setSelectedManager] = useState<Manager | null>(null);
  const [selectedManagers, setSelectedManagers] = useState<number[]>([]);

  const {
    managers,
    isLoading,
    isCreating,
    isDeleting,
    fetchManagers,
    createManager,
    deleteManager,
    bulkDeleteManagers,
  } = useManagersStore();



  useEffect(() => {
    fetchManagers();
  }, [fetchManagers]);

  const handleCreateManager = async (data: CreateManagerFormData) => {
    try {
      await createManager(data);
      setIsCreateDialogOpen(false);
      toast.success("Tạo quản lý thành công!");
    } catch (error) {
      console.error("Lỗi tạo quản lý:", error);
      toast.error("Không thể tạo quản lý. Vui lòng thử lại.");
    }
  };

  const handleDeleteManager = async () => {
    if (!selectedManager) return;
    
    try {
      await deleteManager(selectedManager.id);
      setIsDeleteDialogOpen(false);
      setSelectedManager(null);
      toast.success("Xóa quản lý thành công!");
    } catch (error) {
      console.error("Lỗi xóa quản lý:", error);
      toast.error("Không thể xóa quản lý. Vui lòng thử lại.");
    }
  };

  const handleBulkDelete = async () => {
    if (selectedManagers.length === 0) return;
    
    try {
      const result = await bulkDeleteManagers(selectedManagers);
      setIsBulkDeleteDialogOpen(false);
      setSelectedManagers([]);
      
      if (result.summary.failed > 0) {
        toast.warning(`Xóa thành công ${result.summary.success} quản lý. ${result.summary.failed} quản lý không thể xóa.`);
      } else {
        toast.success(`Xóa thành công ${result.summary.success} quản lý!`);
      }
    } catch (error) {
      console.error("Lỗi xóa nhiều quản lý:", error);
      toast.error("Không thể xóa các quản lý đã chọn. Vui lòng thử lại.");
    }
  };

  const openDeleteDialog = (manager: Manager) => {
    setSelectedManager(manager);
    setIsDeleteDialogOpen(true);
  };

  const openBulkDeleteDialog = () => {
    setIsBulkDeleteDialogOpen(true);
  };

  const handleSelectManager = (managerId: number, selected: boolean) => {
    if (selected) {
      setSelectedManagers([...selectedManagers, managerId]);
    } else {
      setSelectedManagers(selectedManagers.filter(id => id !== managerId));
    }
  };

  const handleSelectAll = (selected: boolean) => {
    if (selected) {
      setSelectedManagers(managers.map(m => m.id));
    } else {
      setSelectedManagers([]);
    }
  };

  const clearSelection = () => {
    setSelectedManagers([]);
  };

  const columns: ColumnDef<Manager>[] = [
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
          checked={selectedManagers.includes(row.original.id)}
          onCheckedChange={(value) => {
            row.toggleSelected(!!value);
            handleSelectManager(row.original.id, !!value);
          }}
          aria-label="Chọn hàng"
        />
      ),
      enableSorting: false,
      enableHiding: false,
    },
    {
      accessorKey: "name",
      header: "Quản Lý",
      cell: ({ row }) => {
        const manager = row.original;
        return (
          <div className="flex items-center gap-3">
            <Avatar className="h-8 w-8">
              <AvatarImage src={manager.avatar} alt={manager.name} />
              <AvatarFallback>
                {manager.name ? manager.name.split(' ').map(n => n[0]).join('') : 'N/A'}
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
      accessorKey: "phone",
      header: "Số điện thoại",
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

      {/* Bulk Actions Toolbar */}
      {selectedManagers.length > 0 && (
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <span className="text-sm text-muted-foreground">
                Đã chọn {selectedManagers.length} quản lý
              </span>
              <Button
                variant="ghost"
                size="sm"
                onClick={clearSelection}
              >
                <X className="h-4 w-4 mr-1" />
                Bỏ chọn
              </Button>
            </div>
            <div className="flex items-center space-x-2">
              <Button
                variant="destructive"
                size="sm"
                onClick={openBulkDeleteDialog}
                disabled={isDeleting}
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Xóa đã chọn
              </Button>
            </div>
          </div>
        </Card>
      )}

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
            onCancel={() => setIsCreateDialogOpen(false)}
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

      {/* Bulk Delete Confirmation Dialog */}
      <AlertDialog open={isBulkDeleteDialogOpen} onOpenChange={setIsBulkDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Xác nhận xóa nhiều quản lý</AlertDialogTitle>
            <AlertDialogDescription>
              Bạn có chắc chắn muốn xóa {selectedManagers.length} quản lý đã chọn? 
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
              {isDeleting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Đang xóa...
                </>
              ) : (
                `Xóa ${selectedManagers.length} quản lý`
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
