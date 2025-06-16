"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
  createEmployeeSchema,
  CreateEmployeeFormData
} from "@/lib/validations/employee";

interface CreateEmployeeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: CreateEmployeeFormData) => Promise<void>;
  isLoading?: boolean;
  isSubmitting?: boolean;
}

export function CreateEmployeeDialog({ 
  open,
  onOpenChange,
  onSubmit, 
  isLoading = false,
  isSubmitting = false,
}: CreateEmployeeDialogProps) {
  
  const form = useForm<CreateEmployeeFormData>({
    resolver: zodResolver(createEmployeeSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      position: "",
      username: "",
    },
  });

  const handleSubmit = async (data: CreateEmployeeFormData) => {
    try {
      await onSubmit(data);
      form.reset();
    } catch (error) {
      console.error("Lỗi submit form:", error);
    }
  };

  const handleCancel = () => {
    form.reset();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Thêm Nhân Viên Mới</DialogTitle>
          <DialogDescription>
            Nhập thông tin để tạo tài khoản nhân viên mới trong hệ thống
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Họ */}
              <FormField
                control={form.control}
                name="lastName"
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
                      Họ của nhân viên
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Tên */}
              <FormField
                control={form.control}
                name="firstName"
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
                      Tên của nhân viên
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
                      placeholder="Ví dụ: nhanvien@cakepos.com" 
                      {...field} 
                      disabled={isLoading}
                    />
                  </FormControl>
                  <FormDescription>
                    Email liên hệ của nhân viên
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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

              {/* Chức vụ */}
              <FormField
                control={form.control}
                name="position"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Chức vụ <span className="text-destructive">*</span>
                    </FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="Ví dụ: Nhân viên bán hàng" 
                        {...field} 
                        disabled={isLoading}
                      />
                    </FormControl>
                    <FormDescription>
                      Vị trí công việc của nhân viên
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
                      placeholder="Ví dụ: nhanvien1" 
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
                      Mật khẩu mặc định sẽ là <strong>"12345678"</strong> - nhân viên có thể đổi sau khi đăng nhập lần đầu.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Buttons */}
            <DialogFooter>
              <Button 
                type="button" 
                variant="outline" 
                onClick={handleCancel}
                disabled={isLoading || isSubmitting}
              >
                Hủy
              </Button>
              <Button type="submit" disabled={isLoading || isSubmitting}>
                {(isLoading || isSubmitting) && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Tạo nhân viên
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
} 