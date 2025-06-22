"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { 
  User, 
  Lock, 
  Save, 
  X, 
  Edit,
  Loader2,
  UserCircle 
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useProfileStore } from "@/stores/profile";
import { UpdateProfileDto } from "@/types/api";

// Validation schemas
const accountInfoSchema = z.object({
  username: z.string().min(3, "Tên đăng nhập phải có ít nhất 3 ký tự").optional(),
  password: z.string().min(8, "Mật khẩu phải có ít nhất 8 ký tự").optional().or(z.literal("")),
});

const personalInfoSchema = z.object({
  first_name: z.string().min(1, "Tên không được để trống"),
  last_name: z.string().min(1, "Họ không được để trống"),
  gender: z.enum(["MALE", "FEMALE", "OTHER"]).optional(),
  phone: z.string().min(10, "Số điện thoại không hợp lệ"),
  email: z.string().email("Email không hợp lệ").optional(),
  position: z.string().optional(), // Chỉ cho employee
});

type AccountInfoFormData = z.infer<typeof accountInfoSchema>;
type PersonalInfoFormData = z.infer<typeof personalInfoSchema>;

export default function ProfilePage() {
  const [isEditingAccount, setIsEditingAccount] = useState(false);
  const [isEditingPersonal, setIsEditingPersonal] = useState(false);

  const {
    profile,
    isLoading,
    isUpdating,
    error,
    fetchProfile,
    updateProfile,
    clearError,
  } = useProfileStore();

  // Account info form
  const accountForm = useForm<AccountInfoFormData>({
    resolver: zodResolver(accountInfoSchema),
    defaultValues: {
      username: "",
      password: "",
    },
  });

  // Personal info form
  const personalForm = useForm<PersonalInfoFormData>({
    resolver: zodResolver(personalInfoSchema),
    defaultValues: {
      first_name: "",
      last_name: "",
      gender: undefined,
      phone: "",
      email: "",
      position: "",
    },
  });

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  useEffect(() => {
    if (profile) {
      // Set account form values
      accountForm.reset({
        username: profile.username,
        password: "",
      });

      // Set personal form values
      if (profile.profile) {
        personalForm.reset({
          first_name: profile.profile.firstName,
          last_name: profile.profile.lastName,
          gender: profile.profile.gender,
          phone: profile.profile.phone,
          email: profile.profile.email || "",
          position: profile.profile.position || "",
        });
      }
    }
  }, [profile, accountForm, personalForm]);

  useEffect(() => {
    if (error) {
      toast.error(error);
      clearError();
    }
  }, [error, clearError]);

  const handleUpdateAccount = async (data: AccountInfoFormData) => {
    try {
      const updateData: UpdateProfileDto = {};
      
      if (data.username && data.username !== profile?.username) {
        updateData.username = data.username;
      }
      
      if (data.password && data.password.trim() !== "") {
        updateData.password = data.password;
      }

      if (Object.keys(updateData).length > 0) {
        await updateProfile(updateData);
        toast.success("Cập nhật thông tin tài khoản thành công!");
      }
      
      setIsEditingAccount(false);
      accountForm.setValue("password", ""); // Clear password field
    } catch (error) {
      console.error("Lỗi cập nhật tài khoản:", error);
    }
  };

  const handleUpdatePersonal = async (data: PersonalInfoFormData) => {
    try {
      const updateData: UpdateProfileDto = {
        first_name: data.first_name,
        last_name: data.last_name,
        gender: data.gender,
        phone: data.phone,
        email: data.email || undefined,
        position: data.position || undefined,
      };

      await updateProfile(updateData);
      toast.success("Cập nhật thông tin cá nhân thành công!");
      setIsEditingPersonal(false);
    } catch (error) {
      console.error("Lỗi cập nhật thông tin cá nhân:", error);
    }
  };

  const cancelAccountEdit = () => {
    setIsEditingAccount(false);
    accountForm.reset({
      username: profile?.username,
      password: "",
    });
  };

  const cancelPersonalEdit = () => {
    setIsEditingPersonal(false);
    if (profile?.profile) {
      personalForm.reset({
        first_name: profile.profile.firstName,
        last_name: profile.profile.lastName,
        gender: profile.profile.gender,
        phone: profile.profile.phone,
        email: profile.profile.email || "",
        position: profile.profile.position || "",
      });
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="flex items-center justify-center h-96">
        <p className="text-muted-foreground">Không thể tải thông tin profile</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Thông Tin Cá Nhân</h1>
          <p className="text-muted-foreground">
            Quản lý thông tin tài khoản và thông tin cá nhân của bạn
          </p>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Profile Overview */}
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <UserCircle className="h-5 w-5" />
              Tổng Quan
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4">
              <Avatar className="h-20 w-20">
                <AvatarImage src="" alt={profile.profile?.name} />
                <AvatarFallback className="text-lg">
                  {profile.profile?.name
                    ? profile.profile.name.split(' ').map(n => n[0]).join('')
                    : 'U'}
                </AvatarFallback>
              </Avatar>
              <div className="space-y-1">
                <h3 className="text-xl font-semibold">
                  {profile.profile?.name || profile.username}
                </h3>
                <div className="flex items-center gap-2">
                  <Badge variant="outline">
                    {profile.roleName}
                  </Badge>
                  <Badge variant={profile.isActive ? "default" : "secondary"}>
                    {profile.isActive ? "Hoạt Động" : "Vô Hiệu Hóa"}
                  </Badge>
                  {profile.isLocked && (
                    <Badge variant="destructive">Bị Khóa</Badge>
                  )}
                </div>
                <p className="text-sm text-muted-foreground">
                  Đăng nhập lần cuối: {profile.lastLogin 
                    ? new Intl.DateTimeFormat("vi-VN", {
                        year: "numeric",
                        month: "2-digit",
                        day: "2-digit",
                        hour: "2-digit",
                        minute: "2-digit",
                      }).format(profile.lastLogin)
                    : "Chưa từng đăng nhập"}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Account Information */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Lock className="h-5 w-5" />
                Thông Tin Tài Khoản
              </CardTitle>
              {!isEditingAccount && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsEditingAccount(true)}
                >
                  <Edit className="h-4 w-4 mr-2" />
                  Chỉnh Sửa
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent>
            {isEditingAccount ? (
              <Form {...accountForm}>
                <form onSubmit={accountForm.handleSubmit(handleUpdateAccount)} className="space-y-4">
                  <FormField
                    control={accountForm.control}
                    name="username"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Tên Đăng Nhập</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={accountForm.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Mật Khẩu Mới (để trống nếu không đổi)</FormLabel>
                        <FormControl>
                          <Input type="password" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="flex gap-2">
                    <Button 
                      type="submit" 
                      size="sm"
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
                          Lưu
                        </>
                      )}
                    </Button>
                    <Button 
                      type="button" 
                      variant="outline" 
                      size="sm"
                      onClick={cancelAccountEdit}
                      disabled={isUpdating}
                    >
                      <X className="h-4 w-4 mr-2" />
                      Hủy
                    </Button>
                  </div>
                </form>
              </Form>
            ) : (
              <div className="space-y-4">
                <div>
                  <Label className="text-sm font-medium">Tên Đăng Nhập</Label>
                  <p className="text-sm text-muted-foreground mt-1">
                    {profile.username}
                  </p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Mật Khẩu</Label>
                  <p className="text-sm text-muted-foreground mt-1">
                    ••••••••
                  </p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Personal Information */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Thông Tin Cá Nhân
              </CardTitle>
              {!isEditingPersonal && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsEditingPersonal(true)}
                >
                  <Edit className="h-4 w-4 mr-2" />
                  Chỉnh Sửa
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent>
            {isEditingPersonal ? (
              <Form {...personalForm}>
                <form onSubmit={personalForm.handleSubmit(handleUpdatePersonal)} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={personalForm.control}
                      name="last_name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Họ</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={personalForm.control}
                      name="first_name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Tên</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={personalForm.control}
                    name="gender"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Giới Tính</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Chọn giới tính" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="MALE">Nam</SelectItem>
                            <SelectItem value="FEMALE">Nữ</SelectItem>
                            <SelectItem value="OTHER">Khác</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={personalForm.control}
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
                    control={personalForm.control}
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

                  {profile.roleName === 'STAFF' && (
                    <FormField
                      control={personalForm.control}
                      name="position"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Chức Vụ</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  )}

                  <div className="flex gap-2">
                    <Button 
                      type="submit" 
                      size="sm"
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
                          Lưu
                        </>
                      )}
                    </Button>
                    <Button 
                      type="button" 
                      variant="outline" 
                      size="sm"
                      onClick={cancelPersonalEdit}
                      disabled={isUpdating}
                    >
                      <X className="h-4 w-4 mr-2" />
                      Hủy
                    </Button>
                  </div>
                </form>
              </Form>
            ) : (
              <div className="space-y-4">
                <div>
                  <Label className="text-sm font-medium">Họ và Tên</Label>
                  <p className="text-sm text-muted-foreground mt-1">
                    {profile.profile?.name || "Chưa cập nhật"}
                  </p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Giới Tính</Label>
                  <p className="text-sm text-muted-foreground mt-1">
                    {profile.profile?.gender === 'MALE' ? 'Nam' : 
                     profile.profile?.gender === 'FEMALE' ? 'Nữ' :
                     profile.profile?.gender === 'OTHER' ? 'Khác' : 'Chưa cập nhật'}
                  </p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Số Điện Thoại</Label>
                  <p className="text-sm text-muted-foreground mt-1">
                    {profile.profile?.phone || "Chưa cập nhật"}
                  </p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Email</Label>
                  <p className="text-sm text-muted-foreground mt-1">
                    {profile.profile?.email || "Chưa cập nhật"}
                  </p>
                </div>
                {profile.roleName === 'STAFF' && (
                  <div>
                    <Label className="text-sm font-medium">Chức Vụ</Label>
                    <p className="text-sm text-muted-foreground mt-1">
                      {profile.profile?.position || "Chưa cập nhật"}
                    </p>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 