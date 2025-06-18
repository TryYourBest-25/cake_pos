"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { MoreHorizontal, Eye, Trash2, RefreshCw, Loader2, XCircle } from "lucide-react";
import { ColumnDef } from "@tanstack/react-table";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { DataTable } from "@/components/ui/data-table";
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

import { Order } from "@/types/api";
import { useOrdersStore } from "@/stores/orders";

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

function getPaymentStatusBadgeVariant(status?: string) {
  switch (status) {
    case 'PAID':
      return 'default';
    case 'PROCESSING':
      return 'secondary';
    case 'CANCELLED':
      return 'destructive';
    default:
      return 'outline';
  }
}

function getPaymentStatusDisplay(status?: string) {
  switch (status) {
    case 'PAID':
      return 'Đã Thanh Toán';
    case 'PROCESSING':
      return 'Đang Xử Lý';
    case 'CANCELLED':
      return 'Đã Hủy';
    default:
      return 'Chưa Thanh Toán';
  }
}

export default function CancelledOrdersPage() {
  const router = useRouter();
  
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  const {
    orders,
    isLoading,
    isDeleting,
    fetchOrdersByStatus,
    deleteOrder,
  } = useOrdersStore();

  useEffect(() => {
    fetchOrdersByStatus('CANCELLED');
  }, [fetchOrdersByStatus]);

  const handleRefresh = async () => {
    await fetchOrdersByStatus('CANCELLED');
    toast.success("Đã làm mới danh sách đơn hàng!");
  };

  const handleDeleteOrder = async () => {
    if (!selectedOrder) return;
    
    try {
      await deleteOrder(selectedOrder.id);
      setIsDeleteDialogOpen(false);
      setSelectedOrder(null);
      toast.success("Đã xóa đơn hàng thành công!");
    } catch (error) {
      console.error("Lỗi xóa đơn hàng:", error);
      toast.error("Không thể xóa đơn hàng. Vui lòng thử lại.");
    }
  };

  const openDeleteDialog = (order: Order) => {
    setSelectedOrder(order);
    setIsDeleteDialogOpen(true);
  };

  const columns: ColumnDef<Order>[] = [
    {
      accessorKey: "id",
      header: "ID Đơn Hàng",
      cell: ({ row }) => {
        return (
          <div className="font-medium">
            #{row.getValue("id")}
          </div>
        );
      },
    },
    {
      accessorKey: "customerName",
      header: "Khách Hàng",
      cell: ({ row }) => {
        const order = row.original;
        const customerName = order.customerName || order.customer?.name || "Khách lẻ";
        
        return (
          <div className="flex items-center gap-3">
            <Avatar className="h-8 w-8">
              <AvatarImage src="" alt={customerName} />
              <AvatarFallback>
                {customerName.split(' ').map(n => n[0]).join('').slice(0, 2)}
              </AvatarFallback>
            </Avatar>
            <div>
              <div className="font-medium">{customerName}</div>
              {order.customerId && (
                <div className="text-sm text-muted-foreground">ID: {order.customerId}</div>
              )}
            </div>
          </div>
        );
      },
    },
    {
      accessorKey: "employeeName",
      header: "Nhân Viên",
      cell: ({ row }) => {
        const order = row.original;
        const employeeName = order.employeeName || order.employee?.name || "N/A";
        
        return (
          <div>
            <div className="font-medium">{employeeName}</div>
            {order.employeeId && (
              <div className="text-sm text-muted-foreground">ID: {order.employeeId}</div>
            )}
          </div>
        );
      },
    },
    {
      accessorKey: "totalAmount",
      header: "Tổng Tiền",
      cell: ({ row }) => {
        return (
          <div className="text-right">
            <div className="font-medium text-gray-500 line-through">
              {formatCurrency(row.getValue("totalAmount"))}
            </div>
            <div className="text-sm text-red-600 font-medium">
              Đã hủy
            </div>
          </div>
        );
      },
    },
    {
      accessorKey: "paymentStatus",
      header: "Thanh Toán",
      cell: ({ row }) => {
        const paymentStatus = row.original.paymentStatus;
        return (
          <div className="space-y-1">
            <Badge variant={getPaymentStatusBadgeVariant(paymentStatus)}>
              {getPaymentStatusDisplay(paymentStatus)}
            </Badge>
            {row.original.paymentMethod && (
              <div className="text-xs text-muted-foreground">
                {row.original.paymentMethod}
              </div>
            )}
          </div>
        );
      },
    },
    {
      accessorKey: "createdAt",
      header: "Thời Gian",
      cell: ({ row }) => {
        const date = row.getValue("createdAt") as Date;
        return (
          <div className="text-sm">
            {formatDate(date)}
          </div>
        );
      },
    },
    {
      id: "actions",
      header: "Thao Tác",
      cell: ({ row }) => {
        const order = row.original;
        
        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => router.push(`/orders/${order.id}`)}>
                <Eye className="mr-2 h-4 w-4" />
                Xem Chi Tiết
              </DropdownMenuItem>
              <DropdownMenuItem 
                className="text-destructive"
                onClick={() => openDeleteDialog(order)}
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
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <XCircle className="h-8 w-8 text-red-600" />
            Đơn Hàng Đã Hủy
          </h1>
          <p className="text-muted-foreground">
            Danh sách các đơn hàng đã bị hủy bỏ
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" onClick={handleRefresh}>
            <RefreshCw className="mr-2 h-4 w-4" />
            Làm Mới
          </Button>
        </div>
      </div>

      {/* Orders Data Table */}
      <Card>
        <CardContent className="p-0">
          <DataTable 
            columns={columns} 
            data={orders}
            searchKey="id"
            searchPlaceholder="Tìm kiếm theo ID đơn hàng..."
          />
        </CardContent>
      </Card>

      {/* Delete Order Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Xác nhận xóa đơn hàng</AlertDialogTitle>
            <AlertDialogDescription>
              Bạn có chắc chắn muốn xóa đơn hàng <strong>#{selectedOrder?.id}</strong>? 
              Hành động này không thể hoàn tác và sẽ xóa vĩnh viễn tất cả dữ liệu liên quan.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Hủy</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDeleteOrder}
              disabled={isDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Đang xóa...
                </>
              ) : (
                "Xóa đơn hàng"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
} 