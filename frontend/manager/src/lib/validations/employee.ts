import { z } from "zod";

// Schema cho việc tạo nhân viên mới - dựa trên CreateEmployeeDto của backend
export const createEmployeeSchema = z.object({
  firstName: z.string()
    .min(1, "Tên không được để trống")
    .max(70, "Tên không được quá 70 ký tự")
    .refine(value => value.trim() !== "", "Tên không được chỉ chứa khoảng trắng"),
    
  lastName: z.string()
    .min(1, "Họ không được để trống")
    .max(70, "Họ không được quá 70 ký tự")
    .refine(value => value.trim() !== "", "Họ không được chỉ chứa khoảng trắng"),
    
  email: z.string()
    .email("Email không hợp lệ")
    .min(1, "Email không được để trống")
    .max(255, "Email không được quá 255 ký tự"),
    
  phone: z.string()
    .min(1, "Số điện thoại không được để trống")
    .max(15, "Số điện thoại không được quá 15 ký tự")
    .regex(/^(\+84|0)[0-9]{9,10}$/, "Số điện thoại không đúng định dạng"),
    
  position: z.string()
    .min(1, "Vị trí không được để trống")
    .max(100, "Vị trí không được quá 100 ký tự"),
    
  username: z.string()
    .min(3, "Tên đăng nhập phải có ít nhất 3 ký tự")
    .max(50, "Tên đăng nhập không được quá 50 ký tự")
    .regex(/^[a-zA-Z0-9_]+$/, "Tên đăng nhập chỉ được chứa chữ cái, số và dấu gạch dưới"),
});

// Schema cho việc cập nhật nhân viên - dựa trên UpdateEmployeeDto (PartialType của CreateEmployeeDto)
export const updateEmployeeSchema = z.object({
  firstName: z.string()
    .min(1, "Tên không được để trống")
    .max(70, "Tên không được quá 70 ký tự")
    .refine(value => value.trim() !== "", "Tên không được chỉ chứa khoảng trắng")
    .optional(),
    
  lastName: z.string()
    .min(1, "Họ không được để trống")
    .max(70, "Họ không được quá 70 ký tự")
    .refine(value => value.trim() !== "", "Họ không được chỉ chứa khoảng trắng")
    .optional(),
    
  email: z.string()
    .email("Email không hợp lệ")
    .min(1, "Email không được để trống")
    .max(255, "Email không được quá 255 ký tự")
    .optional(),
    
  phone: z.string()
    .min(1, "Số điện thoại không được để trống")
    .max(15, "Số điện thoại không được quá 15 ký tự")
    .regex(/^(\+84|0)[0-9]{9,10}$/, "Số điện thoại không đúng định dạng")
    .optional(),
    
  position: z.string()
    .min(1, "Vị trí không được để trống")
    .max(100, "Vị trí không được quá 100 ký tự")
    .optional(),
    
  username: z.string()
    .min(3, "Tên đăng nhập phải có ít nhất 3 ký tự")
    .max(50, "Tên đăng nhập không được quá 50 ký tự")
    .regex(/^[a-zA-Z0-9_]+$/, "Tên đăng nhập chỉ được chứa chữ cái, số và dấu gạch dưới")
    .optional(),
});

// Schema cho bulk delete
export const bulkDeleteEmployeeSchema = z.object({
  ids: z.array(z.number())
    .min(1, "Vui lòng chọn ít nhất một nhân viên để xóa"),
});

// Infer types from schemas
export type CreateEmployeeFormData = z.infer<typeof createEmployeeSchema>;
export type UpdateEmployeeFormData = z.infer<typeof updateEmployeeSchema>;
export type BulkDeleteEmployeeFormData = z.infer<typeof bulkDeleteEmployeeSchema>;

// Transform functions để chuyển đổi dữ liệu giữa frontend và backend
export function transformCreateEmployeeFormData(formData: CreateEmployeeFormData) {
  return {
    first_name: formData.firstName,
    last_name: formData.lastName,
    email: formData.email,
    phone: formData.phone,
    position: formData.position,
    username: formData.username,
  };
}

export function transformUpdateEmployeeFormData(formData: UpdateEmployeeFormData) {
  const result: any = {};
  
  if (formData.firstName) result.first_name = formData.firstName;
  if (formData.lastName) result.last_name = formData.lastName;
  if (formData.email) result.email = formData.email;
  if (formData.phone) result.phone = formData.phone;
  if (formData.position) result.position = formData.position;
  if (formData.username) result.username = formData.username;
  
  return result;
} 