"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Package, Edit, Trash2, Plus, Eye, Save, X, MoreHorizontal, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
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
import { Form, FormControl, FormField, FormItem, FormMessage } from "@/components/ui/form";
import { CreateProductDialog } from "@/components/forms/create-product-dialog";

import { Category, Product } from "@/types/api";
import { categoryService } from "@/lib/services/category-service";
import { productService } from "@/lib/services/product-service";
import { updateCategorySchema, UpdateCategoryFormData } from "@/lib/validations/category";
import { CreateProductFormData } from "@/lib/validations/product";

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

export default function CategoryDetailPage() {
  const params = useParams();
  const router = useRouter();
  const categoryId = parseInt(params.id as string);

  const [category, setCategory] = useState<Category | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoadingCategory, setIsLoadingCategory] = useState(true);
  const [isLoadingProducts, setIsLoadingProducts] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isCreateProductDialogOpen, setIsCreateProductDialogOpen] = useState(false);
  const [isCreatingProduct, setIsCreatingProduct] = useState(false);

  // Bulk delete states
  const [selectedProductIds, setSelectedProductIds] = useState<Set<number>>(new Set());
  const [isDeleting, setIsDeleting] = useState(false);
  const [isBulkDeleteDialogOpen, setIsBulkDeleteDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  // Form cho chỉnh sửa
  const form = useForm<UpdateCategoryFormData>({
    resolver: zodResolver(updateCategorySchema),
    defaultValues: {
      name: "",
      description: "",
    },
  });

  useEffect(() => {
    loadCategoryDetails();
    loadCategoryProducts();
  }, [categoryId]);

  // Reset form khi category thay đổi
  useEffect(() => {
    if (category) {
      form.reset({
        name: category.name || "",
        description: category.description || "",
      });
    }
  }, [category, form]);

  const loadCategoryDetails = async () => {
    try {
      setIsLoadingCategory(true);
      setError(null);
      
      const categoryData = await categoryService.getById(categoryId);
      setCategory(categoryData);
    } catch (error) {
      console.error("Lỗi tải thông tin danh mục:", error);
      setError("Không thể tải thông tin danh mục");
      toast.error("Không thể tải thông tin danh mục");
    } finally {
      setIsLoadingCategory(false);
    }
  };

  const loadCategoryProducts = async () => {
    try {
      setIsLoadingProducts(true);
      
      // Gọi API để lấy sản phẩm theo danh mục
      const response = await productService.getByCategory(categoryId, { page: 1, limit: 50 });
      setProducts(response.data);
      
      // Clear selection khi reload products
      setSelectedProductIds(new Set());
    } catch (error) {
      console.error("Lỗi tải danh sách sản phẩm:", error);
      toast.error("Không thể tải danh sách sản phẩm");
    } finally {
      setIsLoadingProducts(false);
    }
  };

  const handleEditCategory = () => {
    setIsEditing(true);
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    if (category) {
      form.reset({
        name: category.name || "",
        description: category.description || "",
      });
    }
  };

  const handleSaveCategory = async (data: UpdateCategoryFormData) => {
    if (!category) return;

    try {
      setIsUpdating(true);

      // Chỉ gửi những field đã thay đổi
      const changedData: UpdateCategoryFormData = {};
      
      if (data.name !== category.name) {
        changedData.name = data.name;
      }
      
      if (data.description !== category.description) {
        changedData.description = data.description;
      }

      // Nếu không có gì thay đổi
      if (Object.keys(changedData).length === 0) {
        setIsEditing(false);
        toast.info("Không có thay đổi nào để lưu");
        return;
      }

      const updatedCategory = await categoryService.update(category.id, changedData);
      setCategory(updatedCategory);
      setIsEditing(false);
      toast.success("Cập nhật danh mục thành công!");
    } catch (error) {
      console.error("Lỗi cập nhật danh mục:", error);
      toast.error("Không thể cập nhật danh mục. Vui lòng thử lại.");
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDeleteCategory = () => {
    toast.info("Tính năng xóa danh mục đang phát triển");
  };

  const handleAddProduct = () => {
    setIsCreateProductDialogOpen(true);
  };

  const handleCreateProduct = async (data: {
    name: string;
    description?: string;
    is_signature: boolean;
    image_path?: string;
    category_id: number;
  }) => {
    try {
      setIsCreatingProduct(true);
      
      // Transform data để tương thích với CreateProductFormData
      const productData: CreateProductFormData = {
        ...data,
        prices: [] // Backend sẽ tạo sản phẩm mà không có prices, sau đó thêm prices riêng
      };
      
      await productService.create(productData);
      setIsCreateProductDialogOpen(false);
      toast.success("Tạo sản phẩm thành công!");
      
      // Reload danh sách sản phẩm
      loadCategoryProducts();
    } catch (error) {
      console.error("Lỗi tạo sản phẩm:", error);
      toast.error("Không thể tạo sản phẩm. Vui lòng thử lại.");
    } finally {
      setIsCreatingProduct(false);
    }
  };

  const handleViewProduct = (productId: number) => {
    router.push(`/products/${productId}`);
  };

  // Bulk selection handlers
  const handleSelectProduct = (productId: number, selected: boolean) => {
    const newSelected = new Set(selectedProductIds);
    if (selected) {
      newSelected.add(productId);
    } else {
      newSelected.delete(productId);
    }
    setSelectedProductIds(newSelected);
  };

  const handleSelectAll = (selected: boolean) => {
    if (selected) {
      setSelectedProductIds(new Set(products.map(p => p.id)));
    } else {
      setSelectedProductIds(new Set());
    }
  };

  const clearSelection = () => {
    setSelectedProductIds(new Set());
  };

  // Delete handlers
  const openDeleteDialog = (product: Product) => {
    setSelectedProduct(product);
    setIsDeleteDialogOpen(true);
  };

  const openBulkDeleteDialog = () => {
    setIsBulkDeleteDialogOpen(true);
  };

  const handleDeleteProduct = async () => {
    if (!selectedProduct) return;
    
    try {
      setIsDeleting(true);
      await productService.delete(selectedProduct.id);
      setIsDeleteDialogOpen(false);
      setSelectedProduct(null);
      toast.success("Xóa sản phẩm thành công!");
      
      // Reload products
      loadCategoryProducts();
    } catch (error) {
      console.error("Lỗi xóa sản phẩm:", error);
      toast.error("Không thể xóa sản phẩm. Vui lòng thử lại.");
    } finally {
      setIsDeleting(false);
    }
  };

  const handleBulkDelete = async () => {
    if (selectedProductIds.size === 0) return;
    
    try {
      setIsDeleting(true);
      const result = await productService.bulkDelete({ ids: Array.from(selectedProductIds) });
      setIsBulkDeleteDialogOpen(false);
      
      if (result.summary.failed > 0) {
        toast.warning(`Xóa thành công ${result.summary.success} sản phẩm. ${result.summary.failed} sản phẩm không thể xóa.`);
      } else {
        toast.success(`Xóa thành công ${result.summary.success} sản phẩm!`);
      }
      
      // Reload products
      loadCategoryProducts();
    } catch (error) {
      console.error("Lỗi xóa nhiều sản phẩm:", error);
      toast.error("Không thể xóa các sản phẩm đã chọn. Vui lòng thử lại.");
    } finally {
      setIsDeleting(false);
    }
  };

  const selectedProductsArray = Array.from(selectedProductIds);

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
                onClick={form.handleSubmit(handleSaveCategory)}
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
              <Button variant="outline" onClick={handleEditCategory}>
                <Edit className="mr-2 h-4 w-4" />
                Chỉnh Sửa
              </Button>
              <Button variant="destructive" onClick={handleDeleteCategory}>
                <Trash2 className="mr-2 h-4 w-4" />
                Xóa Danh Mục
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Thông tin chi tiết danh mục */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            Thông Tin Danh Mục
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoadingCategory ? (
            <div className="space-y-4">
              <Skeleton className="h-8 w-1/3" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-2/3" />
              <Skeleton className="h-4 w-1/2" />
            </div>
          ) : category ? (
            <Form {...form}>
              <form className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    {/* Tên Danh Mục */}
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Tên Danh Mục</label>
                      {isEditing ? (
                        <FormField
                          control={form.control}
                          name="name"
                          render={({ field }) => (
                            <FormItem>
                              <FormControl>
                                <Input
                                  placeholder="Ví dụ: Bánh sinh nhật"
                                  {...field}
                                  disabled={isUpdating}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      ) : (
                        <p className="text-lg font-semibold">{category.name}</p>
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
                                  placeholder="Mô tả chi tiết về danh mục..."
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
                          {category.description || <span className="text-muted-foreground italic">Không có mô tả</span>}
                        </p>
                      )}
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">ID Danh Mục</label>
                      <p className="text-sm font-mono">#{category.id}</p>
                    </div>
                    
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Ngày Tạo</label>
                      <p className="text-sm">{formatDate(category.createdAt)}</p>
                    </div>
                    
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Cập Nhật Lần Cuối</label>
                      <p className="text-sm">{formatDate(category.updatedAt)}</p>
                    </div>
                  </div>
                </div>
              </form>
            </Form>
          ) : null}
        </CardContent>
      </Card>

      {/* Bulk Actions Toolbar */}
      {selectedProductsArray.length > 0 && (
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <span className="text-sm text-muted-foreground">
                Đã chọn {selectedProductsArray.length} sản phẩm
              </span>
              <Button
                variant="ghost"
                size="sm"
                onClick={clearSelection}
              >
                <X className="h-4 w-4 mr-1" />
                Bỏ chọn
              </Button>
            </div>
            <div className="flex items-center space-x-2">
              <Button
                variant="destructive"
                size="sm"
                onClick={openBulkDeleteDialog}
                disabled={isDeleting}
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Xóa đã chọn
              </Button>
            </div>
          </div>
        </Card>
      )}

      {/* Danh sách sản phẩm */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Sản Phẩm Trong Danh Mục</CardTitle>
              <CardDescription>
                {isLoadingProducts 
                  ? "Đang tải danh sách sản phẩm..." 
                  : `${products.length} sản phẩm`
                }
              </CardDescription>
            </div>
            <div className="flex items-center space-x-2">
              {products.length > 0 && (
                <div className="flex items-center space-x-2 mr-4">
                  <Checkbox
                    checked={selectedProductIds.size === products.length}
                    onCheckedChange={handleSelectAll}
                  />
                  <span className="text-sm text-muted-foreground">Chọn tất cả</span>
                </div>
              )}
              <Button onClick={handleAddProduct}>
                <Plus className="mr-2 h-4 w-4" />
                Thêm Sản Phẩm
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {isLoadingProducts ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <Card key={i}>
                  <CardContent className="p-4">
                    <Skeleton className="h-32 w-full mb-4" />
                    <Skeleton className="h-4 w-3/4 mb-2" />
                    <Skeleton className="h-3 w-1/2 mb-2" />
                    <Skeleton className="h-6 w-1/3" />
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : products.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {products.map((product) => (
                <Card key={product.id} className="hover:shadow-md transition-shadow relative">
                  {/* Checkbox selection */}
                  <div className="absolute top-2 left-2 z-10">
                    <Checkbox
                      checked={selectedProductIds.has(product.id)}
                      onCheckedChange={(checked) => handleSelectProduct(product.id, !!checked)}
                    />
                  </div>
                  
                  {/* Actions dropdown */}
                  <div className="absolute top-2 right-2 z-10">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handleViewProduct(product.id)}>
                          <Eye className="mr-2 h-4 w-4" />
                          Xem Chi Tiết
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          className="text-destructive"
                          onClick={() => openDeleteDialog(product)}
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          Xóa
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>

                  <CardContent className="p-4 pt-8">
                    {/* Hình ảnh sản phẩm */}
                    <div className="aspect-square bg-muted rounded-lg mb-4 flex items-center justify-center">
                      {product.imagePath ? (
                        <img 
                          src={product.imagePath} 
                          alt={product.name}
                          className="w-full h-full object-cover rounded-lg"
                        />
                      ) : (
                        <Package className="h-12 w-12 text-muted-foreground" />
                      )}
                    </div>
                    
                    {/* Thông tin sản phẩm */}
                    <div className="space-y-2">
                      <h3 className="font-semibold line-clamp-2">{product.name}</h3>
                      
                      <p className="text-sm text-muted-foreground line-clamp-2">
                        {product.description || "Không có mô tả"}
                      </p>
                      
                      {/* Giá sản phẩm */}
                      <div className="flex items-center justify-between">
                        <div>
                          {product.minPrice && product.maxPrice ? (
                            product.minPrice === product.maxPrice ? (
                              <span className="font-semibold text-primary">
                                {formatCurrency(product.minPrice)}
                              </span>
                            ) : (
                              <span className="font-semibold text-primary">
                                {formatCurrency(product.minPrice)} - {formatCurrency(product.maxPrice)}
                              </span>
                            )
                          ) : (
                            <span className="text-sm text-muted-foreground">Chưa có giá</span>
                          )}
                        </div>
                        
                        {product.isSignature && (
                          <Badge variant="secondary">Đặc trưng</Badge>
                        )}
                      </div>
                      
                      {/* Product ID */}
                      <div className="pt-2">
                        <span className="text-xs text-muted-foreground">
                          ID: #{product.id}
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground mb-4">Chưa có sản phẩm nào trong danh mục này</p>
              <Button onClick={handleAddProduct}>
                <Plus className="mr-2 h-4 w-4" />
                Thêm Sản Phẩm Đầu Tiên
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Create Product Dialog */}
      <CreateProductDialog
        open={isCreateProductDialogOpen}
        onOpenChange={setIsCreateProductDialogOpen}
        onSubmit={handleCreateProduct}
        isSubmitting={isCreatingProduct}
      />

      {/* Delete Single Product Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Xác nhận xóa</AlertDialogTitle>
            <AlertDialogDescription>
              Bạn có chắc chắn muốn xóa sản phẩm <strong>{selectedProduct?.name}</strong>? 
              Hành động này không thể hoàn tác và sẽ xóa tất cả giá liên quan.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Hủy</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDeleteProduct}
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

      {/* Bulk Delete Confirmation Dialog */}
      <AlertDialog open={isBulkDeleteDialogOpen} onOpenChange={setIsBulkDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Xác nhận xóa nhiều sản phẩm</AlertDialogTitle>
            <AlertDialogDescription>
              Bạn có chắc chắn muốn xóa {selectedProductsArray.length} sản phẩm đã chọn khỏi danh mục <strong>{category?.name}</strong>? 
              Hành động này không thể hoàn tác và sẽ xóa tất cả giá liên quan.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Hủy</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleBulkDelete}
              disabled={isDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Đang xóa...
                </>
              ) : (
                `Xóa ${selectedProductsArray.length} sản phẩm`
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
} 