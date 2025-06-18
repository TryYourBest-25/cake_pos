"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { 
  Store as StoreIcon, 
  MapPin, 
  Phone, 
  Mail, 
  Clock, 
  Calendar,
  FileText,
  Save, 
  X, 
  Edit,
  Loader2 
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useStoreStore } from "@/stores/store";
import { UpdateStoreDto } from "@/types/api";

// Validation schema
const storeInfoSchema = z.object({
  name: z.string().min(1, "Tên cửa hàng không được để trống"),
  address: z.string().min(1, "Địa chỉ không được để trống"),
  phone: z.string().min(10, "Số điện thoại không hợp lệ"),
  email: z.string().email("Email không hợp lệ"),
  opening_time: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)(:([0-5]\d))?$/, "Định dạng thời gian không hợp lệ (HH:mm)"),
  closing_time: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)(:([0-5]\d))?$/, "Định dạng thời gian không hợp lệ (HH:mm)"),
  opening_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Định dạng ngày không hợp lệ (YYYY-MM-DD)"),
  tax_code: z.string().min(1, "Mã số thuế không được để trống"),
});

type StoreInfoFormData = z.infer<typeof storeInfoSchema>;

export default function StoreInfoPage() {
  const [isEditing, setIsEditing] = useState(false);

  const {
    defaultStore,
    isLoading,
    isUpdating,
    error,
    fetchDefaultStore,
    updateStore,
    clearError,
  } = useStoreStore();

  const form = useForm<StoreInfoFormData>({
    resolver: zodResolver(storeInfoSchema),
    defaultValues: {
      name: "",
      address: "",
      phone: "",
      email: "",
      opening_time: "",
      closing_time: "",
      opening_date: "",
      tax_code: "",
    },
  });

  useEffect(() => {
    fetchDefaultStore();
  }, [fetchDefaultStore]);

  useEffect(() => {
    if (defaultStore) {
      form.reset({
        name: defaultStore.name,
        address: defaultStore.address,
        phone: defaultStore.phone,
        email: defaultStore.email,
        opening_time: defaultStore.openingTime,
        closing_time: defaultStore.closingTime,
        opening_date: defaultStore.openingDate.toISOString().split('T')[0],
        tax_code: defaultStore.taxCode,
      });
    }
  }, [defaultStore, form]);

  useEffect(() => {
    if (error) {
      toast.error(error);
      clearError();
    }
  }, [error, clearError]);

  const handleUpdate = async (data: StoreInfoFormData) => {
    if (!defaultStore) return;

    try {
      const updateData: UpdateStoreDto = {
        name: data.name,
        address: data.address,
        phone: data.phone,
        email: data.email,
        opening_time: data.opening_time,
        closing_time: data.closing_time,
        opening_date: data.opening_date,
        tax_code: data.tax_code,
      };

      await updateStore(defaultStore.id, updateData);
      toast.success("Cập nhật thông tin cửa hàng thành công!");
      setIsEditing(false);
    } catch (error) {
      console.error("Lỗi cập nhật thông tin cửa hàng:", error);
    }
  };

  const cancelEdit = () => {
    setIsEditing(false);
    if (defaultStore) {
      form.reset({
        name: defaultStore.name,
        address: defaultStore.address,
        phone: defaultStore.phone,
        email: defaultStore.email,
        opening_time: defaultStore.openingTime,
        closing_time: defaultStore.closingTime,
        opening_date: defaultStore.openingDate.toISOString().split('T')[0],
        tax_code: defaultStore.taxCode,
      });
    }
  };

  const formatTime = (timeString: string) => {
    try {
      return new Date(`1970-01-01T${timeString}`).toLocaleTimeString('vi-VN', {
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return timeString;
    }
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat("vi-VN", {
      year: "numeric",
      month: "long",
      day: "numeric",
    }).format(date);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!defaultStore) {
    return (
      <div className="flex items-center justify-center h-96">
        <p className="text-muted-foreground">Không thể tải thông tin cửa hàng</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Thông Tin Cửa Hàng</h1>
          <p className="text-muted-foreground">
            Quản lý thông tin chi tiết của cửa hàng
          </p>
        </div>
        {!isEditing && (
          <Button onClick={() => setIsEditing(true)}>
            <Edit className="h-4 w-4 mr-2" />
            Chỉnh Sửa
          </Button>
        )}
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Store Overview */}
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <StoreIcon className="h-5 w-5" />
              Tổng Quan Cửa Hàng
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-3">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                  <StoreIcon className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-sm font-medium">Tên Cửa Hàng</p>
                  <p className="text-lg font-semibold">{defaultStore.name}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                  <Calendar className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-sm font-medium">Ngày Khai Trương</p>
                  <p className="text-lg font-semibold">{formatDate(defaultStore.openingDate)}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                  <Clock className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-sm font-medium">Giờ Hoạt Động</p>
                  <p className="text-lg font-semibold">
                    {formatTime(defaultStore.openingTime)} - {formatTime(defaultStore.closingTime)}
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Store Information Form/Display */}
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Thông Tin Chi Tiết
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isEditing ? (
              <Form {...form}>
                <form onSubmit={form.handleSubmit(handleUpdate)} className="space-y-6">
                  <div className="grid gap-4 md:grid-cols-2">
                    <FormField
                      control={form.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Tên Cửa Hàng</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="tax_code"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Mã Số Thuế</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="address"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Địa Chỉ</FormLabel>
                        <FormControl>
                          <Textarea {...field} rows={3} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid gap-4 md:grid-cols-2">
                    <FormField
                      control={form.control}
                      name="phone"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Số Điện Thoại</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Email</FormLabel>
                          <FormControl>
                            <Input type="email" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="grid gap-4 md:grid-cols-3">
                    <FormField
                      control={form.control}
                      name="opening_time"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Giờ Mở Cửa</FormLabel>
                          <FormControl>
                            <Input 
                              type="time" 
                              {...field} 
                              placeholder="HH:mm"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="closing_time"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Giờ Đóng Cửa</FormLabel>
                          <FormControl>
                            <Input 
                              type="time" 
                              {...field} 
                              placeholder="HH:mm"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="opening_date"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Ngày Khai Trương</FormLabel>
                          <FormControl>
                            <Input type="date" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="flex gap-2">
                    <Button 
                      type="submit" 
                      disabled={isUpdating}
                    >
                      {isUpdating ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Đang lưu...
                        </>
                      ) : (
                        <>
                          <Save className="h-4 w-4 mr-2" />
                          Lưu Thay Đổi
                        </>
                      )}
                    </Button>
                    <Button 
                      type="button" 
                      variant="outline"
                      onClick={cancelEdit}
                      disabled={isUpdating}
                    >
                      <X className="h-4 w-4 mr-2" />
                      Hủy
                    </Button>
                  </div>
                </form>
              </Form>
            ) : (
              <div className="space-y-6">
                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <Label className="text-sm font-medium flex items-center gap-2">
                      <StoreIcon className="h-4 w-4" />
                      Tên Cửa Hàng
                    </Label>
                    <p className="text-sm text-muted-foreground mt-1">
                      {defaultStore.name}
                    </p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium flex items-center gap-2">
                      <FileText className="h-4 w-4" />
                      Mã Số Thuế
                    </Label>
                    <p className="text-sm text-muted-foreground mt-1">
                      {defaultStore.taxCode}
                    </p>
                  </div>
                </div>

                <div>
                  <Label className="text-sm font-medium flex items-center gap-2">
                    <MapPin className="h-4 w-4" />
                    Địa Chỉ
                  </Label>
                  <p className="text-sm text-muted-foreground mt-1">
                    {defaultStore.address}
                  </p>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <Label className="text-sm font-medium flex items-center gap-2">
                      <Phone className="h-4 w-4" />
                      Số Điện Thoại
                    </Label>
                    <p className="text-sm text-muted-foreground mt-1">
                      {defaultStore.phone}
                    </p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium flex items-center gap-2">
                      <Mail className="h-4 w-4" />
                      Email
                    </Label>
                    <p className="text-sm text-muted-foreground mt-1">
                      {defaultStore.email}
                    </p>
                  </div>
                </div>

                <div className="grid gap-4 md:grid-cols-3">
                  <div>
                    <Label className="text-sm font-medium flex items-center gap-2">
                      <Clock className="h-4 w-4" />
                      Giờ Mở Cửa
                    </Label>
                    <p className="text-sm text-muted-foreground mt-1">
                      {formatTime(defaultStore.openingTime)}
                    </p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium flex items-center gap-2">
                      <Clock className="h-4 w-4" />
                      Giờ Đóng Cửa
                    </Label>
                    <p className="text-sm text-muted-foreground mt-1">
                      {formatTime(defaultStore.closingTime)}
                    </p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      Ngày Khai Trương
                    </Label>
                    <p className="text-sm text-muted-foreground mt-1">
                      {formatDate(defaultStore.openingDate)}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 