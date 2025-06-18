import { z } from "zod";

/**
 * Schema validation cho form đăng nhập
 */
export const loginSchema = z.object({
  username: z
    .string()
    .min(1, "Tên đăng nhập là bắt buộc")
    .min(3, "Tên đăng nhập phải có ít nhất 3 ký tự"),
  password: z
    .string()
    .min(1, "Mật khẩu là bắt buộc")
    .min(6, "Mật khẩu phải có ít nhất 6 ký tự"),
});

/**
 * Schema validation cho form đổi mật khẩu
 */
export const changePasswordSchema = z.object({
  currentPassword: z
    .string()
    .min(1, "Mật khẩu hiện tại là bắt buộc"),
  newPassword: z
    .string()
    .min(6, "Mật khẩu mới phải có ít nhất 6 ký tự"),
  confirmPassword: z
    .string()
    .min(1, "Xác nhận mật khẩu là bắt buộc"),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Mật khẩu xác nhận không khớp",
  path: ["confirmPassword"],
});

/**
 * Schema validation cho form quên mật khẩu
 */
export const forgotPasswordSchema = z.object({
  username: z
    .string()
    .min(1, "Tên đăng nhập là bắt buộc")
    .min(3, "Tên đăng nhập phải có ít nhất 3 ký tự"),
});

/**
 * Schema validation cho form reset mật khẩu
 */
export const resetPasswordSchema = z.object({
  token: z.string().min(1, "Token là bắt buộc"),
  newPassword: z
    .string()
    .min(6, "Mật khẩu mới phải có ít nhất 6 ký tự"),
  confirmPassword: z
    .string()
    .min(1, "Xác nhận mật khẩu là bắt buộc"),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Mật khẩu xác nhận không khớp",
  path: ["confirmPassword"],
});

// Export types
export type LoginFormData = z.infer<typeof loginSchema>;
export type ChangePasswordFormData = z.infer<typeof changePasswordSchema>;
export type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>;
export type ResetPasswordFormData = z.infer<typeof resetPasswordSchema>; 