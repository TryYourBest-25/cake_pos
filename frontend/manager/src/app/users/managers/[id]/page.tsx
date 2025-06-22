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
  User, 
  Mail, 
  Phone, 
  Calendar,
  Shield,
  Eye,
  EyeOff,
  Loader2 
} from "lucide-react";
import { toast } from "sonner";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { AuthGuard } from "@/components/auth/auth-guard";
import { useManagersStore } from "@/stores/managers";
import { Manager } from "@/types/api";
import { apiClient } from "@/lib/api-client";

// Schema cho thông tin cá nhân
const managerInfoSchema = z.object({
  first_name: z.string().min(1, "Tên là bắt buộc"),
  last_name: z.string().min(1, "Họ là bắt buộc"),
  email: z.string().email("Email không hợp lệ"),
  phone: z.string().min(10, "Số điện thoại phải có ít nhất 10 số"),
  gender: z.enum(["MALE", "FEMALE"]).optional(),
});

// Schema cho thông tin tài khoản
const accountInfoSchema = z.object({
  username: z.string().min(3, "Tên đăng nhập phải có ít nhất 3 ký tự").optional().or(z.literal("")),
  password: z.string().min(6, "Mật khẩu phải có ít nhất 6 ký tự").optional().or(z.literal("")),
});

type ManagerInfoFormData = z.infer<typeof managerInfoSchema>;
type AccountInfoFormData = z.infer<typeof accountInfoSchema>;

function formatDate(date: Date): string {
  return new Intl.DateTimeFormat("vi-VN", {
    year: "numeric",
    month: "long", 
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

function formatGender(gender: string | null): string {
  if (!gender) return "Chưa xác định";
  return gender === "MALE" ? "Nam" : "Nữ";
}

export default function ManagerDetailPage() {
  const router = useRouter();
  const params = useParams();
  const managerId = parseInt(params.id as string);
  
  const [isEditingInfo, setIsEditingInfo] = useState(false);
  const [isEditingAccount, setIsEditingAccount] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isUpdatingInfo, setIsUpdatingInfo] = useState(false);
  const [isUpdatingAccount, setIsUpdatingAccount] = useState(false);
  
  const {
    selectedManager: manager,
    isLoading,
    fetchManagerById,
    setSelectedManager,
  } = useManagersStore();

  // Form cho thông tin cá nhân
  const managerInfoForm = useForm<ManagerInfoFormData>({
    resolver: zodResolver(managerInfoSchema),
    defaultValues: {
      first_name: "",
      last_name: "",
      email: "",
      phone: "",
      gender: undefined,
    },
  });

  // Form cho thông tin tài khoản
  const accountInfoForm = useForm<AccountInfoFormData>({
    resolver: zodResolver(accountInfoSchema),
    defaultValues: {
      username: "",
      password: "",
    },
  });

  useEffect(() => {
    if (managerId) {
      fetchManagerById(managerId);
    }
  }, [managerId, fetchManagerById]);

  useEffect(() => {
    if (manager) {
      // Reset form thông tin cá nhân
      if (isEditingInfo) {
        managerInfoForm.reset({
          first_name: manager.firstName,
          last_name: manager.lastName,
          email: manager.email,
          phone: manager.phone,
          gender: manager.gender || undefined,
        });
      }
      
      // Reset form thông tin tài khoản
      if (isEditingAccount) {
        accountInfoForm.reset({
          username: manager.username,
          password: "",
        });
      }
    }
  }, [manager, isEditingInfo, isEditingAccount, managerInfoForm, accountInfoForm]);

  const handleEditInfo = () => {
    setIsEditingInfo(true);
  };

  const handleCancelEditInfo = () => {
    setIsEditingInfo(false);
    managerInfoForm.reset();
  };

  const handleEditAccount = () => {
    setIsEditingAccount(true);
  };

  const handleCancelEditAccount = () => {
    setIsEditingAccount(false);
    accountInfoForm.reset();
  };

  const handleSaveInfo = async (data: ManagerInfoFormData) => {
    if (!manager) return;
    
    try {
      setIsUpdatingInfo(true);
      
      // Cập nhật thông tin manager
      const managerUpdateData = {
        first_name: data.first_name,
        last_name: data.last_name,
        email: data.email,
        phone: data.phone,
        gender: data.gender,
      };
      
      // Gọi API cập nhật manager
      const updatedManagerResponse = await apiClient.patch<any>(
        `/managers/${manager.id}`, 
        managerUpdateData
      );
      
      // Transform response để cập nhật store
      const updatedManager: Manager = {
        ...manager,
        id: updatedManagerResponse.manager_id,
        firstName: updatedManagerResponse.first_name,
        lastName: updatedManagerResponse.last_name,
        name: `${updatedManagerResponse.last_name} ${updatedManagerResponse.first_name}`,
        email: updatedManagerResponse.email,
        phone: updatedManagerResponse.phone,
        gender: updatedManagerResponse.gender,
        updatedAt: new Date(updatedManagerResponse.updated_at),
      };
      
      // Cập nhật store
      setSelectedManager(updatedManager);
      
      setIsEditingInfo(false);
      toast.success("Cập nhật thông tin cá nhân thành công!");
    } catch (error: any) {
      console.error("Lỗi cập nhật thông tin cá nhân:", error);
      toast.error(error.message || "Không thể cập nhật thông tin cá nhân. Vui lòng thử lại.");
    } finally {
      setIsUpdatingInfo(false);
    }
  };

  const handleSaveAccount = async (data: AccountInfoFormData) => {
    if (!manager) return;
    
    try {
      setIsUpdatingAccount(true);
      
      // Chỉ gửi dữ liệu nếu có thay đổi
      const accountUpdateData: any = {};
      if (data.username && data.username.trim() !== "") {
        accountUpdateData.username = data.username;
      }
      if (data.password && data.password.trim() !== "") {
        accountUpdateData.password = data.password;
      }
      
      // Kiểm tra có dữ liệu để cập nhật không
      if (Object.keys(accountUpdateData).length === 0) {
        toast.error("Vui lòng nhập thông tin cần thay đổi");
        return;
      }
      
      // Gọi API cập nhật account
      await apiClient.patch(`/accounts/${manager.accountId}`, accountUpdateData);
      
      // Cập nhật username trong store nếu có thay đổi
      if (accountUpdateData.username) {
        const updatedManager: Manager = {
          ...manager,
          username: accountUpdateData.username,
          updatedAt: new Date(),
        };
        setSelectedManager(updatedManager);
      }
      
      setIsEditingAccount(false);
      toast.success("Cập nhật thông tin tài khoản thành công!");
    } catch (error: any) {
      console.error("Lỗi cập nhật thông tin tài khoản:", error);
      toast.error(error.message || "Không thể cập nhật thông tin tài khoản. Vui lòng thử lại.");
    } finally {
      setIsUpdatingAccount(false);
    }
  };

  if (isLoading) {
    return (
      <AuthGuard>
        <div className="flex items-center justify-center h-96">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      </AuthGuard>
    );
  }

  if (!manager) {
    return (
      <AuthGuard>
        <div className="flex flex-col items-center justify-center h-96 space-y-4">
          <h2 className="text-2xl font-semibold">Không tìm thấy quản lý</h2>
          <p className="text-muted-foreground">Quản lý với ID {managerId} không tồn tại.</p>
          <Button onClick={() => router.push("/users/managers")}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Quay lại danh sách
          </Button>
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
              variant="outline" 
              size="icon"
              onClick={() => router.push("/users/managers")}
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div>
              <h1 className="text-3xl font-bold">Chi tiết quản lý</h1>
              <p className="text-muted-foreground">
                Thông tin chi tiết và cài đặt của quản lý viên
              </p>
            </div>
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          {/* Profile Card */}
          <Card>
            <CardHeader className="text-center">
              <Avatar className="w-24 h-24 mx-auto">
                <AvatarFallback className="text-lg">
                  {manager.name ? manager.name.split(' ').map(n => n[0]).join('') : 'N/A'}
                </AvatarFallback>
              </Avatar>
              <CardTitle className="mt-4">{manager.name}</CardTitle>
              <div className="flex justify-center">
                <Badge variant={manager.isActive ? "default" : "secondary"}>
                  {manager.isActive ? "Hoạt động" : "Vô hiệu hóa"}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center space-x-2">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">{manager.email}</span>
              </div>
              <div className="flex items-center space-x-2">
                <Phone className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">{manager.phone}</span>
              </div>
              <div className="flex items-center space-x-2">
                <User className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">{formatGender(manager.gender)}</span>
              </div>
              <div className="flex items-center space-x-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">Tham gia {formatDate(manager.createdAt)}</span>
              </div>
              {manager.lastLogin && (
                <div className="flex items-center space-x-2">
                  <Shield className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">Đăng nhập lần cuối {formatDate(manager.lastLogin)}</span>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Information & Edit Forms */}
          <div className="md:col-span-2 space-y-6">
            {/* Thông tin cá nhân */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Thông tin cá nhân</CardTitle>
                {!isEditingInfo ? (
                  <Button variant="outline" size="sm" onClick={handleEditInfo}>
                    <Edit className="mr-2 h-4 w-4" />
                    Chỉnh sửa
                  </Button>
                ) : (
                  <div className="flex space-x-2">
                    <Button variant="outline" size="sm" onClick={handleCancelEditInfo} disabled={isUpdatingInfo}>
                      <X className="mr-2 h-4 w-4" />
                      Hủy
                    </Button>
                    <Button 
                      size="sm"
                      onClick={managerInfoForm.handleSubmit(handleSaveInfo)} 
                      disabled={isUpdatingInfo}
                    >
                      {isUpdatingInfo ? (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      ) : (
                        <Save className="mr-2 h-4 w-4" />
                      )}
                      Lưu
                    </Button>
                  </div>
                )}
              </CardHeader>
              <CardContent>
                {isEditingInfo ? (
                  <Form {...managerInfoForm}>
                    <form onSubmit={managerInfoForm.handleSubmit(handleSaveInfo)} className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Họ */}
                        <FormField
                          control={managerInfoForm.control}
                          name="last_name"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Họ</FormLabel>
                              <FormControl>
                                <Input placeholder="Ví dụ: Nguyễn" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        {/* Tên */}
                        <FormField
                          control={managerInfoForm.control}
                          name="first_name"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Tên</FormLabel>
                              <FormControl>
                                <Input placeholder="Ví dụ: Văn An" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      {/* Email */}
                      <FormField
                        control={managerInfoForm.control}
                        name="email"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Email</FormLabel>
                            <FormControl>
                              <Input type="email" placeholder="email@example.com" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Số điện thoại */}
                        <FormField
                          control={managerInfoForm.control}
                          name="phone"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Số điện thoại</FormLabel>
                              <FormControl>
                                <Input placeholder="Ví dụ: 0901234567" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        {/* Giới tính */}
                        <FormField
                          control={managerInfoForm.control}
                          name="gender"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Giới tính</FormLabel>
                              <Select onValueChange={field.onChange} value={field.value}>
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Chọn giới tính" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  <SelectItem value="MALE">Nam</SelectItem>
                                  <SelectItem value="FEMALE">Nữ</SelectItem>
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    </form>
                  </Form>
                ) : (
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-medium text-muted-foreground">Họ</label>
                        <p className="text-sm mt-1">{manager.lastName}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-muted-foreground">Tên</label>
                        <p className="text-sm mt-1">{manager.firstName}</p>
                      </div>
                    </div>
                    
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Email</label>
                      <p className="text-sm mt-1">{manager.email}</p>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-medium text-muted-foreground">Số điện thoại</label>
                        <p className="text-sm mt-1">{manager.phone}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-muted-foreground">Giới tính</label>
                        <p className="text-sm mt-1">{formatGender(manager.gender)}</p>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Thông tin tài khoản */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Thông tin tài khoản</CardTitle>
                {!isEditingAccount ? (
                  <Button variant="outline" size="sm" onClick={handleEditAccount}>
                    <Edit className="mr-2 h-4 w-4" />
                    Chỉnh sửa
                  </Button>
                ) : (
                  <div className="flex space-x-2">
                    <Button variant="outline" size="sm" onClick={handleCancelEditAccount} disabled={isUpdatingAccount}>
                      <X className="mr-2 h-4 w-4" />
                      Hủy
                    </Button>
                    <Button 
                      size="sm"
                      onClick={accountInfoForm.handleSubmit(handleSaveAccount)} 
                      disabled={isUpdatingAccount}
                    >
                      {isUpdatingAccount ? (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      ) : (
                        <Save className="mr-2 h-4 w-4" />
                      )}
                      Lưu
                    </Button>
                  </div>
                )}
              </CardHeader>
              <CardContent>
                {isEditingAccount ? (
                  <Form {...accountInfoForm}>
                    <form onSubmit={accountInfoForm.handleSubmit(handleSaveAccount)} className="space-y-4">
                      {/* Tên đăng nhập */}
                      <FormField
                        control={accountInfoForm.control}
                        name="username"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Tên đăng nhập</FormLabel>
                            <FormControl>
                              <Input placeholder="Ví dụ: manager01" {...field} />
                            </FormControl>
                            <FormDescription>
                              Để trống nếu không muốn thay đổi
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      {/* Mật khẩu */}
                      <FormField
                        control={accountInfoForm.control}
                        name="password"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Mật khẩu mới</FormLabel>
                            <FormControl>
                              <div className="relative">
                                <Input
                                  type={showPassword ? "text" : "password"}
                                  placeholder="Nhập mật khẩu mới"
                                  {...field}
                                />
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="sm"
                                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                                  onClick={() => setShowPassword(!showPassword)}
                                >
                                  {showPassword ? (
                                    <EyeOff className="h-4 w-4" />
                                  ) : (
                                    <Eye className="h-4 w-4" />
                                  )}
                                </Button>
                              </div>
                            </FormControl>
                            <FormDescription>
                              Để trống nếu không muốn thay đổi mật khẩu
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </form>
                  </Form>
                ) : (
                  <div className="space-y-4">
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Tên đăng nhập</label>
                      <p className="text-sm mt-1">{manager.username}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Trạng thái</label>
                      <div className="mt-1">
                        <Badge variant={manager.isActive ? "default" : "secondary"}>
                          {manager.isActive ? "Hoạt động" : "Vô hiệu hóa"}
                        </Badge>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Quyền hạn */}
            <Card>
              <CardHeader>
                <CardTitle>Quyền hạn</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {manager.permissions?.map((permission, index) => (
                    <Badge key={index} variant="outline">
                      {permission}
                    </Badge>
                  )) || (
                    <div className="flex flex-wrap gap-2">
                      <Badge variant="outline">MANAGE USERS</Badge>
                      <Badge variant="outline">MANAGE ORDERS</Badge>
                      <Badge variant="outline">MANAGE PRODUCTS</Badge>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </AuthGuard>
  );
} 