import { z } from "zod";

// Schema cho tạo manager mới
export const createManagerSchema = z.object({
  name: z
    .string()
    .min(2, "Tên phải có ít nhất 2 ký tự")
    .max(100, "Tên không được vượt quá 100 ký tự")
    .regex(/^[a-zA-ZÀ-ỹ\s]+$/, "Tên chỉ được chứa chữ cái và khoảng trắng"),
  
  email: z
    .string()
    .email("Email không hợp lệ")
    .min(1, "Email là bắt buộc"),
  
  password: z
    .string()
    .min(6, "Mật khẩu phải có ít nhất 6 ký tự")
    .max(50, "Mật khẩu không được vượt quá 50 ký tự"),
  
  avatar: z
    .string()
    .url("URL avatar không hợp lệ")
    .optional()
    .or(z.literal("")),
  
  permissions: z
    .array(z.string())
    .min(1, "Phải chọn ít nhất một quyền hạn")
    .optional(),
  
  isActive: z
    .boolean()
    .optional()
    .default(true),
});

// Schema cho cập nhật manager
export const updateManagerSchema = z.object({
  name: z
    .string()
    .min(2, "Tên phải có ít nhất 2 ký tự")
    .max(100, "Tên không được vượt quá 100 ký tự")
    .regex(/^[a-zA-ZÀ-ỹ\s]+$/, "Tên chỉ được chứa chữ cái và khoảng trắng")
    .optional(),
  
  email: z
    .string()
    .email("Email không hợp lệ")
    .optional(),
  
  password: z
    .string()
    .min(6, "Mật khẩu phải có ít nhất 6 ký tự")
    .max(50, "Mật khẩu không được vượt quá 50 ký tự")
    .optional()
    .or(z.literal("")),
  
  avatar: z
    .string()
    .url("URL avatar không hợp lệ")
    .optional()
    .or(z.literal("")),
  
  isActive: z
    .boolean()
    .optional(),
  
  permissions: z
    .array(z.string())
    .optional(),
});

// Schema cho bulk delete
export const bulkDeleteManagerSchema = z.object({
  ids: z
    .array(z.number())
    .min(1, "Phải chọn ít nhất một quản lý để xóa"),
});

// Types được suy ra từ schemas
export type CreateManagerFormData = z.infer<typeof createManagerSchema>;
export type UpdateManagerFormData = z.infer<typeof updateManagerSchema>;
export type BulkDeleteManagerFormData = z.infer<typeof bulkDeleteManagerSchema>;

// Danh sách quyền hạn có sẵn
export const AVAILABLE_PERMISSIONS = [
  { value: "USER_MANAGEMENT", label: "Quản lý người dùng" },
  { value: "PRODUCT_MANAGEMENT", label: "Quản lý sản phẩm" },
  { value: "ORDER_MANAGEMENT", label: "Quản lý đơn hàng" },
  { value: "REPORT_VIEW", label: "Xem báo cáo" },
  { value: "SYSTEM_ADMIN", label: "Quản trị hệ thống" },
] as const; 