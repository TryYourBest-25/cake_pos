import { z } from "zod";

// Schema cho tạo manager mới (match với backend CreateManagerDto) - bỏ password
export const createManagerSchema = z.object({
  first_name: z
    .string()
    .min(1, "Tên không được để trống")
    .max(70, "Tên không được vượt quá 70 ký tự")
    .regex(/^[a-zA-ZÀ-ỹ\s]+$/, "Tên chỉ được chứa chữ cái và khoảng trắng"),
  
  last_name: z
    .string()
    .min(1, "Họ không được để trống")
    .max(70, "Họ không được vượt quá 70 ký tự")
    .regex(/^[a-zA-ZÀ-ỹ\s]+$/, "Họ chỉ được chứa chữ cái và khoảng trắng"),
  
  email: z
    .string()
    .email("Email không hợp lệ")
    .min(1, "Email không được để trống")
    .max(100, "Email không được vượt quá 100 ký tự"),
  
  phone: z
    .string()
    .min(1, "Số điện thoại không được để trống")
    .max(15, "Số điện thoại không được vượt quá 15 ký tự")
    .regex(/^[0-9+\-\s()]+$/, "Số điện thoại không hợp lệ"),
  
  gender: z
    .enum(["MALE", "FEMALE"])
    .optional(),
  
  username: z
    .string()
    .min(3, "Tên đăng nhập phải có ít nhất 3 ký tự")
    .max(50, "Tên đăng nhập không được vượt quá 50 ký tự")
    .regex(/^[a-zA-Z0-9_]+$/, "Tên đăng nhập chỉ được chứa chữ cái, số và dấu gạch dưới"),
});

// Schema cho cập nhật manager (UpdateManagerDto extends PartialType(CreateManagerDto))
export const updateManagerSchema = z.object({
  first_name: z
    .string()
    .min(1, "Tên không được để trống")
    .max(70, "Tên không được vượt quá 70 ký tự")
    .regex(/^[a-zA-ZÀ-ỹ\s]+$/, "Tên chỉ được chứa chữ cái và khoảng trắng")
    .optional(),
  
  last_name: z
    .string()
    .min(1, "Họ không được để trống")
    .max(70, "Họ không được vượt quá 70 ký tự")
    .regex(/^[a-zA-ZÀ-ỹ\s]+$/, "Họ chỉ được chứa chữ cái và khoảng trắng")
    .optional(),
  
  email: z
    .string()
    .email("Email không hợp lệ")
    .max(100, "Email không được vượt quá 100 ký tự")
    .optional(),
  
  phone: z
    .string()
    .max(15, "Số điện thoại không được vượt quá 15 ký tự")
    .regex(/^[0-9+\-\s()]+$/, "Số điện thoại không hợp lệ")
    .optional(),
  
  gender: z
    .enum(["MALE", "FEMALE"])
    .optional(),
  
  username: z
    .string()
    .min(3, "Tên đăng nhập phải có ít nhất 3 ký tự")
    .max(50, "Tên đăng nhập không được vượt quá 50 ký tự")
    .regex(/^[a-zA-Z0-9_]+$/, "Tên đăng nhập chỉ được chứa chữ cái, số và dấu gạch dưới")
    .optional(),
  
  password: z
    .string()
    .min(8, "Mật khẩu phải có ít nhất 8 ký tự")
    .max(255, "Mật khẩu không được vượt quá 255 ký tự")
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

// Transform function để convert form data sang DTO backend
export function transformCreateManagerFormData(formData: CreateManagerFormData) {
  return {
    first_name: formData.first_name,
    last_name: formData.last_name,
    email: formData.email,
    phone: formData.phone,
    gender: formData.gender,
    username: formData.username,
  };
}

export function transformUpdateManagerFormData(formData: UpdateManagerFormData) {
  const result: any = {};
  
  if (formData.first_name !== undefined) result.first_name = formData.first_name;
  if (formData.last_name !== undefined) result.last_name = formData.last_name;
  if (formData.email !== undefined) result.email = formData.email;
  if (formData.phone !== undefined) result.phone = formData.phone;
  if (formData.gender !== undefined) result.gender = formData.gender;
  if (formData.username !== undefined) result.username = formData.username;
  if (formData.password !== undefined) result.password = formData.password;
  
  return result;
}

// Danh sách quyền hạn có sẵn (mock data)
export const AVAILABLE_PERMISSIONS = [
  { value: "MANAGE_USERS", label: "Quản lý người dùng" },
  { value: "MANAGE_PRODUCTS", label: "Quản lý sản phẩm" },
  { value: "MANAGE_ORDERS", label: "Quản lý đơn hàng" },
  { value: "VIEW_REPORTS", label: "Xem báo cáo" },
  { value: "SYSTEM_ADMIN", label: "Quản trị hệ thống" },
] as const; 