"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Eye, EyeOff, Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { 
  updateManagerSchema,
  UpdateManagerFormData,
  AVAILABLE_PERMISSIONS 
} from "@/lib/validations/manager";

interface EditManagerFormProps {
  onSubmit: (data: UpdateManagerFormData) => Promise<void>;
  isSubmitting?: boolean;
  defaultValues?: Partial<UpdateManagerFormData>;
}

export function EditManagerForm({ 
  onSubmit, 
  isSubmitting = false,
  defaultValues
}: EditManagerFormProps) {
  const [showPassword, setShowPassword] = useState(false);
  
  const form = useForm<UpdateManagerFormData>({
    resolver: zodResolver(updateManagerSchema),
    defaultValues: {
      name: defaultValues?.name || "",
      email: defaultValues?.email || "",
      password: "",
      avatar: defaultValues?.avatar || "",
      permissions: defaultValues?.permissions || [],
      isActive: defaultValues?.isActive ?? true,
    },
  });

  const handleSubmit = async (data: UpdateManagerFormData) => {
    try {
      // Remove empty password field for updates
      if (!data.password) {
        delete data.password;
      }
      await onSubmit(data);
    } catch (error) {
      console.error("Lỗi submit form:", error);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        {/* Tên */}
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>
                Tên quản lý <span className="text-destructive">*</span>
              </FormLabel>
              <FormControl>
                <Input 
                  placeholder="Ví dụ: Nguyễn Văn An" 
                  {...field} 
                  disabled={isSubmitting}
                />
              </FormControl>
              <FormDescription>
                Tên đầy đủ của quản lý viên
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Email */}
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>
                Email <span className="text-destructive">*</span>
              </FormLabel>
              <FormControl>
                <Input 
                  type="email"
                  placeholder="Ví dụ: an.nguyen@company.com" 
                  {...field} 
                  disabled={isSubmitting}
                />
              </FormControl>
              <FormDescription>
                Email đăng nhập vào hệ thống
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Mật khẩu */}
        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel>
                Mật khẩu mới
              </FormLabel>
              <FormControl>
                <div className="relative">
                  <Input 
                    type={showPassword ? "text" : "password"}
                    placeholder="Để trống nếu không muốn thay đổi" 
                    {...field} 
                    disabled={isSubmitting}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                    onClick={() => setShowPassword(!showPassword)}
                    disabled={isSubmitting}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </FormControl>
              <FormDescription>
                Để trống nếu không muốn thay đổi mật khẩu
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Avatar URL */}
        <FormField
          control={form.control}
          name="avatar"
          render={({ field }) => (
            <FormItem>
              <FormLabel>URL Avatar</FormLabel>
              <FormControl>
                <Input 
                  type="url"
                  placeholder="Ví dụ: https://example.com/avatar.jpg" 
                  {...field} 
                  disabled={isSubmitting}
                />
              </FormControl>
              <FormDescription>
                Đường dẫn đến ảnh đại diện (tùy chọn)
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Trạng thái hoạt động */}
        <FormField
          control={form.control}
          name="isActive"
          render={({ field }) => (
            <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
              <FormControl>
                <Checkbox
                  checked={field.value}
                  onCheckedChange={field.onChange}
                  disabled={isSubmitting}
                />
              </FormControl>
              <div className="space-y-1 leading-none">
                <FormLabel>
                  Kích hoạt tài khoản
                </FormLabel>
                <FormDescription>
                  Cho phép quản lý viên này đăng nhập và sử dụng hệ thống
                </FormDescription>
              </div>
            </FormItem>
          )}
        />

        {/* Quyền hạn */}
        <FormField
          control={form.control}
          name="permissions"
          render={() => (
            <FormItem>
              <div className="mb-4">
                <FormLabel className="text-base">
                  Quyền hạn
                </FormLabel>
                <FormDescription>
                  Chọn các quyền hạn cho quản lý viên này
                </FormDescription>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {AVAILABLE_PERMISSIONS.map((permission) => (
                  <FormField
                    key={permission.value}
                    control={form.control}
                    name="permissions"
                    render={({ field }) => {
                      return (
                        <FormItem
                          key={permission.value}
                          className="flex flex-row items-start space-x-3 space-y-0"
                        >
                          <FormControl>
                            <Checkbox
                              checked={field.value?.includes(permission.value)}
                              onCheckedChange={(checked) => {
                                const currentValue = field.value || [];
                                return checked
                                  ? field.onChange([...currentValue, permission.value])
                                  : field.onChange(
                                      currentValue?.filter(
                                        (value) => value !== permission.value
                                      )
                                    );
                              }}
                              disabled={isSubmitting}
                            />
                          </FormControl>
                          <FormLabel className="font-normal">
                            {permission.label}
                          </FormLabel>
                        </FormItem>
                      );
                    }}
                  />
                ))}
              </div>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Buttons */}
        <div className="flex justify-end">
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Cập nhật quản lý
          </Button>
        </div>
      </form>
    </Form>
  );
} 