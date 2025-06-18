import { z } from "zod";

// Schema cho tạo category mới (match với backend CreateCategoryDto)
export const createCategorySchema = z.object({
  name: z
    .string()
    .min(1, "Tên danh mục không được để trống")
    .max(100, "Tên danh mục không được vượt quá 100 ký tự")
    .regex(/^[a-zA-ZÀ-ỹ0-9\s]+$/, "Tên danh mục chỉ được chứa chữ cái, số và khoảng trắng"),
  
  description: z
    .string()
    .max(1000, "Mô tả không được vượt quá 1000 ký tự")
    .optional(),
});

// Schema cho cập nhật category (UpdateCategoryDto extends PartialType(CreateCategoryDto))
export const updateCategorySchema = z.object({
  name: z
    .string()
    .min(1, "Tên danh mục không được để trống")
    .max(100, "Tên danh mục không được vượt quá 100 ký tự")
    .regex(/^[a-zA-ZÀ-ỹ0-9\s]+$/, "Tên danh mục chỉ được chứa chữ cái, số và khoảng trắng")
    .optional(),
  
  description: z
    .string()
    .max(1000, "Mô tả không được vượt quá 1000 ký tự")
    .optional(),
});

// Schema cho bulk delete
export const bulkDeleteCategorySchema = z.object({
  ids: z
    .array(z.number())
    .min(1, "Phải chọn ít nhất một danh mục để xóa"),
});

// Types được suy ra từ schemas
export type CreateCategoryFormData = z.infer<typeof createCategorySchema>;
export type UpdateCategoryFormData = z.infer<typeof updateCategorySchema>;
export type BulkDeleteCategoryFormData = z.infer<typeof bulkDeleteCategorySchema>;

// Transform functions để convert form data sang DTO backend
export function transformCreateCategoryFormData(formData: CreateCategoryFormData) {
  return {
    name: formData.name,
    description: formData.description,
  };
}

export function transformUpdateCategoryFormData(formData: UpdateCategoryFormData) {
  const result: Record<string, unknown> = {};
  
  if (formData.name !== undefined) result.name = formData.name;
  if (formData.description !== undefined) result.description = formData.description;
  
  return result;
} 