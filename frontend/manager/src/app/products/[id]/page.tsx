"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Package, Edit, Trash2, Plus, Eye, Star, Badge as BadgeIcon, Save, X, MoreHorizontal, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import { Product, ProductPrice, Category, ProductSize } from "@/types/api";
import { productService } from "@/lib/services/product-service";
import { categoryService } from "@/lib/services/category-service";
import { productSizeService } from "@/lib/services/product-size-service";
import { 
  updateProductSchema, 
  UpdateProductFormData,
  createProductPriceSchema,
  CreateProductPriceFormData,
  updateProductPriceSchema,
  UpdateProductPriceFormData
} from "@/lib/validations/product";

function formatDate(date: Date): string {
  return new Intl.DateTimeFormat("vi-VN", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(amount);
}

export default function ProductDetailPage() {
  const params = useParams();
  const router = useRouter();
  const productId = parseInt(params.id as string);

  const [product, setProduct] = useState<Product | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [productSizes, setProductSizes] = useState<ProductSize[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingData, setIsLoadingData] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Price management states
  const [isAddPriceDialogOpen, setIsAddPriceDialogOpen] = useState(false);
  const [isEditPriceDialogOpen, setIsEditPriceDialogOpen] = useState(false);
  const [isDeletePriceDialogOpen, setIsDeletePriceDialogOpen] = useState(false);
  const [selectedPrice, setSelectedPrice] = useState<ProductPrice | null>(null);
  const [isCreatingPrice, setIsCreatingPrice] = useState(false);
  const [isUpdatingPrice, setIsUpdatingPrice] = useState(false);
  const [isDeletingPrice, setIsDeletingPrice] = useState(false);

  // Form cho chỉnh sửa product
  const form = useForm<UpdateProductFormData>({
    resolver: zodResolver(updateProductSchema),
    defaultValues: {
      name: "",
      description: "",
      is_signature: false,
      category_id: undefined,
    },
  });

  // Form cho thêm giá mới
  const addPriceForm = useForm<CreateProductPriceFormData>({
    resolver: zodResolver(createProductPriceSchema),
    defaultValues: {
      product_id: productId,
      size_id: 1,
      price: 0,
      is_active: true,
    },
  });

  // Form cho chỉnh sửa giá
  const editPriceForm = useForm<UpdateProductPriceFormData>({
    resolver: zodResolver(updateProductPriceSchema),
    defaultValues: {
      price: 0,
      is_active: true,
    },
  });

  useEffect(() => {
    loadProductDetails();
    loadCategories();
    loadProductSizes();
  }, [productId]);

  // Reset form khi product thay đổi
  useEffect(() => {
    if (product) {
      form.reset({
        name: product.name || "",
        description: product.description || "",
        is_signature: product.isSignature || false,
        category_id: product.category?.id || undefined,
      });
    }
  }, [product, form]);

  const loadProductDetails = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const productData = await productService.getById(productId);
      setProduct(productData);
    } catch (error) {
      console.error("Lỗi tải thông tin sản phẩm:", error);
      setError("Không thể tải thông tin sản phẩm");
      toast.error("Không thể tải thông tin sản phẩm");
    } finally {
      setIsLoading(false);
    }
  };

  const loadCategories = async () => {
    try {
      const response = await categoryService.getAll();
      setCategories(response.data);
    } catch (error) {
      console.error("Lỗi tải danh sách danh mục:", error);
    }
  };

  const loadProductSizes = async () => {
    try {
      setIsLoadingData(true);
      const response = await productSizeService.getAll();
      setProductSizes(response.data);
    } catch (error) {
      console.error("Lỗi tải danh sách kích thước:", error);
    } finally {
      setIsLoadingData(false);
    }
  };

  const handleEditToggle = () => {
    if (isEditing) {
      // Hủy chỉnh sửa - reset form về giá trị ban đầu
      if (product) {
        form.reset({
          name: product.name || "",
          description: product.description || "",
          is_signature: product.isSignature || false,
          category_id: product.category?.id || undefined,
        });
      }
      setIsEditing(false);
    } else {
      setIsEditing(true);
    }
  };

  const handleUpdateProduct = async (formData: UpdateProductFormData) => {
    if (!product) return;

    try {
      setIsUpdating(true);
      const updatedProduct = await productService.update(product.id, formData);
      setProduct(updatedProduct);
      setIsEditing(false);
      toast.success("Cập nhật sản phẩm thành công!");
    } catch (error) {
      console.error("Lỗi cập nhật sản phẩm:", error);
      toast.error("Không thể cập nhật sản phẩm. Vui lòng thử lại.");
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDeleteProduct = () => {
    toast.info("Tính năng xóa sản phẩm đang phát triển");
  };

  // === PRICE MANAGEMENT HANDLERS ===

  const handleAddPrice = () => {
    addPriceForm.reset({
      product_id: productId,
      size_id: productSizes.length > 0 ? productSizes[0].id : 1,
      price: 0,
      is_active: true,
    });
    setIsAddPriceDialogOpen(true);
  };

  const handleCreatePrice = async (formData: CreateProductPriceFormData) => {
    try {
      setIsCreatingPrice(true);
      await productService.createProductPrice(formData);
      await loadProductDetails(); // Reload để cập nhật danh sách giá
      setIsAddPriceDialogOpen(false);
      toast.success("Thêm giá sản phẩm thành công!");
    } catch (error) {
      console.error("Lỗi tạo giá sản phẩm:", error);
      toast.error("Không thể thêm giá sản phẩm. Vui lòng thử lại.");
    } finally {
      setIsCreatingPrice(false);
    }
  };

  const handleEditPrice = (price: ProductPrice) => {
    setSelectedPrice(price);
    editPriceForm.reset({
      price: price.price,
      is_active: price.isActive,
    });
    setIsEditPriceDialogOpen(true);
  };

  const handleUpdatePrice = async (formData: UpdateProductPriceFormData) => {
    if (!selectedPrice) return;

    try {
      setIsUpdatingPrice(true);
      await productService.updateProductPrice(selectedPrice.id, formData);
      await loadProductDetails(); // Reload để cập nhật danh sách giá
      setIsEditPriceDialogOpen(false);
      setSelectedPrice(null);
      toast.success("Cập nhật giá sản phẩm thành công!");
    } catch (error) {
      console.error("Lỗi cập nhật giá sản phẩm:", error);
      toast.error("Không thể cập nhật giá sản phẩm. Vui lòng thử lại.");
    } finally {
      setIsUpdatingPrice(false);
    }
  };

  const handleDeletePrice = (price: ProductPrice) => {
    setSelectedPrice(price);
    setIsDeletePriceDialogOpen(true);
  };

  const handleConfirmDeletePrice = async () => {
    if (!selectedPrice) return;

    try {
      setIsDeletingPrice(true);
      await productService.deleteProductPrice(selectedPrice.id);
      await loadProductDetails(); // Reload để cập nhật danh sách giá
      setIsDeletePriceDialogOpen(false);
      setSelectedPrice(null);
      toast.success("Xóa giá sản phẩm thành công!");
    } catch (error) {
      console.error("Lỗi xóa giá sản phẩm:", error);
      toast.error("Không thể xóa giá sản phẩm. Vui lòng thử lại.");
    } finally {
      setIsDeletingPrice(false);
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
                onClick={handleEditToggle}
                disabled={isUpdating}
              >
                <X className="mr-2 h-4 w-4" />
                Hủy
              </Button>
              <Button
                onClick={form.handleSubmit(handleUpdateProduct)}
                disabled={isUpdating}
              >
                {isUpdating ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
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
              <Button variant="outline" onClick={handleEditToggle}>
                <Edit className="mr-2 h-4 w-4" />
                Chỉnh Sửa
              </Button>
              <Button variant="destructive" onClick={handleDeleteProduct}>
                <Trash2 className="mr-2 h-4 w-4" />
                Xóa Sản Phẩm
              </Button>
            </>
          )}
        </div>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Hình ảnh sản phẩm */}
          <Card>
            <CardContent className="p-6">
              <Skeleton className="aspect-square w-full" />
            </CardContent>
          </Card>

          {/* Thông tin sản phẩm */}
          <Card>
            <CardHeader>
              <Skeleton className="h-8 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
            </CardHeader>
            <CardContent className="space-y-4">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-6 w-1/3" />
              <Separator />
              <Skeleton className="h-4 w-1/2" />
              <Skeleton className="h-4 w-1/3" />
            </CardContent>
          </Card>
        </div>
      ) : product ? (
        <>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Hình ảnh sản phẩm */}
            <Card>
              <CardContent className="p-6">
                <div className="aspect-square bg-muted rounded-lg flex items-center justify-center overflow-hidden">
                  {product.imagePath ? (
                    <img 
                      src={product.imagePath} 
                      alt={product.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <Package className="h-24 w-24 text-muted-foreground" />
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Thông tin sản phẩm */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Package className="h-5 w-5" />
                  Thông Tin Sản Phẩm
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Form {...form}>
                  <form className="space-y-6">
                    <div className="space-y-4">
                      {/* Tên Sản Phẩm */}
                      <div>
                        <label className="text-sm font-medium text-muted-foreground">Tên Sản Phẩm</label>
                        {isEditing ? (
                          <FormField
                            control={form.control}
                            name="name"
                            render={({ field }) => (
                              <FormItem>
                                <FormControl>
                                  <Input
                                    placeholder="Ví dụ: Bánh kem chocolate"
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
                            <p className="text-lg font-semibold">{product.name}</p>
                            {product.isSignature && (
                              <Badge variant="secondary" className="text-xs">
                                <Star className="mr-1 h-3 w-3" />
                                Đặc Trưng
                              </Badge>
                            )}
                          </div>
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
                                    placeholder="Mô tả chi tiết về sản phẩm..."
                                    className="min-h-[80px]"
                                    {...field}
                                    disabled={isUpdating}
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        ) : (
                          <p className="text-sm">
                            {product.description || <span className="text-muted-foreground italic">Không có mô tả</span>}
                          </p>
                        )}
                      </div>

                      {/* Danh Mục */}
                      <div>
                        <label className="text-sm font-medium text-muted-foreground">Danh Mục</label>
                        {isEditing ? (
                          <FormField
                            control={form.control}
                            name="category_id"
                            render={({ field }) => (
                              <FormItem>
                                <Select
                                  onValueChange={(value) => field.onChange(parseInt(value))}
                                  value={field.value?.toString()}
                                  disabled={isUpdating}
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
                        ) : (
                          <p className="text-sm">
                            {product.category?.name ? (
                              <Badge variant="outline">{product.category.name}</Badge>
                            ) : (
                              <span className="text-muted-foreground italic">Chưa phân loại</span>
                            )}
                          </p>
                        )}
                      </div>

                      {/* Sản Phẩm Đặc Trưng */}
                      {isEditing && (
                        <FormField
                          control={form.control}
                          name="is_signature"
                          render={({ field }) => (
                            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                              <div className="space-y-0.5">
                                <FormLabel className="text-base flex items-center gap-2">
                                  <Star className="h-4 w-4 text-yellow-500" />
                                  Sản phẩm đặc trưng
                                </FormLabel>
                                <div className="text-sm text-muted-foreground">
                                  Đánh dấu sản phẩm này là đặc trưng của cửa hàng
                                </div>
                              </div>
                              <FormControl>
                                <Switch
                                  checked={field.value}
                                  onCheckedChange={field.onChange}
                                  disabled={isUpdating}
                                />
                              </FormControl>
                            </FormItem>
                          )}
                        />
                      )}

                      {/* Thông tin thời gian */}
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <label className="font-medium text-muted-foreground">Ngày Tạo</label>
                          <p>{formatDate(product.createdAt)}</p>
                        </div>
                        <div>
                          <label className="font-medium text-muted-foreground">Cập Nhật</label>
                          <p>{formatDate(product.updatedAt)}</p>
                        </div>
                      </div>
                    </div>
                  </form>
                </Form>
              </CardContent>
            </Card>
          </div>

          {/* Bảng giá theo size */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Giá Theo Kích Thước</CardTitle>
                  <CardDescription>
                    Danh sách giá sản phẩm theo từng kích thước
                  </CardDescription>
                </div>
                <Button onClick={handleAddPrice}>
                  <Plus className="mr-2 h-4 w-4" />
                  Thêm Giá
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {product.productPrices && product.productPrices.length > 0 ? (
                <div className="space-y-4">
                  {product.productPrices.map((price) => (
                    <div key={price.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center space-x-4">
                        <div>
                          <p className="font-medium">
                            {price.productSize?.name} {price.productSize?.unit}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            Số lượng: {price.productSize?.quantity}
                          </p>
                        </div>
                        <Badge variant={price.isActive ? "default" : "secondary"}>
                          {price.isActive ? "Đang Bán" : "Ngừng Bán"}
                        </Badge>
                      </div>
                      
                      <div className="flex items-center space-x-4">
                        <div className="text-right">
                          <p className="font-semibold text-lg">
                            {formatCurrency(price.price)}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            ID: #{price.id}
                          </p>
                        </div>
                        
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => handleEditPrice(price)}>
                              <Edit className="mr-2 h-4 w-4" />
                              Chỉnh Sửa
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              className="text-destructive"
                              onClick={() => handleDeletePrice(price)}
                            >
                              <Trash2 className="mr-2 h-4 w-4" />
                              Xóa
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">Chưa có giá nào được thiết lập</p>
                </div>
              )}
            </CardContent>
          </Card>
        </>
      ) : null}

      {/* Add Price Dialog */}
      <Dialog open={isAddPriceDialogOpen} onOpenChange={setIsAddPriceDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Thêm Giá Sản Phẩm</DialogTitle>
            <DialogDescription>
              Thêm giá mới cho sản phẩm với kích thước cụ thể
            </DialogDescription>
          </DialogHeader>
          <Form {...addPriceForm}>
            <form onSubmit={addPriceForm.handleSubmit(handleCreatePrice)} className="space-y-4">
              {/* Size Selection */}
                             <FormField
                 control={addPriceForm.control}
                 name="size_id"
                 render={({ field }) => (
                   <FormItem>
                     <FormLabel>Kích thước *</FormLabel>
                     <Select
                       onValueChange={(value) => field.onChange(parseInt(value))}
                       value={field.value?.toString()}
                       disabled={isCreatingPrice || isLoadingData}
                     >
                       <FormControl>
                         <SelectTrigger>
                           <SelectValue placeholder="Chọn kích thước" />
                         </SelectTrigger>
                       </FormControl>
                       <SelectContent>
                         {productSizes.map((size) => (
                           <SelectItem key={size.id} value={size.id.toString()}>
                             <div className="flex items-center gap-2">
                               <Badge variant="outline">{size.name}</Badge>
                               <span>{size.quantity} {size.unit}</span>
                             </div>
                           </SelectItem>
                         ))}
                       </SelectContent>
                     </Select>
                     <FormMessage />
                   </FormItem>
                 )}
               />

              {/* Price */}
              <FormField
                control={addPriceForm.control}
                name="price"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Giá (VNĐ) *</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder="0"
                        {...field}
                        onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                        disabled={isCreatingPrice}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Active Status */}
              <FormField
                control={addPriceForm.control}
                name="is_active"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                    <div className="space-y-0.5">
                      <FormLabel className="text-sm">Kích hoạt giá này</FormLabel>
                      <div className="text-xs text-muted-foreground">
                        Giá này sẽ hiển thị cho khách hàng
                      </div>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                        disabled={isCreatingPrice}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />

              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsAddPriceDialogOpen(false)}
                  disabled={isCreatingPrice}
                >
                  Hủy
                </Button>
                <Button
                  type="submit"
                  disabled={isCreatingPrice}
                >
                  {isCreatingPrice ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Đang thêm...
                    </>
                  ) : (
                    "Thêm giá"
                  )}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Edit Price Dialog */}
      <Dialog open={isEditPriceDialogOpen} onOpenChange={setIsEditPriceDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Chỉnh Sửa Giá Sản Phẩm</DialogTitle>
            <DialogDescription>
              Cập nhật thông tin giá sản phẩm
            </DialogDescription>
          </DialogHeader>
          <Form {...editPriceForm}>
            <form onSubmit={editPriceForm.handleSubmit(handleUpdatePrice)} className="space-y-4">
              {/* Price */}
              <FormField
                control={editPriceForm.control}
                name="price"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Giá (VNĐ)</FormLabel>
                    <FormControl>
                                             <Input
                         type="number"
                         placeholder="0"
                         {...field}
                         onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                         disabled={isUpdatingPrice}
                       />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Active Status */}
              <FormField
                control={editPriceForm.control}
                name="is_active"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                    <div className="space-y-0.5">
                      <FormLabel className="text-sm">Kích hoạt giá này</FormLabel>
                      <div className="text-xs text-muted-foreground">
                        Giá này sẽ hiển thị cho khách hàng
                      </div>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                        disabled={isUpdatingPrice}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />

              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsEditPriceDialogOpen(false)}
                  disabled={isUpdatingPrice}
                >
                  Hủy
                </Button>
                <Button
                  type="submit"
                  disabled={isUpdatingPrice}
                >
                  {isUpdatingPrice ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Đang cập nhật...
                    </>
                  ) : (
                    "Cập nhật"
                  )}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Delete Price Confirmation Dialog */}
      <AlertDialog open={isDeletePriceDialogOpen} onOpenChange={setIsDeletePriceDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Xác nhận xóa giá</AlertDialogTitle>
            <AlertDialogDescription>
              Bạn có chắc chắn muốn xóa giá <strong>{formatCurrency(selectedPrice?.price || 0)}</strong> 
              cho kích thước <strong>{selectedPrice?.productSize?.name}</strong>? 
              Hành động này không thể hoàn tác.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Hủy</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleConfirmDeletePrice}
              disabled={isDeletingPrice}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeletingPrice ? (
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