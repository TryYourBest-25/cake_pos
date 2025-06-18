"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { Loader2, ArrowLeft, Save, X, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";
import { vi } from "date-fns/locale";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ClearableInput } from "@/components/ui/clearable-input";
import { ClearableTextarea } from "@/components/ui/clearable-textarea";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
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
import { UpdateDiscountDto } from "@/types/api";
import { useDiscountsStore } from "@/stores/discounts";

export default function DiscountDetailPage() {
  const router = useRouter();
  const params = useParams();
  const discountId = parseInt(params.id as string);

  const [isEditing, setIsEditing] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [formData, setFormData] = useState<UpdateDiscountDto>({});
  const [errors, setErrors] = useState<Record<string, string>>({});

  const {
    currentDiscount,
    isLoading,
    isUpdating,
    isDeleting,
    fetchDiscountById,
    updateDiscount,
    deleteDiscount,
  } = useDiscountsStore();

  useEffect(() => {
    if (discountId) {
      fetchDiscountById(discountId);
    }
  }, [discountId, fetchDiscountById]);

  useEffect(() => {
    if (currentDiscount) {
      setFormData({
        name: currentDiscount.name,
        description: currentDiscount.description,
        coupon_code: currentDiscount.couponCode,
        discount_value: currentDiscount.discountValue,
        min_required_order_value: currentDiscount.minRequiredOrderValue,
        max_discount_amount: currentDiscount.maxDiscountAmount,
        min_required_product: currentDiscount.minRequiredProduct,
        valid_from: currentDiscount.validFrom ? format(currentDiscount.validFrom, "yyyy-MM-dd'T'HH:mm") : undefined,
        valid_until: format(currentDiscount.validUntil, "yyyy-MM-dd'T'HH:mm"),
        max_uses: currentDiscount.maxUses,
        max_uses_per_customer: currentDiscount.maxUsesPerCustomer,
        is_active: currentDiscount.isActive,
      });
    }
  }, [currentDiscount]);

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.name?.trim()) {
      newErrors.name = "Tên chương trình là bắt buộc";
    }

    if (!formData.coupon_code?.trim()) {
      newErrors.coupon_code = "Mã giảm giá là bắt buộc";
    } else if (!/^[A-Z0-9]+$/.test(formData.coupon_code)) {
      newErrors.coupon_code = "Mã chỉ chứa chữ hoa và số";
    }

    if (!formData.discount_value || formData.discount_value <= 0 || formData.discount_value > 100) {
      newErrors.discount_value = "Giá trị giảm là bắt buộc và phải từ 1-100%";
    }

    if (!formData.min_required_order_value || formData.min_required_order_value < 0) {
      newErrors.min_required_order_value = "Đơn hàng tối thiểu là bắt buộc và phải >= 0";
    }

    if (!formData.max_discount_amount || formData.max_discount_amount <= 0) {
      newErrors.max_discount_amount = "Số tiền giảm tối đa là bắt buộc và phải > 0";
    }

    if (!formData.valid_until) {
      newErrors.valid_until = "Ngày kết thúc là bắt buộc";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validate()) {
      return;
    }

    try {
      // Chuyển undefined thành null để có thể serialize JSON
      const updateData = { ...formData };
      Object.keys(updateData).forEach(key => {
        if ((updateData as any)[key] === undefined) {
          (updateData as any)[key] = null;
        }
      });
      
      await updateDiscount(discountId, updateData);
      setIsEditing(false);
      toast.success("Cập nhật chương trình khuyến mãi thành công!");
    } catch (error) {
      console.error("Lỗi cập nhật:", error);
      toast.error("Không thể cập nhật chương trình khuyến mãi. Vui lòng thử lại.");
    }
  };

  const handleCancel = () => {
    if (currentDiscount) {
      setFormData({
        name: currentDiscount.name,
        description: currentDiscount.description,
        coupon_code: currentDiscount.couponCode,
        discount_value: currentDiscount.discountValue,
        min_required_order_value: currentDiscount.minRequiredOrderValue,
        max_discount_amount: currentDiscount.maxDiscountAmount,
        min_required_product: currentDiscount.minRequiredProduct,
        valid_from: currentDiscount.validFrom ? format(currentDiscount.validFrom, "yyyy-MM-dd'T'HH:mm") : undefined,
        valid_until: format(currentDiscount.validUntil, "yyyy-MM-dd'T'HH:mm"),
        max_uses: currentDiscount.maxUses,
        max_uses_per_customer: currentDiscount.maxUsesPerCustomer,
        is_active: currentDiscount.isActive,
      });
    }
    setIsEditing(false);
    setErrors({});
  };

  const handleDelete = async () => {
    try {
      await deleteDiscount(discountId);
      toast.success("Xóa chương trình khuyến mãi thành công!");
      router.push("/promotions");
    } catch (error) {
      console.error("Lỗi xóa:", error);
      toast.error("Không thể xóa chương trình khuyến mãi. Vui lòng thử lại.");
    }
  };

  const handleChange = (field: keyof UpdateDiscountDto, value: string | number | boolean | undefined) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: "" }));
    }
  };

  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount);
  };

  const formatDate = (date: Date): string => {
    return format(date, "dd/MM/yyyy HH:mm", { locale: vi });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!currentDiscount) {
    return (
      <div className="flex flex-col items-center justify-center h-96 space-y-4">
        <p className="text-muted-foreground">Không tìm thấy chương trình khuyến mãi</p>
        <Button onClick={() => router.push("/promotions")}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Quay lại
        </Button>
      </div>
    );
  }

  const isExpired = currentDiscount.validUntil < new Date();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button variant="ghost" size="icon" onClick={() => router.push("/promotions")}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold">{currentDiscount.name}</h1>
            <p className="text-muted-foreground">Chi tiết chương trình khuyến mãi</p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          {isEditing ? (
            <>
              <Button variant="outline" onClick={handleCancel} disabled={isUpdating}>
                <X className="mr-2 h-4 w-4" />
                Hủy
              </Button>
              <Button onClick={handleSave} disabled={isUpdating}>
                {isUpdating ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Save className="mr-2 h-4 w-4" />
                )}
                Lưu
              </Button>
            </>
          ) : (
            <>
              <Button variant="outline" onClick={() => setIsEditing(true)}>
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

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Thông tin chính */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Thông Tin Chương Trình</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Tên chương trình <span className="text-destructive">*</span></Label>
                  {isEditing ? (
                    <Input
                      id="name"
                      value={formData.name || ""}
                      onChange={(e) => handleChange("name", e.target.value)}
                      className={errors.name ? "border-destructive" : ""}
                      placeholder="Nhập tên chương trình khuyến mãi"
                    />
                  ) : (
                    <p className="text-sm">{currentDiscount.name}</p>
                  )}
                  {errors.name && <p className="text-sm text-destructive">{errors.name}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="coupon_code">Mã giảm giá <span className="text-destructive">*</span></Label>
                  {isEditing ? (
                    <Input
                      id="coupon_code"
                      value={formData.coupon_code || ""}
                      onChange={(e) => handleChange("coupon_code", e.target.value.toUpperCase())}
                      className={errors.coupon_code ? "border-destructive" : ""}
                      placeholder="Ví dụ: GIAM50K"
                    />
                  ) : (
                    <p className="text-sm font-mono">{currentDiscount.couponCode}</p>
                  )}
                  {errors.coupon_code && <p className="text-sm text-destructive">{errors.coupon_code}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="discount_value">Giá trị giảm (%) <span className="text-destructive">*</span></Label>
                  {isEditing ? (
                    <Input
                      id="discount_value"
                      type="number"
                      min="1"
                      max="100"
                      value={formData.discount_value || ""}
                      onChange={(e) => {
                        const value = e.target.value.trim();
                        handleChange("discount_value", value === "" ? 0 : parseFloat(value) || 0);
                      }}
                      className={errors.discount_value ? "border-destructive" : ""}
                      placeholder="Ví dụ: 15"
                    />
                  ) : (
                    <p className="text-sm font-medium">{currentDiscount.discountValue}%</p>
                  )}
                  {errors.discount_value && <p className="text-sm text-destructive">{errors.discount_value}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="min_required_order_value">Đơn hàng tối thiểu (VND) <span className="text-destructive">*</span></Label>
                  {isEditing ? (
                    <Input
                      id="min_required_order_value"
                      type="number"
                      min="0"
                      value={formData.min_required_order_value || ""}
                      onChange={(e) => {
                        const value = e.target.value.trim();
                        handleChange("min_required_order_value", value === "" ? 0 : parseInt(value) || 0);
                      }}
                      className={errors.min_required_order_value ? "border-destructive" : ""}
                      placeholder="Ví dụ: 100000"
                    />
                  ) : (
                    <p className="text-sm">{formatCurrency(currentDiscount.minRequiredOrderValue)}</p>
                  )}
                  {errors.min_required_order_value && <p className="text-sm text-destructive">{errors.min_required_order_value}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="max_discount_amount">Số tiền giảm tối đa (VND) <span className="text-destructive">*</span></Label>
                  {isEditing ? (
                    <Input
                      id="max_discount_amount"
                      type="number"
                      min="1"
                      value={formData.max_discount_amount || ""}
                      onChange={(e) => {
                        const value = e.target.value.trim();
                        handleChange("max_discount_amount", value === "" ? 0 : parseInt(value) || 0);
                      }}
                      className={errors.max_discount_amount ? "border-destructive" : ""}
                      placeholder="Ví dụ: 50000"
                    />
                  ) : (
                    <p className="text-sm">{formatCurrency(currentDiscount.maxDiscountAmount)}</p>
                  )}
                  {errors.max_discount_amount && <p className="text-sm text-destructive">{errors.max_discount_amount}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="min_required_product">Số lượng sản phẩm tối thiểu</Label>
                  {isEditing ? (
                    <ClearableInput
                      id="min_required_product"
                      type="number"
                      min="0"
                      value={formData.min_required_product || ""}
                      onChange={(e) => {
                        const value = e.target.value.trim();
                        handleChange("min_required_product", value === "" ? undefined : parseInt(value) || 0);
                      }}
                      onClear={() => handleChange("min_required_product", undefined)}
                      placeholder="Nhập số lượng hoặc để trống cho không giới hạn"
                    />
                  ) : (
                    <p className="text-sm">{currentDiscount.minRequiredProduct || "Không giới hạn"}</p>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Mô tả</Label>
                {isEditing ? (
                  <ClearableTextarea
                    id="description"
                    value={formData.description || ""}
                    onChange={(e) => {
                      const value = e.target.value.trim();
                      handleChange("description", value === "" ? undefined : value);
                    }}
                    onClear={() => handleChange("description", undefined)}
                    className="min-h-[100px]"
                    placeholder="Nhập mô tả cho chương trình khuyến mãi"
                  />
                ) : (
                  <p className="text-sm">{currentDiscount.description || "Không có mô tả"}</p>
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Thời Hạn & Giới Hạn</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="valid_from">Ngày bắt đầu</Label>
                  {isEditing ? (
                    <ClearableInput
                      id="valid_from"
                      type="datetime-local"
                      value={formData.valid_from || ""}
                      onChange={(e) => {
                        const value = e.target.value.trim();
                        handleChange("valid_from", value === "" ? undefined : value);
                      }}
                      onClear={() => handleChange("valid_from", undefined)}
                      placeholder="Chọn ngày bắt đầu hoặc để trống để áp dụng ngay"
                    />
                  ) : (
                    <p className="text-sm">{currentDiscount.validFrom ? formatDate(currentDiscount.validFrom) : "Áp dụng ngay"}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="valid_until">Ngày kết thúc <span className="text-destructive">*</span></Label>
                  {isEditing ? (
                    <Input
                      id="valid_until"
                      type="datetime-local"
                      value={formData.valid_until || ""}
                      onChange={(e) => handleChange("valid_until", e.target.value)}
                      className={errors.valid_until ? "border-destructive" : ""}
                      placeholder="Chọn ngày và giờ kết thúc"
                    />
                  ) : (
                    <p className={`text-sm ${isExpired ? "text-destructive" : ""}`}>
                      {formatDate(currentDiscount.validUntil)}
                    </p>
                  )}
                  {errors.valid_until && <p className="text-sm text-destructive">{errors.valid_until}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="max_uses">Số lần sử dụng tối đa</Label>
                  {isEditing ? (
                    <ClearableInput
                      id="max_uses"
                      type="number"
                      min="1"
                      value={formData.max_uses || ""}
                      onChange={(e) => {
                        const value = e.target.value.trim();
                        handleChange("max_uses", value === "" ? undefined : parseInt(value) || 0);
                      }}
                      onClear={() => handleChange("max_uses", undefined)}
                      placeholder="Nhập số lần hoặc để trống cho không giới hạn"
                    />
                  ) : (
                    <p className="text-sm">{currentDiscount.maxUses || "Không giới hạn"}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="max_uses_per_customer">Số lần sử dụng/khách hàng</Label>
                  {isEditing ? (
                    <ClearableInput
                      id="max_uses_per_customer"
                      type="number"
                      min="1"
                      value={formData.max_uses_per_customer || ""}
                      onChange={(e) => {
                        const value = e.target.value.trim();
                        handleChange("max_uses_per_customer", value === "" ? undefined : parseInt(value) || 0);
                      }}
                      onClear={() => handleChange("max_uses_per_customer", undefined)}
                      placeholder="Nhập số lần hoặc để trống cho không giới hạn"
                    />
                  ) : (
                    <p className="text-sm">{currentDiscount.maxUsesPerCustomer || "Không giới hạn"}</p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Trạng Thái</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <Label htmlFor="is_active">Kích hoạt</Label>
                {isEditing ? (
                  <Switch
                    id="is_active"
                    checked={formData.is_active || false}
                    onCheckedChange={(checked) => handleChange("is_active", checked)}
                  />
                ) : (
                  <Badge variant={currentDiscount.isActive ? "default" : "secondary"}>
                    {currentDiscount.isActive ? "Hoạt Động" : "Tạm Dừng"}
                  </Badge>
                )}
              </div>

              <Separator />

              <div className="space-y-2">
                <Label>Trạng thái hết hạn</Label>
                <Badge variant={isExpired ? "destructive" : "default"}>
                  {isExpired ? "Đã Hết Hạn" : "Còn Hiệu Lực"}
                </Badge>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Thống Kê Sử Dụng</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Lượt sử dụng hiện tại</Label>
                <div className="text-2xl font-bold">
                  {currentDiscount.currentUses || 0}
                  {currentDiscount.maxUses && (
                    <span className="text-sm font-normal text-muted-foreground">
                      /{currentDiscount.maxUses}
                    </span>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <Label>Ngày tạo</Label>
                <p className="text-sm text-muted-foreground">
                  {formatDate(currentDiscount.createdAt)}
                </p>
              </div>

              <div className="space-y-2">
                <Label>Lần cập nhật cuối</Label>
                <p className="text-sm text-muted-foreground">
                  {formatDate(currentDiscount.updatedAt)}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Xác nhận xóa</AlertDialogTitle>
            <AlertDialogDescription>
              Bạn có chắc chắn muốn xóa chương trình khuyến mãi <strong>{currentDiscount.name}</strong>? 
              Hành động này không thể hoàn tác.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Hủy</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDelete}
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