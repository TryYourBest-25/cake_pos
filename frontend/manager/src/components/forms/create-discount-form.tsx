"use client";

import { useState } from "react";
import { Loader2, Calendar } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { CreateDiscountDto } from "@/types/api";

interface CreateDiscountFormProps {
  onSubmit: (data: CreateDiscountDto) => Promise<void>;
  isSubmitting?: boolean;
  onCancel?: () => void;
}

export function CreateDiscountForm({
  onSubmit,
  isSubmitting = false,
  onCancel,
}: CreateDiscountFormProps) {
  const [formData, setFormData] = useState<CreateDiscountDto>({
    name: "",
    description: "",
    coupon_code: "",
    discount_value: 0,
    min_required_order_value: 0,
    max_discount_amount: 0,
    valid_until: "",
    is_active: true,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = "Tên chương trình là bắt buộc";
    }

    if (!formData.coupon_code.trim()) {
      newErrors.coupon_code = "Mã giảm giá là bắt buộc";
    } else if (!/^[A-Z0-9]+$/.test(formData.coupon_code)) {
      newErrors.coupon_code = "Mã chỉ chứa chữ hoa và số";
    }

    if (formData.discount_value <= 0 || formData.discount_value > 100) {
      newErrors.discount_value = "Giá trị phải từ 1-100%";
    }

    if (formData.min_required_order_value < 0) {
      newErrors.min_required_order_value = "Giá trị phải >= 0";
    }

    if (formData.max_discount_amount <= 0) {
      newErrors.max_discount_amount = "Số tiền giảm tối đa phải > 0";
    }

    if (!formData.valid_until) {
      newErrors.valid_until = "Ngày kết thúc là bắt buộc";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validate()) {
      return;
    }

    try {
      await onSubmit(formData);
      // Reset form after successful submission
      setFormData({
        name: "",
        description: "",
        coupon_code: "",
        discount_value: 0,
        min_required_order_value: 0,
        max_discount_amount: 0,
        valid_until: "",
        is_active: true,
      });
      setErrors({});
    } catch (error) {
      console.error("Lỗi submit form:", error);
    }
  };

  const handleChange = (field: keyof CreateDiscountDto, value: string | number | boolean | undefined) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: "" }));
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Tên chương trình */}
        <div className="md:col-span-2 space-y-2">
          <Label htmlFor="name">
            Tên chương trình khuyến mãi <span className="text-destructive">*</span>
          </Label>
          <Input
            id="name"
            placeholder="Ví dụ: Giảm giá mùa hè 2024"
            value={formData.name}
            onChange={(e) => handleChange("name", e.target.value)}
            className={errors.name ? "border-destructive" : ""}
          />
          {errors.name && <p className="text-sm text-destructive">{errors.name}</p>}
        </div>

        {/* Mã giảm giá */}
        <div className="space-y-2">
          <Label htmlFor="coupon_code">
            Mã giảm giá <span className="text-destructive">*</span>
          </Label>
          <Input
            id="coupon_code"
            placeholder="SUMMER2024"
            value={formData.coupon_code}
            onChange={(e) => handleChange("coupon_code", e.target.value.toUpperCase())}
            className={errors.coupon_code ? "border-destructive" : ""}
          />
          <p className="text-sm text-muted-foreground">Chỉ chữ hoa và số</p>
          {errors.coupon_code && <p className="text-sm text-destructive">{errors.coupon_code}</p>}
        </div>

        {/* Giá trị giảm giá */}
        <div className="space-y-2">
          <Label htmlFor="discount_value">
            Giá trị giảm giá (%) <span className="text-destructive">*</span>
          </Label>
          <Input
            id="discount_value"
            type="number"
            min="1"
            max="100"
            placeholder="10"
            value={formData.discount_value}
            onChange={(e) => handleChange("discount_value", parseFloat(e.target.value) || 0)}
            className={errors.discount_value ? "border-destructive" : ""}
          />
          {errors.discount_value && <p className="text-sm text-destructive">{errors.discount_value}</p>}
        </div>

        {/* Đơn hàng tối thiểu */}
        <div className="space-y-2">
          <Label htmlFor="min_required_order_value">
            Đơn hàng tối thiểu (VND) <span className="text-destructive">*</span>
          </Label>
          <Input
            id="min_required_order_value"
            type="number"
            min="0"
            placeholder="100000"
            value={formData.min_required_order_value}
            onChange={(e) => handleChange("min_required_order_value", parseInt(e.target.value) || 0)}
            className={errors.min_required_order_value ? "border-destructive" : ""}
          />
          {errors.min_required_order_value && <p className="text-sm text-destructive">{errors.min_required_order_value}</p>}
        </div>

        {/* Giảm tối đa */}
        <div className="space-y-2">
          <Label htmlFor="max_discount_amount">
            Số tiền giảm tối đa (VND) <span className="text-destructive">*</span>
          </Label>
          <Input
            id="max_discount_amount"
            type="number"
            min="1"
            placeholder="50000"
            value={formData.max_discount_amount}
            onChange={(e) => handleChange("max_discount_amount", parseInt(e.target.value) || 0)}
            className={errors.max_discount_amount ? "border-destructive" : ""}
          />
          {errors.max_discount_amount && <p className="text-sm text-destructive">{errors.max_discount_amount}</p>}
        </div>

        {/* Ngày kết thúc */}
        <div className="space-y-2">
          <Label htmlFor="valid_until">
            Ngày kết thúc <span className="text-destructive">*</span>
          </Label>
          <div className="relative">
            <Input
              id="valid_until"
              type="datetime-local"
              value={formData.valid_until}
              onChange={(e) => handleChange("valid_until", e.target.value)}
              className={errors.valid_until ? "border-destructive" : ""}
            />
          </div>
          {errors.valid_until && <p className="text-sm text-destructive">{errors.valid_until}</p>}
        </div>

        {/* Ngày bắt đầu */}
        <div className="space-y-2">
          <Label htmlFor="valid_from">Ngày bắt đầu</Label>
          <div className="relative">
            <Input
              id="valid_from"
              type="datetime-local"
              value={formData.valid_from || ""}
              onChange={(e) => handleChange("valid_from", e.target.value || undefined)}
            />
          </div>
          <p className="text-sm text-muted-foreground">Để trống nếu áp dụng ngay</p>
        </div>
      </div>

      {/* Các giới hạn sử dụng */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium">Giới Hạn Sử Dụng</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label htmlFor="max_uses">Số lần sử dụng tối đa</Label>
            <Input
              id="max_uses"
              type="number"
              min="1"
              placeholder="100"
              value={formData.max_uses || ""}
              onChange={(e) => handleChange("max_uses", parseInt(e.target.value) || undefined)}
            />
            <p className="text-sm text-muted-foreground">Để trống nếu không giới hạn</p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="max_uses_per_customer">Số lần sử dụng/khách hàng</Label>
            <Input
              id="max_uses_per_customer"
              type="number"
              min="1"
              placeholder="1"
              value={formData.max_uses_per_customer || ""}
              onChange={(e) => handleChange("max_uses_per_customer", parseInt(e.target.value) || undefined)}
            />
            <p className="text-sm text-muted-foreground">Để trống nếu không giới hạn</p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="min_required_product">Số lượng sản phẩm tối thiểu</Label>
            <Input
              id="min_required_product"
              type="number"
              min="1"
              placeholder="2"
              value={formData.min_required_product || ""}
              onChange={(e) => handleChange("min_required_product", parseInt(e.target.value) || undefined)}
            />
            <p className="text-sm text-muted-foreground">Để trống nếu không giới hạn</p>
          </div>
        </div>
      </div>

      {/* Mô tả */}
      <div className="space-y-2">
        <Label htmlFor="description">Mô tả</Label>
        <Textarea
          id="description"
          placeholder="Mô tả chi tiết về chương trình khuyến mãi..."
          className="min-h-[100px]"
          value={formData.description || ""}
          onChange={(e) => handleChange("description", e.target.value || undefined)}
        />
      </div>

      {/* Trạng thái */}
      <div className="flex flex-row items-center justify-between rounded-lg border p-4">
        <div className="space-y-0.5">
          <Label className="text-base">Kích hoạt ngay</Label>
          <p className="text-sm text-muted-foreground">
            Chương trình sẽ có hiệu lực ngay sau khi tạo
          </p>
        </div>
        <Switch
          checked={formData.is_active}
          onCheckedChange={(checked) => handleChange("is_active", checked)}
        />
      </div>

      {/* Buttons */}
      <div className="flex justify-end space-x-2">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={isSubmitting}
        >
          Hủy
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Đang tạo...
            </>
          ) : (
            "Tạo chương trình"
          )}
        </Button>
      </div>
    </form>
  );
} 