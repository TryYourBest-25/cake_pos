"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useParams } from "next/navigation";
import { ArrowLeft, Package, User, CreditCard, Tag, Clock, Phone, FileText, Download, Printer, Eye } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import { useOrdersStore } from "@/stores/orders";
import { invoiceService } from "@/lib/services";

function formatDate(date: Date): string {
  return new Intl.DateTimeFormat("vi-VN", {
    year: "numeric",
    month: "long", 
    day: "numeric",
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

function getStatusBadgeVariant(status: string) {
  switch (status) {
    case 'PROCESSING':
      return 'default';
    case 'COMPLETED':
      return 'default';
    case 'CANCELLED':
      return 'secondary';
    default:
      return 'secondary';
  }
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

function getStatusDisplay(status: string) {
  switch (status) {
    case 'PROCESSING':
      return 'Đang Xử Lý';
    case 'COMPLETED':
      return 'Hoàn Thành';
    case 'CANCELLED':
      return 'Đã Hủy';
    default:
      return status;
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

export default function OrderDetailPage() {
  const router = useRouter();
  const params = useParams();
  const orderId = parseInt(params.id as string);
  const [isInvoiceLoading, setIsInvoiceLoading] = useState(false);

  const { currentOrder, isLoading, fetchOrderById } = useOrdersStore();

  useEffect(() => {
    if (orderId) {
      fetchOrderById(orderId);
    }
  }, [orderId, fetchOrderById]);

  // Invoice handlers
  const handleViewInvoiceHTML = async () => {
    try {
      setIsInvoiceLoading(true);
      await invoiceService.viewInvoiceHTML(orderId);
    } catch (error) {
      console.error('Lỗi xem hóa đơn HTML:', error);
      toast.error('Không thể xem hóa đơn. Vui lòng thử lại.');
    } finally {
      setIsInvoiceLoading(false);
    }
  };

  const handleDownloadPDF = async () => {
    try {
      setIsInvoiceLoading(true);
      await invoiceService.downloadInvoicePDF(orderId);
      toast.success('Đã tải hóa đơn PDF thành công!');
    } catch (error) {
      console.error('Lỗi tải hóa đơn PDF:', error);
      toast.error('Không thể tải hóa đơn PDF. Vui lòng thử lại.');
    } finally {
      setIsInvoiceLoading(false);
    }
  };

  const handlePrintInvoice = async () => {
    try {
      setIsInvoiceLoading(true);
      await invoiceService.printInvoice(orderId);
    } catch (error) {
      console.error('Lỗi in hóa đơn:', error);
      toast.error('Không thể in hóa đơn. Vui lòng thử lại.');
    } finally {
      setIsInvoiceLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-2 text-muted-foreground">Đang tải chi tiết đơn hàng...</p>
        </div>
      </div>
    );
  }

  if (!currentOrder) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold text-gray-900">Không tìm thấy đơn hàng</h2>
        <p className="text-gray-600 mt-2">Đơn hàng này có thể đã bị xóa hoặc không tồn tại.</p>
        <Button className="mt-4" onClick={() => router.push('/orders')}>
          Quay lại danh sách đơn hàng
        </Button>
      </div>
    );
  }

  const order = currentOrder;
  const customerName = order.customerName || order.customer?.name || "Khách lẻ";
  const employeeName = order.employeeName || order.employee?.name || "N/A";
  const canViewInvoice = order.paymentStatus === 'PAID';

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button variant="outline" size="sm" onClick={() => router.back()}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Quay Lại
          </Button>
          <div>
            <h1 className="text-3xl font-bold">Đơn Hàng #{order.id}</h1>
            <p className="text-muted-foreground">
              Tạo lúc {formatDate(order.createdAt)}
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <Badge variant={getStatusBadgeVariant(order.status)}>
            {getStatusDisplay(order.status)}
          </Badge>
          <Badge variant={getPaymentStatusBadgeVariant(order.paymentStatus)}>
            {getPaymentStatusDisplay(order.paymentStatus)}
          </Badge>
          
          {/* Invoice Actions */}
          {canViewInvoice && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" disabled={isInvoiceLoading}>
                  <FileText className="mr-2 h-4 w-4" />
                  Hóa Đơn
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={handleViewInvoiceHTML}>
                  <Eye className="mr-2 h-4 w-4" />
                  Xem Hóa Đơn
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handlePrintInvoice}>
                  <Printer className="mr-2 h-4 w-4" />
                  In Hóa Đơn
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleDownloadPDF}>
                  <Download className="mr-2 h-4 w-4" />
                  Tải PDF
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Products */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="h-5 w-5" />
                Sản Phẩm ({order.products?.length || 0} món)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {order.products?.map((product, index) => (
                  <div key={product.id || index} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                        <Package className="h-6 w-6 text-gray-400" />
                      </div>
                      <div>
                        <h4 className="font-medium">{product.productName || "Tên sản phẩm"}</h4>
                        <p className="text-sm text-muted-foreground">
                          Size: {product.sizeName || "N/A"}
                        </p>
                        {product.option && (
                          <p className="text-sm text-muted-foreground">
                            Ghi chú: {product.option}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">
                        {formatCurrency(product.unitPrice || 0)} x {product.quantity}
                      </p>
                      <p className="text-sm font-bold">
                        {formatCurrency(product.totalPrice || 0)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Discounts */}
          {order.discounts && order.discounts.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Tag className="h-5 w-5" />
                  Khuyến Mãi ({order.discounts.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {order.discounts.map((discount, index) => (
                    <div key={discount.id || index} className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-lg">
                      <div>
                        <h4 className="font-medium text-green-800">{discount.discountName || "Khuyến mãi"}</h4>
                        <p className="text-sm text-green-600">Mã giảm giá</p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium text-green-800">
                          -{formatCurrency(discount.discountAmount)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Order Notes */}
          {order.customizeNote && (
            <Card>
              <CardHeader>
                <CardTitle>Ghi Chú Đơn Hàng</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">{order.customizeNote}</p>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Order Summary */}
          <Card>
            <CardHeader>
              <CardTitle>Tóm Tắt Đơn Hàng</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between">
                <span>Tổng tiền hàng:</span>
                <span className="font-medium">{formatCurrency(order.totalAmount)}</span>
              </div>
              {order.discounts && order.discounts.length > 0 && (
                <div className="flex justify-between text-green-600">
                  <span>Giảm giá:</span>
                  <span className="font-medium">
                    -{formatCurrency(order.discounts.reduce((total, discount) => total + discount.discountAmount, 0))}
                  </span>
                </div>
              )}
              <Separator />
              <div className="flex justify-between text-lg font-bold">
                <span>Thành tiền:</span>
                <span>{formatCurrency(order.finalAmount)}</span>
              </div>
            </CardContent>
          </Card>

          {/* Customer Info */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Thông Tin Khách Hàng
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3">
                <Avatar>
                  <AvatarImage src="" alt={customerName} />
                  <AvatarFallback>
                    {customerName.split(' ').map(n => n[0]).join('').slice(0, 2)}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-medium">{customerName}</p>
                  {order.customerId && (
                    <p className="text-sm text-muted-foreground">ID: {order.customerId}</p>
                  )}
                </div>
              </div>
              
              {order.customer && (
                <div className="space-y-2 text-sm">
                  {order.customer.phone && (
                    <div className="flex items-center gap-2">
                      <Phone className="h-4 w-4 text-muted-foreground" />
                      <span>{order.customer.phone}</span>
                    </div>
                  )}
                  {order.customer.currentPoints !== undefined && (
                    <div className="flex items-center gap-2">
                      <Tag className="h-4 w-4 text-muted-foreground" />
                      <span>Điểm tích lũy: {order.customer.currentPoints}</span>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Employee Info */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Nhân Viên Phục Vụ
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-3">
                <Avatar>
                  <AvatarImage src="" alt={employeeName} />
                  <AvatarFallback>
                    {employeeName.split(' ').map(n => n[0]).join('').slice(0, 2)}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-medium">{employeeName}</p>
                  {order.employeeId && (
                    <p className="text-sm text-muted-foreground">ID: {order.employeeId}</p>
                  )}
                  {order.employee?.position && (
                    <p className="text-sm text-muted-foreground">{order.employee.position}</p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Payment Info */}
          {order.payments && order.payments.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CreditCard className="h-5 w-5" />
                  Thông Tin Thanh Toán
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {order.payments.map((payment, index) => (
                  <div key={payment.id || index} className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Phương thức:</span>
                      <span className="text-sm">{payment.paymentMethod?.name || "N/A"}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Trạng thái:</span>
                      <Badge variant={getPaymentStatusBadgeVariant(payment.status)}>
                        {getPaymentStatusDisplay(payment.status)}
                      </Badge>
                    </div>
                    {payment.amountPaid && (
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">Số tiền trả:</span>
                        <span className="text-sm font-medium">{formatCurrency(payment.amountPaid)}</span>
                      </div>
                    )}
                    {payment.changeAmount && payment.changeAmount > 0 && (
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">Tiền thừa:</span>
                        <span className="text-sm font-medium">{formatCurrency(payment.changeAmount)}</span>
                      </div>
                    )}
                    {payment.paymentTime && (
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Clock className="h-4 w-4" />
                        <span>{formatDate(payment.paymentTime)}</span>
                      </div>
                    )}
                    {index < (order.payments?.length ?? 0) - 1 && <Separator />}
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          {/* Order Timeline */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Lịch Sử Đơn Hàng
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-primary rounded-full"></div>
                  <div>
                    <p className="text-sm font-medium">Đơn hàng được tạo</p>
                    <p className="text-xs text-muted-foreground">{formatDate(order.createdAt)}</p>
                  </div>
                </div>
                {order.orderTime && order.orderTime.getTime() !== order.createdAt.getTime() && (
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    <div>
                      <p className="text-sm font-medium">Bắt đầu xử lý</p>
                      <p className="text-xs text-muted-foreground">{formatDate(order.orderTime)}</p>
                    </div>
                  </div>
                )}
                {order.status === 'COMPLETED' && (
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <div>
                      <p className="text-sm font-medium">Hoàn thành</p>
                      <p className="text-xs text-muted-foreground">{formatDate(order.updatedAt)}</p>
                    </div>
                  </div>
                )}
                {order.status === 'CANCELLED' && (
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                    <div>
                      <p className="text-sm font-medium">Đã hủy</p>
                      <p className="text-xs text-muted-foreground">{formatDate(order.updatedAt)}</p>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
} 