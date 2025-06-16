import { z } from "zod";

// Schema cho việc tạo khách hàng mới - dựa trên CreateCustomerDto của backend
// Backend sẽ tự động gán membership type và points
export const createCustomerSchema = z.object({
  lastName: z.string()
    .max(70, "Họ không được quá 70 ký tự")
    .optional(),
    
  firstName: z.string()
    .max(70, "Tên không được quá 70 ký tự")
    .optional(),
    
  phone: z.string()
    .min(1, "Số điện thoại không được để trống")
    .max(15, "Số điện thoại không được quá 15 ký tự")
    .regex(/^(\+84|0)[0-9]{9,10}$/, "Số điện thoại không đúng định dạng"),
    
  gender: z.enum(["MALE", "FEMALE", "OTHER"])
    .optional(),
    
  username: z.string()
    .refine((val) => val === "" || (val.length >= 3 && val.length <= 50), {
      message: "Tên đăng nhập phải có ít nhất 3 ký tự hoặc để trống"
    })
    .refine((val) => val === "" || /^[a-zA-Z0-9_]+$/.test(val), {
      message: "Tên đăng nhập chỉ được chứa chữ cái, số và dấu gạch dưới"
    })
    .optional(),
});

// Schema cho việc cập nhật khách hàng - tất cả fields đều optional
export const updateCustomerSchema = z.object({
  membershipTypeId: z.number()
    .min(1, "Vui lòng chọn loại thành viên")
    .optional(),
    
  lastName: z.string()
    .max(70, "Họ không được quá 70 ký tự")
    .optional(),
    
  firstName: z.string()
    .max(70, "Tên không được quá 70 ký tự")
    .optional(),
    
  phone: z.string()
    .min(1, "Số điện thoại không được để trống")
    .max(15, "Số điện thoại không được quá 15 ký tự")
    .regex(/^(\+84|0)[0-9]{9,10}$/, "Số điện thoại không đúng định dạng")
    .optional(),
    
  currentPoints: z.number()
    .int("Điểm hiện tại phải là số nguyên")
    .min(0, "Điểm hiện tại không được âm")
    .optional(),
    
  gender: z.enum(["MALE", "FEMALE", "OTHER"])
    .optional(),
    
  username: z.string()
    .refine((val) => val === "" || (val.length >= 3 && val.length <= 50), {
      message: "Tên đăng nhập phải có ít nhất 3 ký tự hoặc để trống"
    })
    .refine((val) => val === "" || /^[a-zA-Z0-9_]+$/.test(val), {
      message: "Tên đăng nhập chỉ được chứa chữ cái, số và dấu gạch dưới"
    })
    .optional(),
});

// Schema cho bulk delete
export const bulkDeleteCustomerSchema = z.object({
  ids: z.array(z.number())
    .min(1, "Vui lòng chọn ít nhất một khách hàng để xóa"),
});

// Infer types from schemas
export type CreateCustomerFormData = z.infer<typeof createCustomerSchema>;
export type UpdateCustomerFormData = z.infer<typeof updateCustomerSchema>;
export type BulkDeleteCustomerFormData = z.infer<typeof bulkDeleteCustomerSchema>;

// Transform functions để chuyển đổi dữ liệu giữa frontend và backend
export function transformCreateCustomerFormData(formData: CreateCustomerFormData) {
  return {
    last_name: formData.lastName,
    first_name: formData.firstName,
    phone: formData.phone,
    gender: formData.gender,
    username: formData.username && formData.username.trim() !== "" ? formData.username : null,
  };
}

export function transformUpdateCustomerFormData(formData: UpdateCustomerFormData) {
  const result: any = {};
  
  if (formData.membershipTypeId !== undefined) result.membership_type_id = formData.membershipTypeId;
  if (formData.lastName !== undefined) result.last_name = formData.lastName;
  if (formData.firstName !== undefined) result.first_name = formData.firstName;
  if (formData.phone !== undefined) result.phone = formData.phone;
  if (formData.currentPoints !== undefined) result.current_points = formData.currentPoints;
  if (formData.gender !== undefined) result.gender = formData.gender;
  if (formData.username !== undefined) {
    result.username = formData.username && formData.username.trim() !== "" ? formData.username : null;
  }
  
  return result;
} 