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
  createManagerSchema,
  CreateManagerFormData,
  AVAILABLE_PERMISSIONS 
} from "@/lib/validations/manager";

interface CreateManagerFormProps {
  onSubmit: (data: CreateManagerFormData) => Promise<void>;
  onCancel?: () => void;
  isLoading?: boolean;
  isSubmitting?: boolean;
  defaultValues?: Partial<CreateManagerFormData>;
  isEdit?: boolean;
}

export function CreateManagerForm({ 
  onSubmit, 
  onCancel, 
  isLoading = false,
  isSubmitting = false,
  defaultValues,
  isEdit = false
}: CreateManagerFormProps) {
  const [showPassword, setShowPassword] = useState(false);
  
  const form = useForm<CreateManagerFormData>({
    resolver: zodResolver(createManagerSchema),
    defaultValues: {
      name: defaultValues?.name || "",
      email: defaultValues?.email || "",
      password: defaultValues?.password || "",
      avatar: defaultValues?.avatar || "",
      permissions: defaultValues?.permissions || [],
      isActive: defaultValues?.isActive ?? true,
    },
  });

  const handleSubmit = async (data: CreateManagerFormData) => {
    try {
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
                  disabled={isLoading}
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
                  disabled={isLoading}
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
                Mật khẩu <span className="text-destructive">*</span>
              </FormLabel>
              <FormControl>
                <div className="relative">
                  <Input 
                    type={showPassword ? "text" : "password"}
                    placeholder="Nhập mật khẩu (tối thiểu 6 ký tự)" 
                    {...field} 
                    disabled={isLoading}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                    onClick={() => setShowPassword(!showPassword)}
                    disabled={isLoading}
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
                Mật khẩu phải có ít nhất 6 ký tự
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
                  disabled={isLoading}
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
                  disabled={isLoading || isSubmitting}
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
                  Quyền hạn <span className="text-destructive">*</span>
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
                              disabled={isLoading}
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
        <div className="flex justify-end space-x-4">
          {onCancel && (
            <Button 
              type="button" 
              variant="outline" 
              onClick={onCancel}
              disabled={isLoading || isSubmitting}
            >
              Hủy
            </Button>
          )}
          <Button type="submit" disabled={isLoading || isSubmitting}>
            {(isLoading || isSubmitting) && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {isEdit ? "Cập nhật quản lý" : "Tạo quản lý"}
          </Button>
        </div>
      </form>
    </Form>
  );
} 