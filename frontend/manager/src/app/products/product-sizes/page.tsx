"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, MoreHorizontal, Trash2, Eye, ArrowUpDown, Loader2, Package } from "lucide-react";
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
import { CreateProductSizeDialog } from "@/components/forms/create-product-size-dialog";
import { ProductSize } from "@/types/api";
import { CreateProductSizeFormData } from "@/lib/validations/product-size";
import { useProductSizeStore } from "@/stores/product-sizes";

function formatDate(date: Date): string {
  return new Intl.DateTimeFormat("vi-VN", {
    year: "numeric",
    month: "2-digit", 
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

export default function ProductSizesPage() {
  const router = useRouter();
  
  const {
    productSizes,
    isLoading,
    isCreating,
    isDeleting,
    fetchProductSizes,
    createProductSize,
    deleteProductSize,
  } = useProductSizeStore();

  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedProductSize, setSelectedProductSize] = useState<ProductSize | null>(null);

  useEffect(() => {
    fetchProductSizes();
  }, [fetchProductSizes]);

  const handleCreateProductSize = async (data: CreateProductSizeFormData) => {
    try {
      await createProductSize(data);
      setIsCreateDialogOpen(false);
      toast.success("Tạo kích thước sản phẩm thành công!");
    } catch (error) {
      console.error("Lỗi tạo kích thước sản phẩm:", error);
      toast.error("Không thể tạo kích thước sản phẩm. Vui lòng thử lại.");
    }
  };



  const handleDeleteProductSize = async () => {
    if (!selectedProductSize) return;
    
    try {
      await deleteProductSize(selectedProductSize.id);
      setIsDeleteDialogOpen(false);
      setSelectedProductSize(null);
      toast.success("Xóa kích thước sản phẩm thành công!");
    } catch (error) {
      console.error("Lỗi xóa kích thước sản phẩm:", error);
      toast.error("Không thể xóa kích thước sản phẩm. Vui lòng thử lại.");
    }
  };



  const openDeleteDialog = (productSize: ProductSize) => {
    setSelectedProductSize(productSize);
    setIsDeleteDialogOpen(true);
  };

  const handleViewProductSize = (productSizeId: number) => {
    router.push(`/products/product-sizes/${productSizeId}`);
  };

  const columns: ColumnDef<ProductSize>[] = [
    {
      accessorKey: "name",
      header: "Kích Thước",
      cell: ({ row }) => {
        const productSize = row.original;
        return (
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center">
              <Package className="h-4 w-4 text-primary" />
            </div>
            <div>
              <div className="font-medium">{productSize.name}</div>
              <div className="text-sm text-muted-foreground">ID: {productSize.id}</div>
            </div>
          </div>
        );
      },
    },
    {
      accessorKey: "unit",
      header: "Đơn Vị",
      cell: ({ row }) => {
        const unit = row.getValue("unit") as string;
        return <Badge variant="outline">{unit}</Badge>;
      },
    },
    {
      accessorKey: "quantity",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Số Lượng
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        );
      },
      cell: ({ row }) => {
        const quantity = row.getValue("quantity") as number;
        return <span className="font-medium">{quantity}</span>;
      },
    },
    {
      accessorKey: "description",
      header: "Mô Tả",
      cell: ({ row }) => {
        const description = row.original.description;
        return (
          <div className="max-w-[200px] truncate text-sm">
            {description || <span className="text-muted-foreground italic">Không có mô tả</span>}
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
        return <span className="text-sm">{formatDate(date)}</span>;
      },
    },
    {
      id: "actions",
      header: "Thao Tác",
      cell: ({ row }) => {
        const productSize = row.original;
        
        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => handleViewProductSize(productSize.id)}>
                <Eye className="mr-2 h-4 w-4" />
                Xem Chi Tiết
              </DropdownMenuItem>
              <DropdownMenuItem 
                className="text-destructive"
                onClick={() => openDeleteDialog(productSize)}
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
          <h1 className="text-3xl font-bold">Kích Thước Sản Phẩm</h1>
          <p className="text-muted-foreground">
            Quản lý các kích thước có thể áp dụng cho sản phẩm
          </p>
        </div>
        <Button onClick={() => setIsCreateDialogOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Thêm Kích Thước
        </Button>
      </div>

      {/* Product Sizes Data Table */}
      <Card>
        <CardContent className="p-0">
          <DataTable 
            columns={columns} 
            data={productSizes}
            searchKey="name"
            searchPlaceholder="Tìm kiếm theo tên kích thước..."
          />
        </CardContent>
      </Card>

      {/* Create Product Size Dialog */}
      <CreateProductSizeDialog
        open={isCreateDialogOpen}
        onOpenChange={setIsCreateDialogOpen}
        onSubmit={handleCreateProductSize}
        isSubmitting={isCreating}
      />



      {/* Delete Confirmation Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Xác nhận xóa</AlertDialogTitle>
            <AlertDialogDescription>
              Bạn có chắc chắn muốn xóa kích thước <strong>{selectedProductSize?.name} ({selectedProductSize?.unit})</strong>? 
              Hành động này không thể hoàn tác và có thể ảnh hưởng đến các sản phẩm đang sử dụng kích thước này.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Hủy</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDeleteProductSize}
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