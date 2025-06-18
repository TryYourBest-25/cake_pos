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
  Loader2,
  ShoppingCart 
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


import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { AuthGuard } from "@/components/auth/auth-guard";
import { useEmployeeStore } from "@/stores/employees";
import { Employee, Order } from "@/types/api";
import { apiClient } from "@/lib/api-client";

// Schema cho thông tin cá nhân
const employeeInfoSchema = z.object({
  first_name: z.string().min(1, "Tên là bắt buộc"),
  last_name: z.string().min(1, "Họ là bắt buộc"),
  email: z.string().email("Email không hợp lệ"),
  phone: z.string().min(10, "Số điện thoại phải có ít nhất 10 số"),
  position: z.string().min(1, "Chức vụ là bắt buộc"),
});

// Schema cho thông tin tài khoản
const accountInfoSchema = z.object({
  username: z.string().min(3, "Tên đăng nhập phải có ít nhất 3 ký tự").optional().or(z.literal("")),
  password: z.string().min(6, "Mật khẩu phải có ít nhất 6 ký tự").optional().or(z.literal("")),
});

type EmployeeInfoFormData = z.infer<typeof employeeInfoSchema>;
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

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(amount);
}

export default function EmployeeDetailPage() {
  const router = useRouter();
  const params = useParams();
  const employeeId = parseInt(params.id as string);
  
  const [isEditingInfo, setIsEditingInfo] = useState(false);
  const [isEditingAccount, setIsEditingAccount] = useState(false);
  const [isUpdatingInfo, setIsUpdatingInfo] = useState(false);
  const [isUpdatingAccount, setIsUpdatingAccount] = useState(false);
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoadingOrders, setIsLoadingOrders] = useState(false);
  
  const {
    currentEmployee: employee,
    isLoading,
    fetchEmployeeById,
    updateEmployee,
  } = useEmployeeStore();

  // Form cho thông tin cá nhân
  const employeeInfoForm = useForm<EmployeeInfoFormData>({
    resolver: zodResolver(employeeInfoSchema),
    defaultValues: {
      first_name: "",
      last_name: "",
      email: "",
      phone: "",
      position: "",
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
    if (employeeId) {
      fetchEmployeeById(employeeId);
    }
  }, [employeeId, fetchEmployeeById]);

  useEffect(() => {
    if (employee) {
      // Reset form thông tin cá nhân
      if (isEditingInfo) {
        employeeInfoForm.reset({
          first_name: employee.firstName,
          last_name: employee.lastName,
          email: employee.email,
          phone: employee.phone,
          position: employee.position || "",
        });
      }
      
      // Reset form thông tin tài khoản
      if (isEditingAccount) {
        accountInfoForm.reset({
          username: employee.username,
          password: "",
        });
      }

      // Load orders của nhân viên
      loadEmployeeOrders();
    }
  }, [employee, isEditingInfo, isEditingAccount, employeeInfoForm, accountInfoForm]);

  const loadEmployeeOrders = async () => {
    if (!employee) return;
    
    setIsLoadingOrders(true);
    try {
      const response = await apiClient.get(`/orders/employee/${employee.id}`);
      console.log("Orders API response:", response); // Debug log
      
      // Xử lý response dựa trên cấu trúc thực tế từ backend
      let ordersData: any[] = [];
      
      if (Array.isArray(response)) {
        ordersData = response;
      } else if (response && Array.isArray((response as any).data)) {
        ordersData = (response as any).data;
      } else if (response && (response as any).orders && Array.isArray((response as any).orders)) {
        ordersData = (response as any).orders;
      }
      
      // Transform data nếu cần thiết
      const transformedOrders = ordersData.map((order: any) => ({
        id: order.id || order.order_id,
        customerName: order.customerName || order.customer_name || order.customer?.name,
        customerId: order.customerId || order.customer_id,
        employeeId: order.employeeId || order.employee_id,
        totalAmount: order.totalAmount || order.total_amount || 0,
        finalAmount: order.finalAmount || order.final_amount || order.totalAmount || order.total_amount || 0,
        status: order.status || 'PENDING',
        paymentMethod: order.paymentMethod || order.payment_method,
        paymentStatus: order.paymentStatus || order.payment_status,
        notes: order.notes,
        createdAt: new Date(order.createdAt || order.created_at),
        updatedAt: new Date(order.updatedAt || order.updated_at),
        items: order.items || order.orderItems || []
      }));
      
      setOrders(transformedOrders);
    } catch (error) {
      console.error("Lỗi tải đơn hàng:", error);
      toast.error("Không thể tải danh sách đơn hàng");
      setOrders([]);
    } finally {
      setIsLoadingOrders(false);
    }
  };

  const handleEditInfo = () => {
    setIsEditingInfo(true);
  };

  const handleCancelEditInfo = () => {
    setIsEditingInfo(false);
    employeeInfoForm.reset();
  };

  const handleEditAccount = () => {
    setIsEditingAccount(true);
  };

  const handleCancelEditAccount = () => {
    setIsEditingAccount(false);
    accountInfoForm.reset();
  };

  const handleSaveInfo = async (data: EmployeeInfoFormData) => {
    if (!employee) return;
    
    try {
      setIsUpdatingInfo(true);
      
      // Cập nhật thông tin nhân viên
      const updateData = {
        firstName: data.first_name,
        lastName: data.last_name,
        email: data.email,
        phone: data.phone,
        position: data.position,
      };
      
      await updateEmployee(employee.id, updateData);
      setIsEditingInfo(false);
      toast.success("Cập nhật thông tin thành công!");
    } catch (error) {
      console.error("Lỗi cập nhật thông tin:", error);
      toast.error("Lỗi khi cập nhật thông tin nhân viên");
    } finally {
      setIsUpdatingInfo(false);
    }
  };

  const handleSaveAccount = async (data: AccountInfoFormData) => {
    if (!employee) return;
    
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
      await apiClient.patch(`/accounts/${employee.accountId}`, accountUpdateData);
      
      // Cập nhật username trong store nếu có thay đổi
      if (accountUpdateData.username) {
        // Chỉ cập nhật local state, không gọi API employee nữa
        const updatedEmployee: Employee = {
          ...employee,
          username: accountUpdateData.username,
          updatedAt: new Date(),
        };
        // Cập nhật currentEmployee trong store trực tiếp
        const { setCurrentEmployee } = useEmployeeStore.getState();
        setCurrentEmployee(updatedEmployee);
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
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-2" />
            <p className="text-muted-foreground">Đang tải thông tin nhân viên...</p>
          </div>
        </div>
      </AuthGuard>
    );
  }

  if (!employee) {
    return (
      <AuthGuard>
        <div className="flex flex-col items-center justify-center h-96 space-y-4">
          <h2 className="text-2xl font-semibold">Không tìm thấy nhân viên</h2>
          <p className="text-muted-foreground">Nhân viên với ID {employeeId} không tồn tại.</p>
          <Button onClick={() => router.push("/users/employees")}>
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
              onClick={() => router.push("/users/employees")}
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div>
              <h1 className="text-3xl font-bold">Chi tiết nhân viên</h1>
              <p className="text-muted-foreground">
                Thông tin chi tiết và cài đặt của nhân viên
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
                  {employee.name ? employee.name.split(' ').map(n => n[0]).join('') : 'NV'}
                </AvatarFallback>
              </Avatar>
              <CardTitle className="mt-4">{employee.name}</CardTitle>
              <div className="flex justify-center">
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center space-x-2">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">{employee.email}</span>
              </div>
              <div className="flex items-center space-x-2">
                <Phone className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">{employee.phone}</span>
              </div>
              <div className="flex items-center space-x-2">
                <User className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">{employee.position}</span>
              </div>
              <div className="flex items-center space-x-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">Tham gia {formatDate(employee.createdAt)}</span>
              </div>
              {employee.lastLogin && (
                <div className="flex items-center space-x-2">
                  <Shield className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">Đăng nhập lần cuối {formatDate(employee.lastLogin)}</span>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Information & Orders Tabs */}
          <div className="md:col-span-2">
            <Tabs defaultValue="info" className="space-y-6">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="info">Thông tin cá nhân</TabsTrigger>
                <TabsTrigger value="orders">Đơn hàng đã bán</TabsTrigger>
              </TabsList>
              
              <TabsContent value="info" className="space-y-6">
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
                          onClick={employeeInfoForm.handleSubmit(handleSaveInfo)} 
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
                      <Form {...employeeInfoForm}>
                        <form onSubmit={employeeInfoForm.handleSubmit(handleSaveInfo)} className="space-y-4">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {/* Họ */}
                            <FormField
                              control={employeeInfoForm.control}
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
                              control={employeeInfoForm.control}
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
                            control={employeeInfoForm.control}
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
                              control={employeeInfoForm.control}
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

                            {/* Chức vụ */}
                            <FormField
                              control={employeeInfoForm.control}
                              name="position"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Chức vụ</FormLabel>
                                  <FormControl>
                                    <Input placeholder="Ví dụ: Nhân viên bán hàng" {...field} />
                                  </FormControl>
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
                            <div className="text-sm font-medium text-muted-foreground">Họ</div>
                            <div className="text-sm">{employee.lastName}</div>
                          </div>
                          <div>
                            <div className="text-sm font-medium text-muted-foreground">Tên</div>
                            <div className="text-sm">{employee.firstName}</div>
                          </div>
                        </div>
                        <div>
                          <div className="text-sm font-medium text-muted-foreground">Email</div>
                          <div className="text-sm">{employee.email}</div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <div className="text-sm font-medium text-muted-foreground">Số điện thoại</div>
                            <div className="text-sm">{employee.phone}</div>
                          </div>
                          <div>
                            <div className="text-sm font-medium text-muted-foreground">Chức vụ</div>
                            <div className="text-sm">{employee.position}</div>
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
                          {/* Username */}
                          <FormField
                            control={accountInfoForm.control}
                            name="username"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Tên đăng nhập</FormLabel>
                                <FormControl>
                                  <Input placeholder="Nhập tên đăng nhập mới" {...field} />
                                </FormControl>
                                <FormDescription>
                                  Để trống nếu không muốn thay đổi
                                </FormDescription>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          {/* Password */}
                          <FormField
                            control={accountInfoForm.control}
                            name="password"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Mật khẩu mới</FormLabel>
                                <FormControl>
                                  <Input type="password" placeholder="Nhập mật khẩu mới" {...field} />
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
                          <div className="text-sm font-medium text-muted-foreground">Tên đăng nhập</div>
                          <div className="text-sm">{employee.username}</div>
                        </div>
                        <div>
                          <div className="text-sm font-medium text-muted-foreground">Mật khẩu</div>
                          <div className="text-sm">••••••••</div>
                        </div>
                        <div>
                          <div className="text-sm font-medium text-muted-foreground">Trạng thái tài khoản</div>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="orders">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <ShoppingCart className="mr-2 h-5 w-5" />
                      Đơn hàng đã bán ({orders.length})
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {isLoadingOrders ? (
                      <div className="flex items-center justify-center py-8">
                        <Loader2 className="h-6 w-6 animate-spin mr-2" />
                        <span>Đang tải đơn hàng...</span>
                      </div>
                    ) : orders.length === 0 ? (
                      <div className="text-center py-8 text-muted-foreground">
                        Nhân viên này chưa bán đơn hàng nào
                      </div>
                    ) : (
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Mã đơn hàng</TableHead>
                            <TableHead>Khách hàng</TableHead>
                            <TableHead>Tổng tiền</TableHead>
                            <TableHead>Trạng thái</TableHead>
                            <TableHead>Ngày tạo</TableHead>
                          </TableRow>
                        </TableHeader>
                                                 <TableBody>
                           {Array.isArray(orders) && orders.map((order) => (
                            <TableRow key={order.id}>
                              <TableCell className="font-medium">#{order.id}</TableCell>
                              <TableCell>
                                {order.customerName || "Khách lẻ"}
                              </TableCell>
                              <TableCell>
                                {formatCurrency(order.totalAmount)}
                              </TableCell>
                              <TableCell>
                                <Badge variant={
                                  order.status === "COMPLETED" ? "default" :
                                  order.status === "PENDING" ? "secondary" :
                                  order.status === "CANCELLED" ? "destructive" : "outline"
                                }>
                                  {order.status === "COMPLETED" ? "Hoàn thành" :
                                   order.status === "PENDING" ? "Đang xử lý" :
                                   order.status === "CANCELLED" ? "Đã hủy" : order.status}
                                </Badge>
                              </TableCell>
                              <TableCell>
                                {formatDate(order.createdAt)}
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </AuthGuard>
  );
} 