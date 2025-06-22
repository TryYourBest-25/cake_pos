import { z } from "zod";

// Schema cho tạo product size
export const createProductSizeSchema = z.object({
  name: z.string()
    .min(1, "Tên kích thước là bắt buộc")
    .max(5, "Tên kích thước không được vượt quá 5 ký tự")
    .trim(),
  
  unit: z.string()
    .min(1, "Đơn vị là bắt buộc")
    .max(15, "Đơn vị không được vượt quá 15 ký tự")
    .trim(),
  
  quantity: z.number()
    .int("Số lượng phải là số nguyên")
    .min(1, "Số lượng phải lớn hơn 0")
    .max(32767, "Số lượng không được vượt quá 32767"),
  
  description: z.string()
    .max(1000, "Mô tả không được vượt quá 1000 ký tự")
    .optional()
    .nullable()
    .transform(val => val?.trim() || null),
});

// Schema cho cập nhật product size
export const updateProductSizeSchema = createProductSizeSchema.partial();

// Schema cho bulk delete product sizes
export const bulkDeleteProductSizeSchema = z.object({
  ids: z.array(z.number().int().positive())
    .min(1, "Phải chọn ít nhất một kích thước để xóa")
    .max(100, "Không thể xóa quá 100 kích thước cùng lúc"),
});

// Types
export type CreateProductSizeFormData = z.infer<typeof createProductSizeSchema>;
export type UpdateProductSizeFormData = z.infer<typeof updateProductSizeSchema>;
export type BulkDeleteProductSizeFormData = z.infer<typeof bulkDeleteProductSizeSchema>;

// Transform functions để convert form data sang DTO backend
export function transformCreateProductSizeFormData(formData: CreateProductSizeFormData) {
  return {
    name: formData.name,
    unit: formData.unit,
    quantity: formData.quantity,
    description: formData.description,
  };
}

export function transformUpdateProductSizeFormData(formData: UpdateProductSizeFormData) {
  const result: Record<string, unknown> = {};
  
  if (formData.name !== undefined) result.name = formData.name;
  if (formData.unit !== undefined) result.unit = formData.unit;
  if (formData.quantity !== undefined) result.quantity = formData.quantity;
  if (formData.description !== undefined) result.description = formData.description;
  
  return result;
} 