"use client";

import { useState } from "react";
import { Search, Tag, CheckCircle, XCircle, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { discountService, Discount } from "@/lib/services/discount-service";
import { usePOSStore } from "@/stores/pos";
import { POSCustomer } from "@/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

interface CouponDialogProps {
  isOpen: boolean;
  onClose: () => void;
  customer?: POSCustomer | null;
}

export function CouponDialog({
  isOpen,
  onClose,
  customer,
}: CouponDialogProps) {
  const [couponCode, setCouponCode] = useState("");
  const [foundDiscount, setFoundDiscount] = useState<Discount | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [validationResult, setValidationResult] = useState<any>(null);
  
  const { 
    getCartTotal, 
    getProductCount, 
    applyDiscount, 
    appliedDiscounts,
    getTotalDiscount 
  } = usePOSStore();

  const handleSearchCoupon = async () => {
    if (!couponCode.trim()) {
      toast.error("Vui lòng nhập mã giảm giá");
      return;
    }
    
    setIsLoading(true);
    setFoundDiscount(null);
    setValidationResult(null);
    
    try {
      const discount = await discountService.findByCouponCode(couponCode.trim().toUpperCase());
      
      if (discount) {
        setFoundDiscount(discount);
        toast.success("Tìm thấy chương trình khuyến mãi!", {
          description: discount.name,
        });
        
        // Auto validate if we have cart items
        if (getCartTotal() > 0) {
          await handleValidateDiscount(discount);
        }
      } else {
        toast.error("Không tìm thấy mã giảm giá", {
          description: "Vui lòng kiểm tra lại mã giảm giá",
        });
      }
    } catch (error: any) {
      console.error('Lỗi khi tìm mã giảm giá:', error);
      
      const errorMessage = error?.response?.data?.message || 
                          error?.message || 
                          'Có lỗi xảy ra khi tìm kiếm mã giảm giá';
      
      toast.error("Lỗi tìm kiếm", {
        description: errorMessage,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleValidateDiscount = async (discount: Discount) => {
    if (getCartTotal() === 0) {
      toast.error("Giỏ hàng trống", {
        description: "Vui lòng thêm sản phẩm vào giỏ hàng trước khi áp dụng mã giảm giá",
      });
      return;
    }

    setIsLoading(true);
    
    try {
      const validateData = {
        customer_id: customer?.customer_id,
        discount_ids: [discount.discount_id],
        total_amount: getCartTotal(),
        product_count: getProductCount(),
      };

      const result = await discountService.validateDiscounts(validateData);
      setValidationResult(result);
      
      if (result.valid_discounts.length > 0) {
        toast.success("Mã giảm giá hợp lệ!", {
          description: `Có thể giảm ${formatPrice(result.summary.total_discount_amount)}`,
        });
      } else {
        const reason = result.invalid_discounts[0]?.reason || "Mã giảm giá không áp dụng được";
        toast.warning("Mã giảm giá không hợp lệ", {
          description: reason,
        });
      }
    } catch (error: any) {
      console.error('Lỗi khi validate mã giảm giá:', error);
      
      const errorMessage = error?.response?.data?.message || 
                          error?.message || 
                          'Có lỗi xảy ra khi kiểm tra mã giảm giá';
      
      toast.error("Lỗi kiểm tra", {
        description: errorMessage,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleApplyDiscount = () => {
    if (!foundDiscount || !validationResult || validationResult.valid_discounts.length === 0) {
      return;
    }

    const validDiscount = validationResult.valid_discounts[0];
    
    // Check if already applied
    const isAlreadyApplied = appliedDiscounts.some(
      applied => applied.discount.discount_id === foundDiscount.discount_id
    );
    
    if (isAlreadyApplied) {
      toast.warning("Mã giảm giá đã được áp dụng");
      return;
    }

    applyDiscount(foundDiscount, validDiscount.discount_amount, validDiscount.reason);
    
    toast.success("Áp dụng mã giảm giá thành công!", {
      description: `Giảm ${formatPrice(validDiscount.discount_amount)}`,
    });
    
    handleClose();
  };

  const handleClose = () => {
    setCouponCode("");
    setFoundDiscount(null);
    setValidationResult(null);
    onClose();
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(price);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('vi-VN');
  };

  const isDiscountValid = validationResult && validationResult.valid_discounts.length > 0;
  const isDiscountInvalid = validationResult && validationResult.invalid_discounts.length > 0;

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Áp dụng mã giảm giá</DialogTitle>
          <DialogDescription>
            Nhập mã giảm giá để áp dụng cho đơn hàng hiện tại
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Search Section */}
          <div className="space-y-3">
            <Label htmlFor="coupon">Mã giảm giá</Label>
            <div className="flex space-x-2">
              <div className="relative flex-1">
                <Tag className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  id="coupon"
                  placeholder="Nhập mã giảm giá..."
                  value={couponCode}
                  onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                  className="pl-10"
                  onKeyDown={(e) => e.key === 'Enter' && handleSearchCoupon()}
                />
              </div>
              <Button onClick={handleSearchCoupon} disabled={!couponCode.trim() || isLoading}>
                <Search className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Discount Info */}
          {foundDiscount && (
            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">{foundDiscount.name}</CardTitle>
                  <Badge variant={foundDiscount.is_active ? "default" : "secondary"}>
                    {foundDiscount.is_active ? "Hoạt động" : "Không hoạt động"}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                {foundDiscount.description && (
                  <p className="text-sm text-gray-600">{foundDiscount.description}</p>
                )}
                
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-500">Giảm giá:</span>
                    <p className="font-medium">{foundDiscount.discount_value}%</p>
                  </div>
                  <div>
                    <span className="text-gray-500">Giảm tối đa:</span>
                    <p className="font-medium">{formatPrice(foundDiscount.max_discount_amount)}</p>
                  </div>
                  <div>
                    <span className="text-gray-500">Đơn tối thiểu:</span>
                    <p className="font-medium">{formatPrice(foundDiscount.min_required_order_value)}</p>
                  </div>
                  <div>
                    <span className="text-gray-500">Hết hạn:</span>
                    <p className="font-medium">{formatDate(foundDiscount.valid_until)}</p>
                  </div>
                </div>

                {/* Validation Result */}
                {validationResult && (
                  <>
                    <Separator />
                    <div className="space-y-2">
                      {isDiscountValid && (
                        <div className="flex items-center space-x-2 text-green-600">
                          <CheckCircle className="w-4 h-4" />
                          <span className="text-sm font-medium">
                            Có thể áp dụng - Giảm {formatPrice(validationResult.valid_discounts[0].discount_amount)}
                          </span>
                        </div>
                      )}
                      
                      {isDiscountInvalid && (
                        <div className="flex items-start space-x-2 text-red-600">
                          <XCircle className="w-4 h-4 mt-0.5" />
                          <div className="text-sm">
                            <p className="font-medium">Không thể áp dụng</p>
                            <p className="text-xs">{validationResult.invalid_discounts[0]?.reason}</p>
                          </div>
                        </div>
                      )}
                    </div>
                  </>
                )}

                {/* Action Buttons */}
                <div className="flex space-x-2 pt-2">
                  {!validationResult && getCartTotal() > 0 && (
                    <Button 
                      onClick={() => handleValidateDiscount(foundDiscount)} 
                      className="flex-1"
                      disabled={isLoading}
                    >
                      {isLoading ? "Đang kiểm tra..." : "Kiểm tra"}
                    </Button>
                  )}
                  
                  {isDiscountValid && (
                    <Button 
                      onClick={handleApplyDiscount} 
                      className="flex-1"
                      disabled={isLoading}
                    >
                      Áp dụng
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Current Order Info */}
          <Card className="bg-blue-50">
            <CardContent className="pt-4">
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Tổng đơn hàng:</span>
                  <span className="font-medium">{formatPrice(getCartTotal())}</span>
                </div>
                <div className="flex justify-between">
                  <span>Số sản phẩm:</span>
                  <span className="font-medium">{getProductCount()}</span>
                </div>
                {getTotalDiscount() > 0 && (
                  <div className="flex justify-between text-green-600">
                    <span>Đã giảm:</span>
                    <span className="font-medium">-{formatPrice(getTotalDiscount())}</span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  );
} 