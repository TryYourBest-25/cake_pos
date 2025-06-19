"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { 
  CheckCircle, 
  Clock, 
  CreditCard, 
  FileText, 
  ArrowLeft, 
  ArrowRight,
  AlertTriangle,
  X,
  Crown,
  Gift,
  Tag,
  Download,
  Printer,
  ChevronDown
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { usePOSStore } from "@/stores/pos";
import { useAuthStore } from "@/stores/auth";
import { orderService, CreateOrderDto, Order } from "@/lib/services/order-service";
import { paymentService, Payment } from "@/lib/services/payment-service";
import { invoiceService } from "@/lib/services/invoice-service";
import { AuthGuard } from "@/components/auth/auth-guard";

type CheckoutStep = 'confirm' | 'payment' | 'complete';

export default function CheckoutPage() {
  const router = useRouter();
  const { user } = useAuthStore();
  const { 
    cart, 
    appliedDiscounts,
    membershipDiscount,
    selectedCustomer,
    getCartTotal, 
    getRegularDiscountTotal,
    getMembershipDiscountAmount,
    clearCart,
    clearDiscounts 
  } = usePOSStore();

  const [currentStep, setCurrentStep] = useState<CheckoutStep>('confirm');
  const [isProcessing, setIsProcessing] = useState(false);
  const [customizeNote, setCustomizeNote] = useState('');
  const [createdOrder, setCreatedOrder] = useState<Order | null>(null);
  const [createdPayment, setCreatedPayment] = useState<Payment | null>(null);
  const [amountPaid, setAmountPaid] = useState<number>(0);
  const [isPrintingInvoice, setIsPrintingInvoice] = useState(false);

  // Calculate totals
  const subtotal = getCartTotal();
  const regularDiscountAmount = getRegularDiscountTotal();
  const membershipDiscountAmount = getMembershipDiscountAmount();
  const total = subtotal - regularDiscountAmount - membershipDiscountAmount;

  // Debug logging
  console.log('=== CHECKOUT DEBUG ===');
  console.log('Applied discounts:', appliedDiscounts);
  console.log('Membership discount:', membershipDiscount);
  console.log('Regular discount amount:', regularDiscountAmount);
  console.log('Membership discount amount:', membershipDiscountAmount);

  // Redirect if cart is empty
  useEffect(() => {
    if (cart.length === 0 && currentStep === 'confirm') {
      toast.error("Giỏ hàng trống", {
        description: "Vui lòng thêm sản phẩm vào giỏ hàng trước khi thanh toán"
      });
      router.push('/pos');
    }
  }, [cart, currentStep, router]);

  // Clean up old membership discounts in appliedDiscounts (migration/fix)
  useEffect(() => {
    const membershipDiscountsInApplied = appliedDiscounts.filter(
      discount => discount.discount.discount_id === -1 || discount.reason === 'membership'
    );
    
    if (membershipDiscountsInApplied.length > 0) {
      console.warn('Found membership discounts in appliedDiscounts, cleaning up...');
      // Remove membership discounts from appliedDiscounts
      const cleanedDiscounts = appliedDiscounts.filter(
        discount => discount.discount.discount_id !== -1 && discount.reason !== 'membership'
      );
      // Set the cleaned appliedDiscounts back to store
      // Note: This is a one-time cleanup for migration
      if (cleanedDiscounts.length !== appliedDiscounts.length) {
        // We need access to store's clearDiscounts and re-add clean ones
        clearDiscounts();
        // Re-add clean discounts
        cleanedDiscounts.forEach(discount => {
          // This should use the store's applyDiscount method
          // But since we're in useEffect, we'll just log for now
          console.log('Clean discount to re-add:', discount);
        });
      }
    }
  }, [appliedDiscounts, clearDiscounts]);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(price);
  };

  const getInitials = (name: string) => {
    return name.split(' ').map(word => word[0]).join('').toUpperCase().slice(0, 2);
  };

  // Step 1: Confirm Order
  const handleConfirmOrder = async () => {
    // Kiểm tra xem user có thông tin employee hoặc manager không
    const employeeId = user?.profile?.employee_id || user?.profile?.manager_id;
    
    if (!employeeId) {
      toast.error("Lỗi xác thực", {
        description: "Không tìm thấy thông tin nhân viên"
      });
      return;
    }

    setIsProcessing(true);

    try {
      // Prepare order data
      const orderData: CreateOrderDto = {
        employee_id: employeeId,
        customer_id: selectedCustomer?.customer_id,
        customize_note: customizeNote.trim() || undefined,
        products: cart.map(item => ({
          product_price_id: item.product_price_id,
          quantity: item.quantity,
          option: undefined // Có thể thêm option sau nếu cần
        })),
        // Chỉ gửi regular discounts (không gửi membership discount có ID -1)
        discounts: appliedDiscounts.length > 0 ? appliedDiscounts
          .filter(discount => discount.discount.discount_id > 0) // Loại bỏ membership discount có ID -1
          .map(discount => ({
            discount_id: discount.discount.discount_id
          })) : undefined
      };

      console.log('Applied discounts:', appliedDiscounts);
      console.log('Filtered discounts for backend:', orderData.discounts);
      console.log('Tạo đơn hàng với dữ liệu:', orderData);

      // Create order
      const order = await orderService.createOrder(orderData);
      
      setCreatedOrder(order);
      setCurrentStep('payment');
      
      // Set default amount paid to exact total
      setAmountPaid(total);
      
      toast.success("Xác nhận đơn hàng thành công!", {
        description: `Đơn hàng #${order.order_id} đã được tạo`
      });

    } catch (error: any) {
      console.error('Lỗi khi tạo đơn hàng:', error);
      
      const errorMessage = error?.response?.data?.message || 
                          error?.message || 
                          'Có lỗi xảy ra khi tạo đơn hàng';
      
      toast.error("Lỗi tạo đơn hàng", {
        description: errorMessage
      });
    } finally {
      setIsProcessing(false);
    }
  };

  // Step 2: Process Payment
  const handleProcessPayment = async () => {
    if (!createdOrder) {
      toast.error("Lỗi", {
        description: "Không tìm thấy thông tin đơn hàng"
      });
      return;
    }

    // Validate amount paid
    if (amountPaid < total) {
      toast.error("Số tiền không đủ", {
        description: `Số tiền thanh toán phải ít nhất ${formatPrice(total)}`
      });
      return;
    }

    setIsProcessing(true);

    try {
      // Process cash payment
      const payment = await paymentService.processCashPayment(
        createdOrder.order_id,
        amountPaid
      );

      setCreatedPayment(payment);
      setCurrentStep('complete');
      
      toast.success("Thanh toán thành công!", {
        description: `Đơn hàng #${createdOrder.order_id} đã được thanh toán hoàn tất`
      });

    } catch (error: any) {
      console.error('Lỗi khi thanh toán:', error);
      
      const errorMessage = error?.response?.data?.message || 
                          error?.message || 
                          'Có lỗi xảy ra khi thanh toán';
      
      toast.error("Lỗi thanh toán", {
        description: errorMessage
      });
    } finally {
      setIsProcessing(false);
    }
  };

  // Cancel Order
  const handleCancelOrder = async () => {
    if (!createdOrder) return;

    setIsProcessing(true);

    try {
      await orderService.cancelOrder(createdOrder.order_id);
      
      toast.success("Đã hủy đơn hàng", {
        description: `Đơn hàng #${createdOrder.order_id} đã được hủy`
      });
      
      router.push('/pos');
    } catch (error: any) {
      console.error('Lỗi khi hủy đơn hàng:', error);
      
      const errorMessage = error?.response?.data?.message || 
                          error?.message || 
                          'Có lỗi xảy ra khi hủy đơn hàng';
      
      toast.error("Lỗi hủy đơn hàng", {
        description: errorMessage
      });
    } finally {
      setIsProcessing(false);
    }
  };

  // Complete and return to POS
  const handleComplete = () => {
    // Clear cart and discounts
    clearCart();
    clearDiscounts();
    
    toast.success("Hoàn thành đơn hàng!", {
      description: "Cảm ơn bạn đã sử dụng dịch vụ"
    });
    
    router.push('/pos');
  };

  // Back to POS
  const handleBackToPOS = () => {
    router.push('/pos');
  };

  // Print Invoice HTML
  const handlePrintInvoice = async () => {
    if (!createdOrder) {
      toast.error("Lỗi", {
        description: "Không tìm thấy thông tin đơn hàng"
      });
      return;
    }

    setIsPrintingInvoice(true);

    try {
      await invoiceService.printInvoiceHTML(createdOrder.order_id);
      
      toast.success("Đang in hóa đơn", {
        description: "Hóa đơn đang được mở trong tab mới để in"
      });

    } catch (error: any) {
      console.error('Lỗi khi in hóa đơn:', error);
      
      const errorMessage = error?.message || 'Có lỗi xảy ra khi in hóa đơn';
      
      toast.error("Lỗi in hóa đơn", {
        description: errorMessage
      });
    } finally {
      setIsPrintingInvoice(false);
    }
  };

  // Download PDF Invoice
  const handleDownloadPDF = async () => {
    if (!createdOrder) {
      toast.error("Lỗi", {
        description: "Không tìm thấy thông tin đơn hàng"
      });
      return;
    }

    setIsPrintingInvoice(true);

    try {
      await invoiceService.downloadInvoicePDF(createdOrder.order_id);
      
      toast.success("Tải xuống thành công", {
        description: "Hóa đơn PDF đã được tải xuống"
      });

    } catch (error: any) {
      console.error('Lỗi khi tải hóa đơn PDF:', error);
      
      const errorMessage = error?.message || 'Có lỗi xảy ra khi tải hóa đơn PDF';
      
      toast.error("Lỗi tải hóa đơn", {
        description: errorMessage
      });
    } finally {
      setIsPrintingInvoice(false);
    }
  };

  // View PDF Invoice
  const handleViewPDF = async () => {
    if (!createdOrder) {
      toast.error("Lỗi", {
        description: "Không tìm thấy thông tin đơn hàng"
      });
      return;
    }

    setIsPrintingInvoice(true);

    try {
      await invoiceService.viewInvoicePDF(createdOrder.order_id);
      
      toast.success("Đang mở hóa đơn", {
        description: "Hóa đơn PDF đang được mở trong tab mới"
      });

    } catch (error: any) {
      console.error('Lỗi khi xem hóa đơn PDF:', error);
      
      const errorMessage = error?.message || 'Có lỗi xảy ra khi xem hóa đơn PDF';
      
      toast.error("Lỗi xem hóa đơn", {
        description: errorMessage
      });
    } finally {
      setIsPrintingInvoice(false);
    }
  };

  const steps = [
    { id: 'confirm', title: 'Xác nhận đơn hàng', icon: FileText },
    { id: 'payment', title: 'Thanh toán', icon: CreditCard },
    { id: 'complete', title: 'Hoàn thành', icon: CheckCircle },
  ];

  const currentStepIndex = steps.findIndex(step => step.id === currentStep);

  return (
    <AuthGuard>
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <header className="bg-white shadow-sm border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              <div className="flex items-center space-x-4">
                <Button
                  variant="ghost"
                  onClick={handleBackToPOS}
                  className="flex items-center space-x-2"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Quay lại POS</span>
                </Button>
                <Separator orientation="vertical" className="h-6" />
                <h1 className="text-xl font-semibold text-gray-900">Thanh toán</h1>
              </div>
            </div>
          </div>
        </header>

        {/* Progress Steps */}
        <div className="bg-white border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex items-center justify-center">
              {steps.map((step, index) => {
                const StepIcon = step.icon;
                const isActive = index === currentStepIndex;
                const isCompleted = index < currentStepIndex;
                const isUpcoming = index > currentStepIndex;

                return (
                  <div key={step.id} className="flex items-center">
                    <div className="flex items-center">
                      <div
                        className={`
                          flex items-center justify-center w-10 h-10 rounded-full border-2 transition-all
                          ${isActive ? 'bg-blue-600 border-blue-600 text-white' : ''}
                          ${isCompleted ? 'bg-green-600 border-green-600 text-white' : ''}
                          ${isUpcoming ? 'border-gray-300 text-gray-400' : ''}
                        `}
                      >
                        <StepIcon className="w-5 h-5" />
                      </div>
                      <div className="ml-3">
                        <p className={`text-sm font-medium ${isActive ? 'text-blue-600' : isCompleted ? 'text-green-600' : 'text-gray-400'}`}>
                          {step.title}
                        </p>
                      </div>
                    </div>
                    {index < steps.length - 1 && (
                      <div className={`w-16 h-0.5 mx-4 ${index < currentStepIndex ? 'bg-green-600' : 'bg-gray-300'}`} />
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Order Details */}
            <div className="lg:col-span-2 space-y-6">
              {/* Step Content */}
              {currentStep === 'confirm' && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <FileText className="w-5 h-5" />
                      <span>Xác nhận thông tin đơn hàng</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {/* Customer Info */}
                    {selectedCustomer && (
                      <div>
                        <h3 className="text-sm font-medium text-gray-900 mb-3">Thông tin khách hàng</h3>
                        <div className="bg-gray-50 rounded-lg p-4">
                          <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                              <span className="text-blue-600 font-semibold text-sm">
                                {getInitials(selectedCustomer.name)}
                              </span>
                            </div>
                            <div className="flex-1">
                              <p className="font-medium">{selectedCustomer.name}</p>
                              <p className="text-sm text-gray-500">{selectedCustomer.phone}</p>
                            </div>
                          </div>
                          
                          {/* Membership Info */}
                          {selectedCustomer.membership_type && (
                            <div className="mt-3 bg-white rounded-lg p-3 border">
                              <div className="flex items-center space-x-2 mb-2">
                                <Crown className="w-4 h-4 text-yellow-500" />
                                <span className="text-sm font-medium text-gray-700">Hạng thành viên</span>
                              </div>
                              <div className="space-y-1">
                                <p className="text-sm font-semibold text-blue-600">
                                  {selectedCustomer.membership_type.type}
                                </p>
                                <div className="flex items-center justify-between text-xs text-gray-600">
                                  <span>Giảm giá: {selectedCustomer.membership_type.discount_value}%</span>
                                  <div className="flex items-center space-x-1">
                                    <Gift className="w-3 h-3" />
                                    <span>{selectedCustomer.current_points || 0} điểm</span>
                                  </div>
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Order Items */}
                    <div>
                      <h3 className="text-sm font-medium text-gray-900 mb-3">Sản phẩm đặt hàng</h3>
                      <div className="space-y-3">
                        {cart.map((item) => (
                          <div key={item.product_price_id} className="flex items-center justify-between bg-gray-50 rounded-lg p-4">
                            <div className="flex-1">
                              <h4 className="font-medium">{item.product.name}</h4>
                              <p className="text-sm text-gray-500">
                                {item.product_size.name} - {formatPrice(item.price)}
                              </p>
                            </div>
                            <div className="text-right">
                              <p className="text-sm text-gray-500">Số lượng: {item.quantity}</p>
                              <p className="font-medium">{formatPrice(item.total)}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Applied Discounts */}
                    {(appliedDiscounts.length > 0 || membershipDiscount) && (
                      <div>
                        <h3 className="text-sm font-medium text-gray-900 mb-3">Giảm giá áp dụng</h3>
                        <div className="space-y-2">
                          {/* Membership Discount */}
                          {membershipDiscount && (
                            <div className="flex items-center justify-between bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                              <div className="flex items-center space-x-2">
                                <Crown className="w-4 h-4 text-yellow-600" />
                                <div>
                                  <p className="text-sm font-medium text-yellow-700">
                                    Ưu đãi thành viên {membershipDiscount.membershipType}
                                  </p>
                                  <p className="text-xs text-yellow-600">
                                    Giảm {membershipDiscount.discountPercentage}%
                                  </p>
                                </div>
                              </div>
                              <p className="text-sm font-medium text-yellow-700">
                                -{formatPrice(membershipDiscount.discountAmount)}
                              </p>
                            </div>
                          )}

                          {/* Regular Discounts */}
                          {appliedDiscounts.map((appliedDiscount) => (
                            <div
                              key={appliedDiscount.discount.discount_id}
                              className="flex items-center justify-between bg-green-50 border border-green-200 rounded-lg p-3"
                            >
                              <div className="flex items-center space-x-2">
                                <Tag className="w-4 h-4 text-green-600" />
                                <div>
                                  <p className="text-sm font-medium text-green-700">
                                    {appliedDiscount.discount.name}
                                  </p>
                                  <p className="text-xs text-green-600">
                                    {appliedDiscount.discount.coupon_code}
                                  </p>
                                </div>
                              </div>
                              <p className="text-sm font-medium text-green-700">
                                -{formatPrice(appliedDiscount.discount_amount)}
                              </p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Order Note */}
                    <div>
                      <Label htmlFor="note">Ghi chú đơn hàng (tùy chọn)</Label>
                      <Input
                        id="note"
                        placeholder="Nhập ghi chú cho đơn hàng..."
                        value={customizeNote}
                        onChange={(e) => setCustomizeNote(e.target.value)}
                        className="mt-1"
                      />
                    </div>

                    {/* Action Buttons */}
                    <div className="flex space-x-3 pt-4">
                      <Button
                        variant="outline"
                        onClick={handleBackToPOS}
                        className="flex-1"
                      >
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Quay lại
                      </Button>
                      <Button
                        onClick={handleConfirmOrder}
                        disabled={isProcessing}
                        className="flex-1"
                      >
                        {isProcessing ? (
                          <>
                            <Clock className="w-4 h-4 mr-2 animate-spin" />
                            Đang xử lý...
                          </>
                        ) : (
                          <>
                            Xác nhận đơn hàng
                            <ArrowRight className="w-4 h-4 ml-2" />
                          </>
                        )}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}

              {currentStep === 'payment' && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <CreditCard className="w-5 h-5" />
                      <span>Thanh toán</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {createdOrder && (
                      <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                        <div className="flex items-center space-x-2">
                          <CheckCircle className="w-5 h-5 text-green-600" />
                          <div>
                            <p className="font-medium text-green-800">Đơn hàng đã được tạo thành công</p>
                            <p className="text-sm text-green-600">Mã đơn hàng: #{createdOrder.order_id}</p>
                          </div>
                        </div>
                      </div>
                    )}

                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                      <div className="flex items-start space-x-2">
                        <AlertTriangle className="w-5 h-5 text-yellow-600 mt-0.5" />
                        <div>
                          <p className="font-medium text-yellow-800">Chọn phương thức thanh toán</p>
                          <p className="text-sm text-yellow-600 mt-1">
                            Tính năng thanh toán đang được phát triển. Hiện tại chỉ hỗ trợ thanh toán tiền mặt.
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Payment Methods */}
                    <div className="space-y-3">
                      <div className="border rounded-lg p-4">
                        <div className="flex items-center space-x-3">
                          <input
                            type="radio"
                            id="cash"
                            name="payment"
                            defaultChecked
                            className="w-4 h-4 text-blue-600"
                          />
                          <label htmlFor="cash" className="flex-1 cursor-pointer">
                            <div className="flex items-center justify-between">
                              <span className="font-medium">Tiền mặt</span>
                              <Badge variant="default">Khả dụng</Badge>
                            </div>
                            <p className="text-sm text-gray-500 mt-1">Thanh toán bằng tiền mặt tại quầy</p>
                          </label>
                        </div>
                        
                        {/* Cash Payment Form */}
                        <div className="mt-4 pt-4 border-t">
                          <div className="space-y-4">
                            <div>
                              <Label htmlFor="amount-paid">Số tiền khách trả</Label>
                              <div className="mt-1 relative">
                                <Input
                                  id="amount-paid"
                                  type="number"
                                  placeholder="Nhập số tiền khách trả..."
                                  value={amountPaid || ''}
                                  onChange={(e) => setAmountPaid(Number(e.target.value))}
                                  className="pr-16"
                                />
                                <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                                  <span className="text-sm text-gray-500">VND</span>
                                </div>
                              </div>
                              <p className="text-sm text-gray-500 mt-1">
                                Tổng cần thanh toán: <span className="font-medium text-gray-900">{formatPrice(total)}</span>
                              </p>
                            </div>
                            
                            {amountPaid > 0 && (
                              <div className="bg-gray-50 rounded-lg p-3">
                                <div className="flex justify-between items-center text-sm">
                                  <span>Tiền khách trả:</span>
                                  <span className="font-medium">{formatPrice(amountPaid)}</span>
                                </div>
                                <div className="flex justify-between items-center text-sm">
                                  <span>Tổng thanh toán:</span>
                                  <span className="font-medium">{formatPrice(total)}</span>
                                </div>
                                <Separator className="my-2" />
                                <div className="flex justify-between items-center">
                                  <span className="font-medium">Tiền thừa:</span>
                                  <span className={`font-bold ${amountPaid >= total ? 'text-green-600' : 'text-red-600'}`}>
                                    {formatPrice(Math.max(0, amountPaid - total))}
                                  </span>
                                </div>
                                {amountPaid < total && (
                                  <p className="text-xs text-red-600 mt-1">
                                    Còn thiếu: {formatPrice(total - amountPaid)}
                                  </p>
                                )}
                              </div>
                            )}

                            {/* Quick Amount Buttons */}
                            <div>
                              <p className="text-sm font-medium text-gray-700 mb-2">Số tiền gợi ý:</p>
                              <div className="grid grid-cols-3 gap-2">
                                <Button
                                  type="button"
                                  variant="outline"
                                  size="sm"
                                  onClick={() => setAmountPaid(total)}
                                  className="text-xs"
                                >
                                  Vừa đủ
                                </Button>
                                <Button
                                  type="button"
                                  variant="outline"
                                  size="sm"
                                  onClick={() => setAmountPaid(Math.ceil(total / 10000) * 10000)}
                                  className="text-xs"
                                >
                                  Làm tròn
                                </Button>
                                <Button
                                  type="button"
                                  variant="outline"
                                  size="sm"
                                  onClick={() => setAmountPaid(total + 50000)}
                                  className="text-xs"
                                >
                                  +50k
                                </Button>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="border rounded-lg p-4 opacity-50">
                        <div className="flex items-center space-x-3">
                          <input
                            type="radio"
                            id="vnpay"
                            name="payment"
                            disabled
                            className="w-4 h-4 text-blue-600"
                          />
                          <label htmlFor="vnpay" className="flex-1">
                            <div className="flex items-center justify-between">
                              <span className="font-medium">VNPay</span>
                              <Badge variant="secondary">Sắp có</Badge>
                            </div>
                            <p className="text-sm text-gray-500 mt-1">Thanh toán qua VNPay</p>
                          </label>
                        </div>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex space-x-3 pt-4">
                      <Button
                        variant="outline"
                        onClick={handleCancelOrder}
                        disabled={isProcessing}
                        className="flex-1"
                      >
                        <X className="w-4 h-4 mr-2" />
                        Hủy đơn hàng
                      </Button>
                      <Button
                        onClick={handleProcessPayment}
                        disabled={isProcessing}
                        className="flex-1"
                      >
                        {isProcessing ? (
                          <>
                            <Clock className="w-4 h-4 mr-2 animate-spin" />
                            Đang xử lý...
                          </>
                        ) : (
                          <>
                            Thanh toán
                            <ArrowRight className="w-4 h-4 ml-2" />
                          </>
                        )}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}

              {currentStep === 'complete' && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <CheckCircle className="w-5 h-5 text-green-600" />
                      <span>Hoàn thành</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="text-center py-8">
                      <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <CheckCircle className="w-8 h-8 text-green-600" />
                      </div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">
                        Thanh toán thành công!
                      </h3>
                      <p className="text-gray-600 mb-6">
                        Đơn hàng #{createdOrder?.order_id} đã được thanh toán hoàn tất.
                      </p>
                      
                      <div className="bg-gray-50 rounded-lg p-4 mb-6">
                        <div className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-600">Tổng thanh toán:</span>
                            <span className="font-medium">{formatPrice(total)}</span>
                          </div>
                          {createdPayment && (
                            <>
                              <div className="flex justify-between text-sm">
                                <span className="text-gray-600">Tiền khách trả:</span>
                                <span className="font-medium">{formatPrice(Number(createdPayment.amount_paid))}</span>
                              </div>
                              <div className="flex justify-between text-sm">
                                <span className="text-gray-600">Tiền thừa:</span>
                                <span className="font-bold text-green-600">{formatPrice(Number(createdPayment.change_amount))}</span>
                              </div>
                              <div className="flex justify-between text-sm">
                                <span className="text-gray-600">Phương thức:</span>
                                <span className="font-medium">{createdPayment.payment_method.name}</span>
                              </div>
                              <div className="flex justify-between text-sm">
                                <span className="text-gray-600">Trạng thái:</span>
                                <Badge variant={createdPayment.status === 'PAID' ? 'default' : 'secondary'}>
                                  {createdPayment.status === 'PAID' ? 'Đã thanh toán' : createdPayment.status}
                                </Badge>
                              </div>
                            </>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex space-x-3">
                      {/* Invoice Options */}
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="outline"
                            disabled={isPrintingInvoice}
                            className="flex-1"
                          >
                            {isPrintingInvoice ? (
                              <>
                                <Clock className="w-4 h-4 mr-2 animate-spin" />
                                Đang xử lý...
                              </>
                            ) : (
                              <>
                                <FileText className="w-4 h-4 mr-2" />
                                Hóa đơn
                                <ChevronDown className="w-4 h-4 ml-2" />
                              </>
                            )}
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-48">
                          <DropdownMenuItem onClick={handlePrintInvoice} disabled={isPrintingInvoice}>
                            <Printer className="w-4 h-4 mr-2" />
                            In hóa đơn (HTML)
                          </DropdownMenuItem>
                          {(user?.role_name === 'STAFF' || user?.role_name === 'MANAGER') && (
                            <>
                              <DropdownMenuItem onClick={handleViewPDF} disabled={isPrintingInvoice}>
                                <FileText className="w-4 h-4 mr-2" />
                                Xem PDF
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={handleDownloadPDF} disabled={isPrintingInvoice}>
                                <Download className="w-4 h-4 mr-2" />
                                Tải PDF
                              </DropdownMenuItem>
                            </>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>

                      <Button
                        onClick={handleComplete}
                        className="flex-1"
                      >
                        <CheckCircle className="w-4 h-4 mr-2" />
                        Hoàn thành
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Order Summary Sidebar */}
            <div className="lg:col-span-1">
              <Card className="sticky top-8">
                <CardHeader>
                  <CardTitle>Tóm tắt đơn hàng</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>Tạm tính:</span>
                      <span>{formatPrice(subtotal)}</span>
                    </div>
                    {membershipDiscountAmount > 0 && (
                      <div className="flex justify-between text-yellow-600">
                        <span>Ưu đãi thành viên:</span>
                        <span>-{formatPrice(membershipDiscountAmount)}</span>
                      </div>
                    )}
                    {regularDiscountAmount > 0 && (
                      <div className="flex justify-between text-green-600">
                        <span>Mã giảm giá:</span>
                        <span>-{formatPrice(regularDiscountAmount)}</span>
                      </div>
                    )}

                    <Separator />
                    <div className="flex justify-between font-semibold text-lg">
                      <span>Tổng cộng:</span>
                      <span>{formatPrice(total)}</span>
                    </div>
                  </div>

                  {createdOrder && (
                    <div className="mt-4 pt-4 border-t">
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span>Mã đơn hàng:</span>
                          <span className="font-medium">#{createdOrder.order_id}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Trạng thái:</span>
                          <Badge variant="default">{createdOrder.status}</Badge>
                        </div>
                        <div className="flex justify-between">
                          <span>Thời gian tạo:</span>
                          <span className="text-xs">
                            {createdOrder.order_time ? new Date(createdOrder.order_time).toLocaleString('vi-VN') : 'N/A'}
                          </span>
                        </div>
                      </div>
                    </div>
                  )}

                  {createdPayment && (
                    <div className="mt-4 pt-4 border-t">
                      <h4 className="font-medium text-sm mb-2">Thông tin thanh toán</h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span>Mã thanh toán:</span>
                          <span className="font-medium">#{createdPayment.payment_id}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Tiền khách trả:</span>
                          <span className="font-medium">{formatPrice(Number(createdPayment.amount_paid))}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Tiền thừa:</span>
                          <span className="font-bold text-green-600">{formatPrice(Number(createdPayment.change_amount))}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Phương thức:</span>
                          <span className="font-medium">{createdPayment.payment_method.name}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Trạng thái:</span>
                          <Badge variant={createdPayment.status === 'PAID' ? 'default' : 'secondary'}>
                            {createdPayment.status === 'PAID' ? 'Đã thanh toán' : createdPayment.status}
                          </Badge>
                        </div>
                        <div className="flex justify-between">
                          <span>Thời gian:</span>
                          <span className="text-xs">
                            {new Date(createdPayment.payment_time).toLocaleString('vi-VN')}
                          </span>
                        </div>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </AuthGuard>
  );
} 