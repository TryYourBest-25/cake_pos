import { z } from "zod";

export const loginSchema = z.object({
  username: z
    .string()
    .min(1, "Tên đăng nhập không được để trống")
    .min(3, "Tên đăng nhập phải có ít nhất 3 ký tự"),
  password: z
    .string()
    .min(1, "Mật khẩu không được để trống")
    .min(6, "Mật khẩu phải có ít nhất 6 ký tự"),
});

export type LoginFormData = z.infer<typeof loginSchema>; 