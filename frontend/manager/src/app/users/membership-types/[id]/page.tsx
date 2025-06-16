"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { 
  ArrowLeft, 
  Edit, 
  Save, 
  X, 
  Tag, 
  Percent, 
  Star, 
  Calendar,
  FileText,
  Loader2,
  CheckCircle,
  XCircle
} from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
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
import { AuthGuard } from "@/components/auth/auth-guard";
import { useMembershipTypeStore } from "@/stores/membership-types";
import { updateMembershipTypeSchema, UpdateMembershipTypeFormData } from "@/lib/validations/membership-type";

function formatDate(date: Date): string {
  return new Intl.DateTimeFormat("vi-VN", {
    year: "numeric",
    month: "long", 
    day: "numeric",
  }).format(date);
}

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(amount);
}

export default function MembershipTypeDetailPage() {
  const router = useRouter();
  const params = useParams();
  const membershipTypeId = parseInt(params.id as string);
  
  const [isEditing, setIsEditing] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  
  const {
    currentMembershipType: membershipType,
    isLoading,
    fetchMembershipTypeById,
    updateMembershipType,
  } = useMembershipTypeStore();

  // Form cho cập nhật membership type
  const form = useForm<UpdateMembershipTypeFormData>({
    resolver: zodResolver(updateMembershipTypeSchema),
    defaultValues: {
      type: "",
      discountValue: 0,
      requiredPoint: 0,
      description: "",
      validUntil: "",
      isActive: true,
    },
  });

  useEffect(() => {
    if (membershipTypeId) {
      fetchMembershipTypeById(membershipTypeId);
    }
  }, [membershipTypeId, fetchMembershipTypeById]);

  useEffect(() => {
    if (membershipType && isEditing) {
      form.reset({
        type: membershipType.type,
        discountValue: membershipType.discountValue,
        requiredPoint: membershipType.requiredPoint,
        description: membershipType.description || "",
        validUntil: membershipType.validUntil ? 
          membershipType.validUntil.toISOString().split('T')[0] : "",
        isActive: membershipType.isActive,
      });
    }
  }, [membershipType, isEditing, form]);

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    form.reset();
  };

  const handleSave = async (data: UpdateMembershipTypeFormData) => {
    if (!membershipType) return;
    
    try {
      setIsUpdating(true);
      
      const result = await updateMembershipType(membershipType.id, data);
      if (result) {
        toast.success("Cập nhật loại thành viên thành công");
        setIsEditing(false);
      }
    } catch (error) {
      toast.error("Có lỗi xảy ra khi cập nhật loại thành viên");
    } finally {
      setIsUpdating(false);
    }
  };

  if (isLoading) {
    return (
      <AuthGuard>
        <div className="flex items-center justify-center min-h-[400px]">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      </AuthGuard>
    );
  }

  if (!membershipType) {
    return (
      <AuthGuard>
        <div className="space-y-6">
          <div className="flex items-center space-x-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.back()}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Quay lại
            </Button>
          </div>
          <Card>
            <CardContent className="flex items-center justify-center min-h-[200px]">
              <p className="text-muted-foreground">Không tìm thấy loại thành viên</p>
            </CardContent>
          </Card>
        </div>
      </AuthGuard>
    );
  }

  return (
    <AuthGuard>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.back()}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Quay lại
            </Button>
            <div>
              <h1 className="text-2xl font-bold">{membershipType.type}</h1>
              <p className="text-muted-foreground">
                Chi tiết loại thành viên
              </p>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <Badge variant={membershipType.isActive ? "default" : "secondary"}>
              {membershipType.isActive ? (
                <>
                  <CheckCircle className="h-3 w-3 mr-1" />
                  Hoạt động
                </>
              ) : (
                <>
                  <XCircle className="h-3 w-3 mr-1" />
                  Không hoạt động
                </>
              )}
            </Badge>
          </div>
        </div>

        {/* Thông tin loại thành viên */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-lg font-medium">
              Thông tin loại thành viên
            </CardTitle>
            {!isEditing ? (
              <Button variant="outline" size="sm" onClick={handleEdit}>
                <Edit className="h-4 w-4 mr-2" />
                Chỉnh sửa
              </Button>
            ) : (
              <div className="flex space-x-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={handleCancelEdit}
                  disabled={isUpdating}
                >
                  <X className="h-4 w-4 mr-2" />
                  Hủy
                </Button>
                <Button 
                  size="sm" 
                  onClick={form.handleSubmit(handleSave)}
                  disabled={isUpdating}
                >
                  {isUpdating ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <Save className="h-4 w-4 mr-2" />
                  )}
                  Lưu
                </Button>
              </div>
            )}
          </CardHeader>
          <CardContent>
            {!isEditing ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="flex items-center space-x-3">
                    <Tag className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium">Tên loại thành viên</p>
                      <p className="text-sm text-muted-foreground">{membershipType.type}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-3">
                    <Percent className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium">Tỷ lệ giảm giá</p>
                      <p className="text-sm text-muted-foreground">{membershipType.discountValue}%</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-3">
                    <Star className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium">Điểm yêu cầu</p>
                      <p className="text-sm text-muted-foreground">{membershipType.requiredPoint.toLocaleString()} điểm</p>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-4">
                  {membershipType.validUntil && (
                    <div className="flex items-center space-x-3">
                      <Calendar className="h-5 w-5 text-muted-foreground" />
                      <div>
                        <p className="text-sm font-medium">Có hiệu lực đến</p>
                        <p className="text-sm text-muted-foreground">
                          {formatDate(new Date(membershipType.validUntil))}
                        </p>
                      </div>
                    </div>
                  )}
                  
                  {membershipType.description && (
                    <div className="flex items-start space-x-3">
                      <FileText className="h-5 w-5 text-muted-foreground mt-0.5" />
                      <div>
                        <p className="text-sm font-medium">Mô tả</p>
                        <p className="text-sm text-muted-foreground">{membershipType.description}</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <Form {...form}>
                <form onSubmit={form.handleSubmit(handleSave)} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Type */}
                    <FormField
                      control={form.control}
                      name="type"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>
                            Tên loại thành viên <span className="text-red-500">*</span>
                          </FormLabel>
                          <FormControl>
                            <Input placeholder="VIP, Premium, Silver..." {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {/* Discount Value */}
                    <FormField
                      control={form.control}
                      name="discountValue"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>
                            Tỷ lệ giảm giá (%) <span className="text-red-500">*</span>
                          </FormLabel>
                          <FormControl>
                            <Input 
                              type="number" 
                              placeholder="5" 
                              min="0"
                              max="100"
                              step="0.1"
                              {...field}
                              onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {/* Required Point */}
                    <FormField
                      control={form.control}
                      name="requiredPoint"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>
                            Điểm yêu cầu <span className="text-red-500">*</span>
                          </FormLabel>
                          <FormControl>
                            <Input 
                              type="number" 
                              placeholder="1000" 
                              min="0"
                              {...field}
                              onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {/* Valid Until */}
                    <FormField
                      control={form.control}
                      name="validUntil"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Có hiệu lực đến</FormLabel>
                          <FormControl>
                            <Input 
                              type="date" 
                              {...field}
                              value={field.value || ""}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  {/* Description */}
                  <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Mô tả</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="Mô tả quyền lợi của loại thành viên này..."
                            className="resize-none"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Is Active */}
                  <FormField
                    control={form.control}
                    name="isActive"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                        <div className="space-y-0.5">
                          <FormLabel>Kích hoạt</FormLabel>
                          <div className="text-sm text-muted-foreground">
                            Loại thành viên này có hoạt động hay không
                          </div>
                        </div>
                        <FormControl>
                          <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                </form>
              </Form>
            )}
          </CardContent>
        </Card>

        {/* Thông tin hệ thống */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-medium">Thông tin hệ thống</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <p className="text-sm font-medium">ID</p>
                  <p className="text-sm text-muted-foreground">{membershipType.id}</p>
                </div>
                
                <div>
                  <p className="text-sm font-medium">Ngày tạo</p>
                  <p className="text-sm text-muted-foreground">
                    {formatDate(new Date(membershipType.createdAt))}
                  </p>
                </div>
              </div>
              
              <div className="space-y-4">
                <div>
                  <p className="text-sm font-medium">Cập nhật lần cuối</p>
                  <p className="text-sm text-muted-foreground">
                    {formatDate(new Date(membershipType.updatedAt))}
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </AuthGuard>
  );
} 