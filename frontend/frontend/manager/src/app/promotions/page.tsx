"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, MoreHorizontal, Trash2, Eye, ArrowUpDown, Loader2, X, Calendar, Percent } from "lucide-react";
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
import { DataTable } from "@/components/ui/data-table";
import { CreateDiscountForm } from "@/components/forms/create-discount-form";
import { Discount } from "@/types/api";
import { CreateDiscountDto } from "@/types/api";
import { useDiscountsStore } from "@/stores/discounts";

function formatDate(date: Date): string {
  return new Intl.DateTimeFormat("vi-VN", {
    year: "numeric",
    month: "2-digit", 
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(amount);
}

export default function PromotionsPage() {
  const router = useRouter();
  
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isBulkDeleteDialogOpen, setIsBulkDeleteDialogOpen] = useState(false);
  const [selectedDiscount, setSelectedDiscount] = useState<Discount | null>(null);
  const [selectedDiscounts, setSelectedDiscounts] = useState<number[]>([]);

  const {
    discounts,
    isLoading,
    isCreating,
    isDeleting,
    fetchDiscounts,
    createDiscount,
    deleteDiscount,
    bulkDeleteDiscounts,
  } = useDiscountsStore();

  useEffect(() => {
    fetchDiscounts();
  }, [fetchDiscounts]);

  const handleCreateDiscount = async (data: CreateDiscountDto) => {
    try {
      await createDiscount(data);
      setIsCreateDialogOpen(false);
      toast.success("Tạo chương trình khuyến mãi thành công!");
    } catch (error) {
      console.error("Lỗi tạo khuyến mãi:", error);
      toast.error("Không thể tạo chương trình khuyến mãi. Vui lòng thử lại.");
    }
  };

  const handleDeleteDiscount = async () => {
    if (!selectedDiscount) return;
    
    try {
      await deleteDiscount(selectedDiscount.id);
      setIsDeleteDialogOpen(false);
      setSelectedDiscount(null);
      toast.success("Xóa chương trình khuyến mãi thành công!");
    } catch (error) {
      console.error("Lỗi xóa khuyến mãi:", error);
      toast.error("Không thể xóa chương trình khuyến mãi. Vui lòng thử lại.");
    }
  };

  const handleBulkDelete = async () => {
    if (selectedDiscounts.length === 0) return;
    
    try {
      const result = await bulkDeleteDiscounts(selectedDiscounts);
      setIsBulkDeleteDialogOpen(false);
      setSelectedDiscounts([]);
      
      if (result.summary.failed > 0) {
        toast.warning(`Xóa thành công ${result.summary.success} chương trình. ${result.summary.failed} chương trình không thể xóa.`);
      } else {
        toast.success(`Xóa thành công ${result.summary.success} chương trình khuyến mãi!`);
      }
    } catch (error) {
      console.error("Lỗi xóa nhiều khuyến mãi:", error);
      toast.error("Không thể xóa các chương trình khuyến mãi đã chọn. Vui lòng thử lại.");
    }
  };

  const openDeleteDialog = (discount: Discount) => {
    setSelectedDiscount(discount);
    setIsDeleteDialogOpen(true);
  };

  const openBulkDeleteDialog = () => {
    setIsBulkDeleteDialogOpen(true);
  };

  const handleSelectDiscount = (discountId: number, selected: boolean) => {
    if (selected) {
      setSelectedDiscounts([...selectedDiscounts, discountId]);
    } else {
      setSelectedDiscounts(selectedDiscounts.filter(id => id !== discountId));
    }
  };

  const handleSelectAll = (selected: boolean) => {
    if (selected) {
      setSelectedDiscounts(discounts.map(d => d.id));
    } else {
      setSelectedDiscounts([]);
    }
  };

  const clearSelection = () => {
    setSelectedDiscounts([]);
  };

  const columns: ColumnDef<Discount>[] = [
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
          checked={selectedDiscounts.includes(row.original.id)}
          onCheckedChange={(value) => {
            row.toggleSelected(!!value);
            handleSelectDiscount(row.original.id, !!value);
          }}
          aria-label="Chọn hàng"
        />
      ),
      enableSorting: false,
      enableHiding: false,
    },
    {
      accessorKey: "name",
      header: "Chương Trình",
      cell: ({ row }) => {
        const discount = row.original;
        return (
          <div className="flex items-start gap-3">
            <div className="bg-primary/10 p-2 rounded-md">
              <Percent className="h-4 w-4 text-primary" />
            </div>
            <div>
              <div className="font-medium">{discount.name}</div>
              <div className="text-sm text-muted-foreground">
                Mã: <span className="font-mono font-semibold">{discount.couponCode}</span>
              </div>
              {discount.description && (
                <div className="text-sm text-muted-foreground mt-1 line-clamp-2">
                  {discount.description}
                </div>
              )}
            </div>
          </div>
        );
      },
    },
    {
      accessorKey: "discountValue",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Giá Trị
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        );
      },
      cell: ({ row }) => {
        const value = row.getValue("discountValue") as number;
        return (
          <div className="text-center">
            <div className="text-lg font-semibold text-primary">{value}%</div>
            <div className="text-sm text-muted-foreground">
              Tối đa {formatCurrency(row.original.maxDiscountAmount)}
            </div>
          </div>
        );
      },
    },
    {
      accessorKey: "minRequiredOrderValue",
      header: "Đơn Tối Thiểu",
      cell: ({ row }) => {
        const value = row.getValue("minRequiredOrderValue") as number;
        return (
          <div className="text-sm">
            {value > 0 ? formatCurrency(value) : "Không yêu cầu"}
          </div>
        );
      },
    },
    {
      accessorKey: "validUntil",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Thời Hạn
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        );
      },
      cell: ({ row }) => {
        const validFrom = row.original.validFrom;
        const validUntil = row.getValue("validUntil") as Date;
        const now = new Date();
        const isExpired = validUntil < now;
        const isNotStarted = validFrom && validFrom > now;
        
        return (
          <div className="text-sm">
            <div className="flex items-center gap-1">
              <Calendar className="h-3 w-3" />
              {validFrom && (
                <span>{formatDate(validFrom)} - </span>
              )}
              <span>{formatDate(validUntil)}</span>
            </div>
            {isExpired && (
              <Badge variant="secondary" className="text-xs mt-1">Hết hạn</Badge>
            )}
            {isNotStarted && (
              <Badge variant="outline" className="text-xs mt-1">Chưa bắt đầu</Badge>
            )}
          </div>
        );
      },
    },
    {
      accessorKey: "currentUses",
      header: "Sử Dụng",
      cell: ({ row }) => {
        const currentUses = row.getValue("currentUses") as number || 0;
        const maxUses = row.original.maxUses;
        
        return (
          <div className="text-sm">
            <div className="font-medium">{currentUses}</div>
            {maxUses && (
              <div className="text-muted-foreground">/ {maxUses}</div>
            )}
          </div>
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
      id: "actions",
      header: "Thao Tác",
      cell: ({ row }) => {
        const discount = row.original;
        
        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => router.push(`/promotions/${discount.id}`)}>
                <Eye className="mr-2 h-4 w-4" />
                Xem Chi Tiết
              </DropdownMenuItem>
              <DropdownMenuItem 
                className="text-destructive"
                onClick={() => openDeleteDialog(discount)}
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
          <h1 className="text-3xl font-bold">Chương Trình Khuyến Mãi</h1>
          <p className="text-muted-foreground">
            Quản lý các chương trình giảm giá và khuyến mãi của cửa hàng
          </p>
        </div>
        <Button onClick={() => setIsCreateDialogOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Thêm Khuyến Mãi
        </Button>
      </div>

      {/* Bulk Actions Toolbar */}
      {selectedDiscounts.length > 0 && (
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <span className="text-sm text-muted-foreground">
                Đã chọn {selectedDiscounts.length} chương trình
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

      {/* Discounts Data Table */}
      <Card>
        <CardContent className="p-0">
          <DataTable 
            columns={columns} 
            data={discounts}
            searchKey="name"
            searchPlaceholder="Tìm kiếm theo tên chương trình hoặc mã giảm giá..."
          />
        </CardContent>
      </Card>

      {/* Create Discount Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Thêm Chương Trình Khuyến Mãi</DialogTitle>
            <DialogDescription>
              Tạo mới chương trình giảm giá và khuyến mãi cho khách hàng
            </DialogDescription>
          </DialogHeader>
          <CreateDiscountForm 
            onSubmit={handleCreateDiscount}
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
              Bạn có chắc chắn muốn xóa chương trình khuyến mãi <strong>{selectedDiscount?.name}</strong>? 
              Hành động này không thể hoàn tác.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Hủy</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDeleteDiscount}
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
            <AlertDialogTitle>Xác nhận xóa nhiều chương trình</AlertDialogTitle>
            <AlertDialogDescription>
              Bạn có chắc chắn muốn xóa {selectedDiscounts.length} chương trình khuyến mãi đã chọn? 
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
                `Xóa ${selectedDiscounts.length} chương trình`
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
} 