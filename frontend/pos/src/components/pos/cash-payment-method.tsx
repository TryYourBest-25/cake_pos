"use client";

import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";

interface CashPaymentMethodProps {
  isSelected: boolean;
  onSelect: () => void;
  total: number;
  amountPaid: number;
  onAmountPaidChange: (amount: number) => void;
}

function formatPrice(price: number): string {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND'
  }).format(price);
}

export function CashPaymentMethod({ 
  isSelected, 
  onSelect, 
  total, 
  amountPaid, 
  onAmountPaidChange 
}: CashPaymentMethodProps) {
  return (
    <div className={`border rounded-lg p-4 ${isSelected ? 'border-blue-500 bg-blue-50' : ''}`}>
      <div className="flex items-center space-x-3">
        <input
          type="radio"
          id="cash"
          name="payment"
          checked={isSelected}
          onChange={onSelect}
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
      {isSelected && (
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
                  onChange={(e) => onAmountPaidChange(Number(e.target.value))}
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
                  onClick={() => onAmountPaidChange(total)}
                  className="text-xs"
                >
                  Vừa đủ
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => onAmountPaidChange(Math.ceil(total / 10000) * 10000)}
                  className="text-xs"
                >
                  Làm tròn
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => onAmountPaidChange(total + 50000)}
                  className="text-xs"
                >
                  +50k
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 