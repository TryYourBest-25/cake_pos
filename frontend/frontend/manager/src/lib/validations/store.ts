import { z } from "zod";

// Store validation schema
export const createStoreSchema = z.object({
  name: z
    .string()
    .min(1, "Tên cửa hàng không được để trống")
    .max(100, "Tên cửa hàng không được vượt quá 100 ký tự"),
  
  address: z
    .string()
    .min(1, "Địa chỉ không được để trống")
    .max(255, "Địa chỉ không được vượt quá 255 ký tự"),
  
  phone: z
    .string()
    .min(10, "Số điện thoại phải có ít nhất 10 số")
    .max(15, "Số điện thoại không được vượt quá 15 ký tự")
    .regex(/^[0-9+\-\s()]{10,15}$/, "Số điện thoại không hợp lệ"),
  
  opening_time: z
    .string()
    .regex(/^([01]\d|2[0-3]):([0-5]\d)(:([0-5]\d))?$/, "Định dạng thời gian không hợp lệ (HH:mm hoặc HH:mm:ss)"),
  
  closing_time: z
    .string()
    .regex(/^([01]\d|2[0-3]):([0-5]\d)(:([0-5]\d))?$/, "Định dạng thời gian không hợp lệ (HH:mm hoặc HH:mm:ss)"),
  
  email: z
    .string()
    .email("Email không hợp lệ")
    .max(100, "Email không được vượt quá 100 ký tự"),
  
  opening_date: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Định dạng ngày không hợp lệ (YYYY-MM-DD)"),
  
  tax_code: z
    .string()
    .min(1, "Mã số thuế không được để trống")
    .max(20, "Mã số thuế không được vượt quá 20 ký tự"),
});

export type CreateStoreFormData = z.infer<typeof createStoreSchema>;

// Update store schema (all fields optional)
export const updateStoreSchema = z.object({
  name: z
    .string()
    .min(1, "Tên cửa hàng không được để trống")
    .max(100, "Tên cửa hàng không được vượt quá 100 ký tự")
    .optional(),
  
  address: z
    .string()
    .min(1, "Địa chỉ không được để trống")
    .max(255, "Địa chỉ không được vượt quá 255 ký tự")
    .optional(),
  
  phone: z
    .string()
    .min(10, "Số điện thoại phải có ít nhất 10 số")
    .max(15, "Số điện thoại không được vượt quá 15 ký tự")
    .regex(/^[0-9+\-\s()]{10,15}$/, "Số điện thoại không hợp lệ")
    .optional(),
  
  opening_time: z
    .string()
    .regex(/^([01]\d|2[0-3]):([0-5]\d)(:([0-5]\d))?$/, "Định dạng thời gian không hợp lệ (HH:mm hoặc HH:mm:ss)")
    .optional(),
  
  closing_time: z
    .string()
    .regex(/^([01]\d|2[0-3]):([0-5]\d)(:([0-5]\d))?$/, "Định dạng thời gian không hợp lệ (HH:mm hoặc HH:mm:ss)")
    .optional(),
  
  email: z
    .string()
    .email("Email không hợp lệ")
    .max(100, "Email không được vượt quá 100 ký tự")
    .optional(),
  
  opening_date: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Định dạng ngày không hợp lệ (YYYY-MM-DD)")
    .optional(),
  
  tax_code: z
    .string()
    .min(1, "Mã số thuế không được để trống")
    .max(20, "Mã số thuế không được vượt quá 20 ký tự")
    .optional(),
});

export type UpdateStoreFormData = z.infer<typeof updateStoreSchema>;

// Validation for opening/closing time comparison
export const validateStoreHours = (opening_time: string, closing_time: string): boolean => {
  try {
    const openTime = new Date(`1970-01-01T${opening_time}`);
    const closeTime = new Date(`1970-01-01T${closing_time}`);
    return openTime < closeTime;
  } catch {
    return false;
  }
};

// Custom validation for store hours
export const storeHoursSchema = z.object({
  opening_time: z.string(),
  closing_time: z.string(),
}).refine(
  (data) => validateStoreHours(data.opening_time, data.closing_time),
  {
    message: "Giờ đóng cửa phải sau giờ mở cửa",
    path: ["closing_time"],
  }
); 