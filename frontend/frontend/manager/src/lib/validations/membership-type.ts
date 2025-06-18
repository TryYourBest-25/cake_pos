import { z } from "zod";

// Schema cho việc tạo membership type mới - dựa trên CreateMembershipTypeDto của backend
export const createMembershipTypeSchema = z.object({
  type: z.string()
    .min(1, "Tên loại thành viên không được để trống")
    .max(50, "Tên loại thành viên không được quá 50 ký tự")
    .refine(value => value.trim() !== "", "Tên loại thành viên không được chỉ chứa khoảng trắng"),
    
  discountValue: z.number()
    .min(0, "Giá trị giảm giá không được âm")
    .max(100, "Giá trị giảm giá không được quá 100%"),
    
  requiredPoint: z.number()
    .int("Điểm yêu cầu phải là số nguyên")
    .min(0, "Điểm yêu cầu không được âm"),
    
  description: z.string()
    .max(255, "Mô tả không được quá 255 ký tự")
    .optional(),
    
  validUntil: z.string()
    .optional()
    .refine((val) => {
      if (!val) return true;
      // Accept both YYYY-MM-DD and YYYY-MM-DDTHH:mm formats
      return /^\d{4}-\d{2}-\d{2}(T\d{2}:\d{2})?$/.test(val);
    }, "Ngày hết hạn phải có định dạng hợp lệ"),
    
  isActive: z.boolean()
    .optional(),
});

// Schema cho việc cập nhật membership type - tất cả fields đều optional
export const updateMembershipTypeSchema = z.object({
  type: z.string()
    .min(1, "Tên loại thành viên không được để trống")
    .max(50, "Tên loại thành viên không được quá 50 ký tự")
    .refine(value => value.trim() !== "", "Tên loại thành viên không được chỉ chứa khoảng trắng")
    .optional(),
    
  discountValue: z.number()
    .min(0, "Giá trị giảm giá không được âm")
    .max(100, "Giá trị giảm giá không được quá 100%")
    .optional(),
    
  requiredPoint: z.number()
    .int("Điểm yêu cầu phải là số nguyên")
    .min(0, "Điểm yêu cầu không được âm")
    .optional(),
    
  description: z.string()
    .max(255, "Mô tả không được quá 255 ký tự")
    .optional(),
    
  validUntil: z.string()
    .optional()
    .refine((val) => {
      if (!val) return true;
      // Accept both YYYY-MM-DD and YYYY-MM-DDTHH:mm formats
      return /^\d{4}-\d{2}-\d{2}(T\d{2}:\d{2})?$/.test(val);
    }, "Ngày hết hạn phải có định dạng hợp lệ"),
    
  isActive: z.boolean()
    .optional(),
});

// Infer types from schemas
export type CreateMembershipTypeFormData = z.infer<typeof createMembershipTypeSchema>;
export type UpdateMembershipTypeFormData = z.infer<typeof updateMembershipTypeSchema>;

// Transform functions để chuyển đổi dữ liệu giữa frontend và backend
export function transformCreateMembershipTypeFormData(formData: CreateMembershipTypeFormData) {
  return {
    type: formData.type,
    discount_value: formData.discountValue,
    required_point: formData.requiredPoint,
    description: formData.description,
    // Chuyển đổi datetime-local (YYYY-MM-DDTHH:mm) thành date (YYYY-MM-DD)
    valid_until: formData.validUntil ? formData.validUntil.split('T')[0] : undefined,
    is_active: formData.isActive,
  };
}

export function transformUpdateMembershipTypeFormData(formData: UpdateMembershipTypeFormData) {
  const result: any = {};
  
  if (formData.type !== undefined) result.type = formData.type;
  if (formData.discountValue !== undefined) result.discount_value = formData.discountValue;
  if (formData.requiredPoint !== undefined) result.required_point = formData.requiredPoint;
  if (formData.description !== undefined) result.description = formData.description;
  // Chuyển đổi datetime-local (YYYY-MM-DDTHH:mm) thành date (YYYY-MM-DD)
  if (formData.validUntil !== undefined) result.valid_until = formData.validUntil ? formData.validUntil.split('T')[0] : undefined;
  if (formData.isActive !== undefined) result.is_active = formData.isActive;
  
  return result;
} 