import { z } from "zod";
import { CreateDiscountDto, UpdateDiscountDto } from "@/types/api";

// Base discount validation schema
export const discountSchema = z.object({
  name: z
    .string()
    .min(1, "Tên khuyến mãi là bắt buộc")
    .max(500, "Tên khuyến mãi không được vượt quá 500 ký tự")
    .trim(),
  
  description: z
    .string()
    .max(1000, "Mô tả không được vượt quá 1000 ký tự")
    .optional()
    .or(z.literal("")),
  
  coupon_code: z
    .string()
    .min(1, "Mã giảm giá là bắt buộc")
    .max(50, "Mã giảm giá không được vượt quá 50 ký tự")
    .regex(/^[A-Z0-9]+$/, "Mã giảm giá chỉ được chứa chữ hoa và số")
    .trim(),
  
  discount_value: z
    .number()
    .min(0, "Giá trị giảm giá phải lớn hơn hoặc bằng 0")
    .max(100, "Giá trị giảm giá không được vượt quá 100%"),
  
  min_required_order_value: z
    .number()
    .min(0, "Giá trị đơn hàng tối thiểu phải lớn hơn hoặc bằng 0"),
  
  max_discount_amount: z
    .number()
    .min(0, "Số tiền giảm tối đa phải lớn hơn hoặc bằng 0"),
  
  min_required_product: z
    .number()
    .min(0, "Số lượng sản phẩm tối thiểu phải lớn hơn hoặc bằng 0")
    .optional(),
  
  valid_from: z
    .string()
    .datetime("Ngày bắt đầu không hợp lệ")
    .optional()
    .or(z.literal("")),
  
  valid_until: z
    .string()
    .datetime("Ngày kết thúc không hợp lệ")
    .min(1, "Ngày kết thúc là bắt buộc"),
  
  max_uses: z
    .number()
    .min(1, "Số lần sử dụng tối đa phải lớn hơn 0")
    .optional(),
  
  max_uses_per_customer: z
    .number()
    .min(1, "Số lần sử dụng tối đa mỗi khách hàng phải lớn hơn 0")
    .optional(),
  
  is_active: z
    .boolean()
    .default(true),
});

// Create discount form schema
export const createDiscountFormSchema = discountSchema.refine(
  (data) => {
    if (data.valid_from && data.valid_until) {
      return new Date(data.valid_from) < new Date(data.valid_until);
    }
    return true;
  },
  {
    message: "Ngày bắt đầu phải trước ngày kết thúc",
    path: ["valid_from"],
  }
);

// Update discount form schema (all fields optional except validations)
export const updateDiscountFormSchema = discountSchema.partial().refine(
  (data) => {
    if (data.valid_from && data.valid_until) {
      return new Date(data.valid_from) < new Date(data.valid_until);
    }
    return true;
  },
  {
    message: "Ngày bắt đầu phải trước ngày kết thúc",
    path: ["valid_from"],
  }
);

// TypeScript types derived from schemas
export type CreateDiscountFormData = z.infer<typeof createDiscountFormSchema>;
export type UpdateDiscountFormData = z.infer<typeof updateDiscountFormSchema>;

// Helper functions to transform form data to API DTOs
export function transformCreateDiscountFormData(formData: CreateDiscountFormData): CreateDiscountDto {
  return {
    name: formData.name,
    description: formData.description || undefined,
    coupon_code: formData.coupon_code,
    discount_value: formData.discount_value,
    min_required_order_value: formData.min_required_order_value,
    max_discount_amount: formData.max_discount_amount,
    min_required_product: formData.min_required_product,
    valid_from: formData.valid_from || undefined,
    valid_until: formData.valid_until,
    max_uses: formData.max_uses,
    max_uses_per_customer: formData.max_uses_per_customer,
    is_active: formData.is_active,
  };
}

export function transformUpdateDiscountFormData(formData: UpdateDiscountFormData): UpdateDiscountDto {
  return {
    name: formData.name,
    description: formData.description || undefined,
    coupon_code: formData.coupon_code,
    discount_value: formData.discount_value,
    min_required_order_value: formData.min_required_order_value,
    max_discount_amount: formData.max_discount_amount,
    min_required_product: formData.min_required_product,
    valid_from: formData.valid_from || undefined,
    valid_until: formData.valid_until,
    max_uses: formData.max_uses,
    max_uses_per_customer: formData.max_uses_per_customer,
    is_active: formData.is_active,
  };
}

// Default values for forms
export const defaultDiscountValues: Partial<CreateDiscountFormData> = {
  name: "",
  description: "",
  coupon_code: "",
  discount_value: 0,
  min_required_order_value: 0,
  max_discount_amount: 0,
  min_required_product: undefined,
  valid_from: "",
  valid_until: "",
  max_uses: undefined,
  max_uses_per_customer: undefined,
  is_active: true,
}; 