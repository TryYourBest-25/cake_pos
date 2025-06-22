"use client";

import { useEffect, useState, use } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Edit, Trash2, Save, X, Package, Loader2 } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";


import { UpdateProductSizeFormData, updateProductSizeSchema } from "@/lib/validations/product-size";
import { useProductSizeStore } from "@/stores/product-sizes";

function formatDate(date: Date): string {
  return new Intl.DateTimeFormat("vi-VN", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

export default function ProductSizeDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const resolvedParams = use(params);
  const productSizeId = parseInt(resolvedParams.id);

  const {
    currentProductSize: productSize,
    isLoading,
    isUpdating,
    isDeleting,
    getProductSizeById,
    updateProductSize,
    deleteProductSize,
  } = useProductSizeStore();

  const [isEditing, setIsEditing] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);

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
    if (productSizeId) {
      loadProductSizeDetails();
    }
  }, [productSizeId]);

  useEffect(() => {
    if (productSize && isEditing) {
      form.reset({
        name: productSize.name || "",
        unit: productSize.unit || "",
        quantity: productSize.quantity || 1,
        description: productSize.description || "",
      });
    }
  }, [productSize, isEditing, form]);

  const loadProductSizeDetails = async () => {
    try {
      setError(null);
      await getProductSizeById(productSizeId);
    } catch (error) {
      console.error("Lỗi tải chi tiết kích thước sản phẩm:", error);
      setError("Không thể tải thông tin kích thước sản phẩm");
    }
  };

  const handleEditProductSize = () => {
    setIsEditing(true);
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    if (productSize) {
      form.reset({
        name: productSize.name || "",
        unit: productSize.unit || "",
        quantity: productSize.quantity || 1,
        description: productSize.description || "",
      });
    }
  };

  const handleSaveProductSize = async (data: UpdateProductSizeFormData) => {
    try {
      await updateProductSize(productSizeId, data);
      setIsEditing(false);
      toast.success("Cập nhật kích thước sản phẩm thành công!");
    } catch (error) {
      console.error("Lỗi cập nhật kích thước sản phẩm:", error);
      toast.error("Không thể cập nhật kích thước sản phẩm. Vui lòng thử lại.");
    }
  };

  const handleDeleteProductSize = async () => {
    try {
      await deleteProductSize(productSizeId);
      setIsDeleteDialogOpen(false);
      toast.success("Xóa kích thước sản phẩm thành công!");
      router.push("/products/product-sizes");
    } catch (error) {
      console.error("Lỗi xóa kích thước sản phẩm:", error);
      toast.error("Không thể xóa kích thước sản phẩm. Vui lòng thử lại.");
    }
  };

  if (error) {
    return (
      <div className="space-y-6">
        <Card>
          <CardContent className="py-8">
            <div className="text-center">
              <p className="text-destructive mb-4">{error}</p>
              <Button onClick={() => router.back()}>
                <ArrowLeft className="mr-2 h-4 w-4" />
                Quay Lại
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header với nút actions */}
      <div className="flex items-center justify-between">
        <Button variant="outline" onClick={() => router.back()}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Quay Lại
        </Button>
        
        <div className="flex items-center space-x-2">
          {isEditing ? (
            <>
              <Button 
                variant="outline" 
                onClick={handleCancelEdit}
                disabled={isUpdating}
              >
                <X className="mr-2 h-4 w-4" />
                Hủy
              </Button>
              <Button 
                onClick={form.handleSubmit(handleSaveProductSize)}
                disabled={isUpdating}
              >
                {isUpdating ? (
                  <>
                    <Save className="mr-2 h-4 w-4 animate-spin" />
                    Đang lưu...
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    Lưu
                  </>
                )}
              </Button>
            </>
          ) : (
            <>
              <Button variant="outline" onClick={handleEditProductSize}>
                <Edit className="mr-2 h-4 w-4" />
                Chỉnh Sửa
              </Button>
              <Button 
                variant="destructive" 
                onClick={() => setIsDeleteDialogOpen(true)}
                disabled={isDeleting}
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Xóa
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Thông tin chi tiết kích thước sản phẩm */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            Thông Tin Kích Thước Sản Phẩm
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-4">
              <Skeleton className="h-8 w-1/3" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-2/3" />
              <Skeleton className="h-4 w-1/2" />
            </div>
          ) : productSize ? (
            <Form {...form}>
              <form className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    {/* Tên Kích Thước */}
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Tên Kích Thước</label>
                      {isEditing ? (
                        <FormField
                          control={form.control}
                          name="name"
                          render={({ field }) => (
                            <FormItem>
                              <FormControl>
                                <Input
                                  placeholder="Ví dụ: S, M, L, XL"
                                  {...field}
                                  disabled={isUpdating}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      ) : (
                        <div className="flex items-center gap-2">
                          <p className="text-lg font-semibold">{productSize.name}</p>
                          <Badge variant="outline">{productSize.unit}</Badge>
                        </div>
                      )}
                    </div>
                    
                    {/* Đơn Vị */}
                    {isEditing && (
                      <div>
                        <label className="text-sm font-medium text-muted-foreground">Đơn Vị</label>
                        <FormField
                          control={form.control}
                          name="unit"
                          render={({ field }) => (
                            <FormItem>
                              <FormControl>
                                <Input
                                  placeholder="Ví dụ: piece, kg, lít"
                                  {...field}
                                  disabled={isUpdating}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    )}
                    
                    {/* Số Lượng */}
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Số Lượng</label>
                      {isEditing ? (
                        <FormField
                          control={form.control}
                          name="quantity"
                          render={({ field }) => (
                            <FormItem>
                              <FormControl>
                                <Input
                                  type="number"
                                  min="1"
                                  placeholder="1"
                                  {...field}
                                  onChange={(e) => field.onChange(parseInt(e.target.value) || 1)}
                                  disabled={isUpdating}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      ) : (
                        <p className="text-lg font-semibold">{productSize.quantity}</p>
                      )}
                    </div>
                    
                    {/* Mô Tả */}
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Mô Tả</label>
                      {isEditing ? (
                        <FormField
                          control={form.control}
                          name="description"
                          render={({ field }) => (
                            <FormItem>
                              <FormControl>
                                                                 <Textarea
                                   placeholder="Mô tả chi tiết về kích thước này..."
                                   className="min-h-[80px]"
                                   {...field}
                                   value={field.value || ""}
                                   disabled={isUpdating}
                                 />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      ) : (
                        <p className="text-sm">
                          {productSize.description || <span className="text-muted-foreground italic">Không có mô tả</span>}
                        </p>
                      )}
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">ID Kích Thước</label>
                      <p className="text-sm font-mono">#{productSize.id}</p>
                    </div>
                    
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Ngày Tạo</label>
                      <p className="text-sm">{formatDate(productSize.createdAt)}</p>
                    </div>
                    
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Cập Nhật Lần Cuối</label>
                      <p className="text-sm">{formatDate(productSize.updatedAt)}</p>
                    </div>
                  </div>
                </div>
              </form>
            </Form>
          ) : null}
        </CardContent>
      </Card>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Xác nhận xóa</AlertDialogTitle>
            <AlertDialogDescription>
              Bạn có chắc chắn muốn xóa kích thước <strong>{productSize?.name} ({productSize?.unit})</strong>? 
              Hành động này không thể hoàn tác và có thể ảnh hưởng đến các sản phẩm đang sử dụng kích thước này.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Hủy</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDeleteProductSize}
              disabled={isDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Đang xóa...
                </>
              ) : (
                "Xóa"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
} 