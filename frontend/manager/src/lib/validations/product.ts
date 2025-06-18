import { z } from "zod";

// Schema cho product price trong create product (có thể tạo size mới hoặc chọn size có sẵn)
export const createProductPriceItemSchema = z.object({
  size_id: z
    .number()
    .int("ID kích thước phải là số nguyên")
    .min(1, "ID kích thước phải lớn hơn 0")
    .optional(),
  
  size_data: z.object({
    name: z
      .string()
      .min(1, "Tên kích thước không được để trống")
      .max(50, "Tên kích thước không được vượt quá 50 ký tự"),
    unit: z
      .string()
      .min(1, "Đơn vị không được để trống")
      .max(20, "Đơn vị không được vượt quá 20 ký tự"),
    quantity: z
      .number()
      .int("Số lượng phải là số nguyên")
      .min(1, "Số lượng phải lớn hơn 0"),
    description: z
      .string()
      .max(255, "Mô tả không được vượt quá 255 ký tự")
      .optional(),
  }).optional(),
  
  price: z
    .number()
    .int("Giá phải là số nguyên")
    .min(0, "Giá phải lớn hơn hoặc bằng 0")
    .max(999999999, "Giá không được vượt quá 999,999,999"),
  
  is_active: z
    .boolean()
    .default(true),
}).refine(
  (data) => {
    // Phải có size_id HOẶC size_data, không được có cả hai hoặc không có gì
    const hasSize = Boolean(data.size_id);
    const hasSizeData = Boolean(data.size_data);
    return hasSize !== hasSizeData; // XOR: chỉ một trong hai
  },
  {
    message: "Phải chọn kích thước có sẵn HOẶC tạo kích thước mới, không được có cả hai",
  }
);

// Schema cho tạo product mới (match với backend CreateProductDto)
export const createProductSchema = z.object({
  name: z
    .string()
    .min(1, "Tên sản phẩm không được để trống")
    .max(50, "Tên sản phẩm không được vượt quá 50 ký tự"),
  
  description: z
    .string()
    .max(255, "Mô tả không được vượt quá 255 ký tự")
    .optional(),
  
  is_signature: z
    .boolean()
    .default(false),
  
  image_path: z
    .string()
    .max(255, "Đường dẫn hình ảnh không được vượt quá 255 ký tự")
    .optional(),
  
  category_id: z
    .number()
    .int("ID danh mục phải là số nguyên")
    .min(1, "ID danh mục phải lớn hơn 0"),
  
  prices: z
    .array(createProductPriceItemSchema)
    .min(1, "Sản phẩm phải có ít nhất một giá"),
});

// Schema cho cập nhật product (UpdateProductDto)
export const updateProductSchema = z.object({
  name: z
    .string()
    .min(1, "Tên sản phẩm không được để trống")
    .max(50, "Tên sản phẩm không được vượt quá 50 ký tự")
    .optional(),
  
  description: z
    .string()
    .max(255, "Mô tả không được vượt quá 255 ký tự")
    .optional(),
  
  is_signature: z
    .boolean()
    .optional(),
  
  image_path: z
    .string()
    .max(255, "Đường dẫn hình ảnh không được vượt quá 255 ký tự")
    .optional(),
  
  category_id: z
    .number()
    .int("ID danh mục phải là số nguyên")
    .min(1, "ID danh mục phải lớn hơn 0")
    .optional(),
});

// Schema cho tạo giá sản phẩm mới (CreateProductPriceDto - chỉ với size có sẵn)
export const createProductPriceSchema = z.object({
  product_id: z
    .number()
    .int("ID sản phẩm phải là số nguyên")
    .min(1, "ID sản phẩm phải lớn hơn 0"),
  
  size_id: z
    .number()
    .int("ID kích thước phải là số nguyên")
    .min(1, "Vui lòng chọn kích thước"),
  
  price: z
    .number()
    .int("Giá phải là số nguyên")
    .min(1000, "Giá phải ít nhất 1,000 VNĐ")
    .max(10000000, "Giá không được vượt quá 10,000,000 VNĐ"),
  
  is_active: z
    .boolean(),
});

// Schema cho cập nhật giá sản phẩm (UpdateProductPriceDto)
export const updateProductPriceSchema = z.object({
  price: z
    .number()
    .int("Giá phải là số nguyên")
    .min(1000, "Giá phải ít nhất 1,000 VNĐ")
    .max(10000000, "Giá không được vượt quá 10,000,000 VNĐ"),
  
  is_active: z
    .boolean(),
});

// Schema cho bulk delete
export const bulkDeleteProductSchema = z.object({
  ids: z
    .array(z.number())
    .min(1, "Phải chọn ít nhất một sản phẩm để xóa"),
});

// Types được suy ra từ schemas
export type CreateProductPriceItemFormData = z.infer<typeof createProductPriceItemSchema>;
export type CreateProductFormData = z.infer<typeof createProductSchema>;
export type UpdateProductFormData = z.infer<typeof updateProductSchema>;
export type CreateProductPriceFormData = z.infer<typeof createProductPriceSchema>;
export type UpdateProductPriceFormData = z.infer<typeof updateProductPriceSchema>;
export type BulkDeleteProductFormData = z.infer<typeof bulkDeleteProductSchema>;

// Transform functions để convert form data sang DTO backend
export function transformCreateProductFormData(formData: CreateProductFormData) {
  return {
    name: formData.name,
    description: formData.description,
    is_signature: formData.is_signature,
    image_path: formData.image_path,
    category_id: formData.category_id,
    prices: formData.prices.map(price => ({
      size_id: price.size_id,
      size_data: price.size_data,
      price: price.price,
      is_active: price.is_active,
    })),
  };
}

export function transformUpdateProductFormData(formData: UpdateProductFormData) {
  const result: Record<string, unknown> = {};
  
  if (formData.name !== undefined) result.name = formData.name;
  if (formData.description !== undefined) result.description = formData.description;
  if (formData.is_signature !== undefined) result.is_signature = formData.is_signature;
  if (formData.image_path !== undefined) result.image_path = formData.image_path;
  if (formData.category_id !== undefined) result.category_id = formData.category_id;
  
  return result;
} 