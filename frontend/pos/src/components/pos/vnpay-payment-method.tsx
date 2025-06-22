"use client";

import { useState } from "react";
import { CreditCard } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface VNPayPaymentMethodProps {
  isSelected: boolean;
  onSelect: () => void;
  total: number;
  orderId?: number;
}

function formatPrice(price: number): string {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND'
  }).format(price);
}

export function VNPayPaymentMethod({ isSelected, onSelect, total, orderId }: VNPayPaymentMethodProps) {
  return (
    <div className={`border rounded-lg p-4 ${isSelected ? 'border-blue-500 bg-blue-50' : ''}`}>
      <div className="flex items-center space-x-3">
        <input
          type="radio"
          id="vnpay"
          name="payment"
          checked={isSelected}
          onChange={onSelect}
          className="w-4 h-4 text-blue-600"
        />
        <label htmlFor="vnpay" className="flex-1 cursor-pointer">
          <div className="flex items-center justify-between">
            <span className="font-medium">VNPay</span>
            <Badge variant="default">Khả dụng</Badge>
          </div>
          <p className="text-sm text-gray-500 mt-1">Thanh toán qua VNPay (chuyển hướng)</p>
        </label>
      </div>
      
      {/* VNPay Payment Info */}
      {isSelected && (
        <div className="mt-4 pt-4 border-t">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-start space-x-2">
              <CreditCard className="w-5 h-5 text-blue-600 mt-0.5" />
              <div>
                <p className="font-medium text-blue-800">Thanh toán VNPay</p>
                <p className="text-sm text-blue-600 mt-1">
                  Bạn sẽ được chuyển hướng đến trang thanh toán VNPay để hoàn tất giao dịch.
                </p>
                <div className="mt-2 text-sm text-blue-700">
                  <p><strong>Số tiền:</strong> {formatPrice(total)}</p>
                  {orderId && <p><strong>Đơn hàng:</strong> #{orderId}</p>}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 