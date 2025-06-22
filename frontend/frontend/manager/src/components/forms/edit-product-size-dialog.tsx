"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";

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
import { UpdateProductSizeFormData, updateProductSizeSchema } from "@/lib/validations/product-size";
import { ProductSize } from "@/types/api";

interface EditProductSizeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: UpdateProductSizeFormData) => Promise<void>;
  isSubmitting: boolean;
  productSize: ProductSize;
}

export function EditProductSizeDialog({
  open,
  onOpenChange,
  onSubmit,
  isSubmitting,
  productSize,
}: EditProductSizeDialogProps) {
  const form = useForm<UpdateProductSizeFormData>({
    resolver: zodResolver(updateProductSizeSchema),
    defaultValues: {
      name: "",
      unit: "",
      quantity: 1,
      description: "",
    },
  });

  useEffect(() => {
    if (open && productSize) {
      form.reset({
        name: productSize.name || "",
        unit: productSize.unit || "",
        quantity: productSize.quantity || 1,
        description: productSize.description || "",
      });
    }
  }, [open, productSize, form]);

  const handleSubmit = async (data: UpdateProductSizeFormData) => {
    try {
      await onSubmit(data);
      form.reset();
    } catch (error) {
      console.error("Lỗi cập nhật kích thước sản phẩm:", error);
    }
  };

  const handleCancel = () => {
    form.reset();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Chỉnh Sửa Kích Thước</DialogTitle>
          <DialogDescription>
            Cập nhật thông tin kích thước sản phẩm #{productSize?.id}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            {/* Tên kích thước */}
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tên Kích Thước *</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="Ví dụ: S, M, L, XL" 
                      {...field} 
                      disabled={isSubmitting}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Đơn vị */}
            <FormField
              control={form.control}
              name="unit"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Đơn Vị *</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="Ví dụ: piece, kg, lít" 
                      {...field} 
                      disabled={isSubmitting}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Số lượng */}
            <FormField
              control={form.control}
              name="quantity"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Số Lượng *</FormLabel>
                  <FormControl>
                    <Input 
                      type="number"
                      min="1"
                      placeholder="1" 
                      {...field}
                      onChange={(e) => field.onChange(parseInt(e.target.value) || 1)}
                      disabled={isSubmitting}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Mô tả */}
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Mô Tả</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Mô tả chi tiết về kích thước này..."
                      className="min-h-[80px]"
                      {...field}
                      disabled={isSubmitting}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Actions */}
            <div className="flex justify-end space-x-2 pt-4">
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
                    Đang cập nhật...
                  </>
                ) : (
                  "Cập Nhật"
                )}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
} 