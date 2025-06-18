import { z } from "zod";

// Profile validation schema
export const updateProfileSchema = z.object({
  username: z
    .string()
    .min(3, "Tên đăng nhập phải có ít nhất 3 ký tự")
    .optional(),
  
  password: z
    .string()
    .min(8, "Mật khẩu phải có ít nhất 8 ký tự")
    .optional()
    .or(z.literal("")),
  
  last_name: z
    .string()
    .min(1, "Họ không được để trống")
    .max(70, "Họ không được vượt quá 70 ký tự"),
  
  first_name: z
    .string()
    .min(1, "Tên không được để trống")
    .max(70, "Tên không được vượt quá 70 ký tự"),
  
  gender: z
    .enum(["MALE", "FEMALE", "OTHER"], {
      errorMap: () => ({ message: "Giới tính không hợp lệ" }),
    })
    .optional(),
  
  phone: z
    .string()
    .min(10, "Số điện thoại phải có ít nhất 10 số")
    .max(15, "Số điện thoại không được vượt quá 15 ký tự")
    .regex(/^[0-9+\-\s()]{10,15}$/, "Số điện thoại không hợp lệ"),
  
  email: z
    .string()
    .email("Email không hợp lệ")
    .max(100, "Email không được vượt quá 100 ký tự")
    .optional(),
  
  position: z
    .string()
    .max(50, "Chức vụ không được vượt quá 50 ký tự")
    .optional(),
});

export type UpdateProfileFormData = z.infer<typeof updateProfileSchema>;

// Account info only schema (subset of profile)
export const updateAccountInfoSchema = z.object({
  username: z
    .string()
    .min(3, "Tên đăng nhập phải có ít nhất 3 ký tự")
    .optional(),
  
  password: z
    .string()
    .min(8, "Mật khẩu phải có ít nhất 8 ký tự")
    .optional()
    .or(z.literal("")),
});

export type UpdateAccountInfoFormData = z.infer<typeof updateAccountInfoSchema>;

// Personal info only schema (subset of profile)
export const updatePersonalInfoSchema = z.object({
  last_name: z
    .string()
    .min(1, "Họ không được để trống")
    .max(70, "Họ không được vượt quá 70 ký tự"),
  
  first_name: z
    .string()
    .min(1, "Tên không được để trống")
    .max(70, "Tên không được vượt quá 70 ký tự"),
  
  gender: z
    .enum(["MALE", "FEMALE", "OTHER"], {
      errorMap: () => ({ message: "Giới tính không hợp lệ" }),
    })
    .optional(),
  
  phone: z
    .string()
    .min(10, "Số điện thoại phải có ít nhất 10 số")
    .max(15, "Số điện thoại không được vượt quá 15 ký tự")
    .regex(/^[0-9+\-\s()]{10,15}$/, "Số điện thoại không hợp lệ"),
  
  email: z
    .string()
    .email("Email không hợp lệ")
    .max(100, "Email không được vượt quá 100 ký tự")
    .optional(),
  
  position: z
    .string()
    .max(50, "Chức vụ không được vượt quá 50 ký tự")
    .optional(),
});

export type UpdatePersonalInfoFormData = z.infer<typeof updatePersonalInfoSchema>; 