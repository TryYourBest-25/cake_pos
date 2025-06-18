"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useCategoriesStore } from "@/stores/categories";

// Schema đơn giản cho dialog tạo sản phẩm (không cần prices)
const createProductDialogSchema = z.object({
  name: z
    .string()
    .min(1, "Tên sản phẩm không được để trống")
    .max(50, "Tên sản phẩm không được vượt quá 50 ký tự"),
  
  description: z
    .string()
    .max(255, "Mô tả không được vượt quá 255 ký tự")
    .optional(),
  
  is_signature: z
    .boolean(),
  
  image_path: z
    .string()
    .max(255, "Đường dẫn hình ảnh không được vượt quá 255 ký tự")
    .optional(),
  
  category_id: z
    .number()
    .int("ID danh mục phải là số nguyên")
    .min(1, "Vui lòng chọn danh mục"),
});

type CreateProductDialogFormData = z.infer<typeof createProductDialogSchema>;

interface CreateProductDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: CreateProductDialogFormData) => Promise<void>;
  isSubmitting: boolean;
}

export function CreateProductDialog({
  open,
  onOpenChange,
  onSubmit,
  isSubmitting,
}: CreateProductDialogProps) {
  const { categories, fetchCategories } = useCategoriesStore();

  const form = useForm<CreateProductDialogFormData>({
    resolver: zodResolver(createProductDialogSchema),
    defaultValues: {
      name: "",
      description: "",
      image_path: "",
      category_id: 0,
      is_signature: false,
    },
  });

  useEffect(() => {
    if (open) {
      fetchCategories();
      form.reset();
    }
  }, [open, fetchCategories, form]);

  const handleSubmit = async (data: CreateProductDialogFormData) => {
    try {
      await onSubmit(data);
      form.reset();
    } catch (error) {
      console.error("Lỗi tạo sản phẩm:", error);
    }
  };

  const handleCancel = () => {
    form.reset();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Thêm Sản Phẩm Mới</DialogTitle>
          <DialogDescription>
            Điền thông tin để tạo sản phẩm mới. Bạn sẽ cần thêm ít nhất một giá cho sản phẩm.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Tên sản phẩm */}
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tên Sản Phẩm *</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="Nhập tên sản phẩm" 
                        {...field} 
                        disabled={isSubmitting}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Danh mục */}
              <FormField
                control={form.control}
                name="category_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Danh Mục *</FormLabel>
                    <Select 
                      onValueChange={(value) => field.onChange(parseInt(value))} 
                      disabled={isSubmitting}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Chọn danh mục" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {categories.map((category) => (
                          <SelectItem key={category.id} value={category.id.toString()}>
                            {category.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Mô tả */}
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Mô Tả</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Nhập mô tả sản phẩm"
                      className="min-h-[100px]"
                      {...field}
                      disabled={isSubmitting}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Đường dẫn hình ảnh */}
            <FormField
              control={form.control}
              name="image_path"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Đường Dẫn Hình Ảnh</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="https://example.com/image.jpg" 
                      {...field} 
                      disabled={isSubmitting}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Sản phẩm đặc trưng */}
            <FormField
              control={form.control}
              name="is_signature"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <FormLabel className="text-base">
                      Sản Phẩm Đặc Trưng
                    </FormLabel>
                    <div className="text-sm text-muted-foreground">
                      Đánh dấu sản phẩm này là đặc trưng của cửa hàng
                    </div>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                      disabled={isSubmitting}
                    />
                  </FormControl>
                </FormItem>
              )}
            />

            <div className="bg-muted/50 p-4 rounded-lg">
              <p className="text-sm text-muted-foreground">
                <strong>Lưu ý:</strong> Sau khi tạo sản phẩm, bạn cần thêm giá cho các kích thước khác nhau 
                trong trang chi tiết sản phẩm.
              </p>
            </div>

            {/* Action buttons */}
            <div className="flex justify-end space-x-2">
              <Button
                type="button"
                variant="outline"
                onClick={handleCancel}
                disabled={isSubmitting}
              >
                Hủy
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Đang tạo...
                  </>
                ) : (
                  "Tạo Sản Phẩm"
                )}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
} 