"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";

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

import { 
  createManagerSchema,
  CreateManagerFormData
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
      first_name: defaultValues?.first_name || "",
      last_name: defaultValues?.last_name || "",
      email: defaultValues?.email || "",
      phone: defaultValues?.phone || "",
      gender: defaultValues?.gender || undefined,
      username: defaultValues?.username || "",
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
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Họ */}
          <FormField
            control={form.control}
            name="last_name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  Họ <span className="text-destructive">*</span>
                </FormLabel>
                <FormControl>
                  <Input 
                    placeholder="Ví dụ: Nguyễn" 
                    {...field} 
                    disabled={isLoading}
                  />
                </FormControl>
                <FormDescription>
                  Họ của quản lý viên
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Tên */}
          <FormField
            control={form.control}
            name="first_name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  Tên <span className="text-destructive">*</span>
                </FormLabel>
                <FormControl>
                  <Input 
                    placeholder="Ví dụ: Văn An" 
                    {...field} 
                    disabled={isLoading}
                  />
                </FormControl>
                <FormDescription>
                  Tên của quản lý viên
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

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
                Email liên hệ của quản lý viên
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Số điện thoại */}
          <FormField
            control={form.control}
            name="phone"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  Số điện thoại <span className="text-destructive">*</span>
                </FormLabel>
                <FormControl>
                  <Input 
                    type="tel"
                    placeholder="Ví dụ: 0901234567" 
                    {...field} 
                    disabled={isLoading}
                  />
                </FormControl>
                <FormDescription>
                  Số điện thoại liên hệ
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Giới tính */}
          <FormField
            control={form.control}
            name="gender"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Giới tính</FormLabel>
                <FormControl>
                  <select 
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    {...field} 
                    disabled={isLoading}
                  >
                    <option value="">Chọn giới tính</option>
                    <option value="MALE">Nam</option>
                    <option value="FEMALE">Nữ</option>
                  </select>
                </FormControl>
                <FormDescription>
                  Giới tính của quản lý viên (tùy chọn)
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Username */}
        <FormField
          control={form.control}
          name="username"
          render={({ field }) => (
            <FormItem>
              <FormLabel>
                Tên đăng nhập <span className="text-destructive">*</span>
              </FormLabel>
              <FormControl>
                <Input 
                  placeholder="Ví dụ: manager1" 
                  {...field} 
                  disabled={isLoading}
                />
              </FormControl>
              <FormDescription>
                Tên đăng nhập vào hệ thống
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Thông báo mật khẩu mặc định */}
        <div className="rounded-lg border border-blue-200 bg-blue-50 p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-blue-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-blue-800">
                Thông tin mật khẩu
              </h3>
              <div className="mt-2 text-sm text-blue-700">
                <p>
                  Mật khẩu mặc định sẽ là <strong>&ldquo;12345678&rdquo;</strong> - quản lý có thể đổi sau khi đăng nhập lần đầu.
                </p>
              </div>
            </div>
          </div>
        </div>

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