"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, User, Phone, CreditCard, Crown, Calendar, Edit, Save, X, Lock } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { AuthGuard } from "@/components/auth/auth-guard";
import { useCustomerStore } from "@/stores/customers";
import { useMembershipTypeStore } from "@/stores/membership-types";
import { Customer } from "@/types/api";
import { toast } from "sonner";

function formatDate(date: Date): string {
  return new Intl.DateTimeFormat("vi-VN", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

function getGenderLabel(gender?: string): string {
  switch (gender) {
    case 'MALE': return 'Nam';
    case 'FEMALE': return 'Nữ';
    case 'OTHER': return 'Khác';
    default: return 'Không xác định';
  }
}

export default function CustomerDetailPage() {
  const params = useParams();
  const router = useRouter();
  const customerId = parseInt(params.id as string);

  const { customers, fetchCustomers, updateCustomer, isUpdating } = useCustomerStore();
  const { membershipTypes, fetchMembershipTypes } = useMembershipTypeStore();

  const [customer, setCustomer] = useState<Customer | null>(null);
  const [isEditingInfo, setIsEditingInfo] = useState(false);
  const [isEditingAccount, setIsEditingAccount] = useState(false);
  
  const [infoForm, setInfoForm] = useState({
    lastName: "",
    firstName: "",
    phone: "",
    gender: "",
  });
  
  const [accountForm, setAccountForm] = useState({
    username: "",
    password: "",
  });

  // Load data
  useEffect(() => {
    fetchCustomers();
    fetchMembershipTypes();
  }, [fetchCustomers, fetchMembershipTypes]);

  // Find customer
  useEffect(() => {
    const foundCustomer = customers.find(c => c.id === customerId);
    if (foundCustomer) {
      setCustomer(foundCustomer);
      setInfoForm({
        lastName: foundCustomer.lastName || "",
        firstName: foundCustomer.firstName || "",
        phone: foundCustomer.phone,
        gender: foundCustomer.gender || "",
      });
      setAccountForm({
        username: foundCustomer.username || "",
        password: "",
      });
    }
  }, [customers, customerId]);

  // Info form handlers
  const handleEditInfo = () => {
    setIsEditingInfo(true);
  };

  const handleCancelInfo = () => {
    if (customer) {
      setInfoForm({
        lastName: customer.lastName || "",
        firstName: customer.firstName || "",
        phone: customer.phone,
        gender: customer.gender || "",
      });
    }
    setIsEditingInfo(false);
  };

  const handleSaveInfo = async () => {
    if (!customer) return;

    try {
      const updateData: any = {};
      
      if (infoForm.lastName !== customer.lastName) updateData.lastName = infoForm.lastName;
      if (infoForm.firstName !== customer.firstName) updateData.firstName = infoForm.firstName;
      if (infoForm.phone !== customer.phone) updateData.phone = infoForm.phone;
      if (infoForm.gender !== customer.gender) updateData.gender = infoForm.gender;

      if (Object.keys(updateData).length > 0) {
        await updateCustomer(customer.id, updateData);
        toast.success("Cập nhật thông tin cá nhân thành công");
      }
      
      setIsEditingInfo(false);
    } catch (error) {
      toast.error("Có lỗi xảy ra khi cập nhật thông tin");
    }
  };

  // Account form handlers
  const handleEditAccount = () => {
    setIsEditingAccount(true);
  };

  const handleCancelAccount = () => {
    if (customer) {
      setAccountForm({
        username: customer.username || "",
        password: "",
      });
    }
    setIsEditingAccount(false);
  };

  const handleSaveAccount = async () => {
    if (!customer) return;

    try {
      const updateData: any = {};
      
      // Nếu không có username hiện tại và có nhập username mới -> tạo tài khoản
      // Nếu có username hiện tại -> cập nhật
      if (accountForm.username !== customer.username) {
        updateData.username = accountForm.username && accountForm.username.trim() !== "" ? accountForm.username : null;
      }
      
      // TODO: Implement password update logic
      if (accountForm.password) {
        // updateData.password = accountForm.password;
        toast.info("Tính năng cập nhật mật khẩu sẽ được triển khai sau");
      }

      if (Object.keys(updateData).length > 0) {
        await updateCustomer(customer.id, updateData);
        toast.success("Cập nhật tài khoản thành công");
      }
      
      setIsEditingAccount(false);
      setAccountForm(prev => ({ ...prev, password: "" })); // Clear password
    } catch (error) {
      toast.error("Có lỗi xảy ra khi cập nhật tài khoản");
    }
  };

  if (!customer) {
    return (
      <AuthGuard>
        <div className="space-y-6">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => router.back()}>
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div>
              <h1 className="text-3xl font-bold">Chi Tiết Khách Hàng</h1>
              <p className="text-muted-foreground">Đang tải thông tin...</p>
            </div>
          </div>
        </div>
      </AuthGuard>
    );
  }

  const membershipType = membershipTypes.find(mt => mt.id === customer.membershipTypeId);

  return (
    <AuthGuard>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold">Chi Tiết Khách Hàng</h1>
            <p className="text-muted-foreground">
              Quản lý thông tin chi tiết của khách hàng
            </p>
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          {/* Thông tin cá nhân */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Thông Tin Cá Nhân
                </CardTitle>
                <div className="flex items-center gap-2">
                  {isEditingInfo ? (
                    <>
                      <Button variant="outline" size="sm" onClick={handleCancelInfo} disabled={isUpdating}>
                        <X className="h-4 w-4 mr-2" />
                        Hủy
                      </Button>
                      <Button size="sm" onClick={handleSaveInfo} disabled={isUpdating}>
                        <Save className="h-4 w-4 mr-2" />
                        {isUpdating ? "Đang lưu..." : "Lưu"}
                      </Button>
                    </>
                  ) : (
                    <Button size="sm" onClick={handleEditInfo}>
                      <Edit className="h-4 w-4 mr-2" />
                      Chỉnh Sửa
                    </Button>
                  )}
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="lastName">Họ và tên đệm</Label>
                  {isEditingInfo ? (
                    <Input
                      id="lastName"
                      value={infoForm.lastName}
                      onChange={(e) => setInfoForm(prev => ({ ...prev, lastName: e.target.value }))}
                      placeholder="Nguyễn Văn"
                    />
                  ) : (
                    <p className="text-sm font-medium">{customer.lastName || "Chưa cập nhật"}</p>
                  )}
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="firstName">Tên</Label>
                  {isEditingInfo ? (
                    <Input
                      id="firstName"
                      value={infoForm.firstName}
                      onChange={(e) => setInfoForm(prev => ({ ...prev, firstName: e.target.value }))}
                      placeholder="An"
                    />
                  ) : (
                    <p className="text-sm font-medium">{customer.firstName || "Chưa cập nhật"}</p>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">Số điện thoại</Label>
                {isEditingInfo ? (
                  <Input
                    id="phone"
                    value={infoForm.phone}
                    onChange={(e) => setInfoForm(prev => ({ ...prev, phone: e.target.value }))}
                    placeholder="0901234567"
                  />
                ) : (
                  <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <p className="text-sm font-medium">{customer.phone}</p>
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="gender">Giới tính</Label>
                {isEditingInfo ? (
                  <Select value={infoForm.gender} onValueChange={(value) => setInfoForm(prev => ({ ...prev, gender: value }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Chọn giới tính" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="MALE">Nam</SelectItem>
                      <SelectItem value="FEMALE">Nữ</SelectItem>
                      <SelectItem value="OTHER">Khác</SelectItem>
                    </SelectContent>
                  </Select>
                ) : (
                  <Badge variant="outline">{getGenderLabel(customer.gender)}</Badge>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Tài khoản */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Lock className="h-5 w-5" />
                  Tài Khoản
                </CardTitle>
                <div className="flex items-center gap-2">
                  {isEditingAccount ? (
                    <>
                      <Button variant="outline" size="sm" onClick={handleCancelAccount} disabled={isUpdating}>
                        <X className="h-4 w-4 mr-2" />
                        Hủy
                      </Button>
                      <Button size="sm" onClick={handleSaveAccount} disabled={isUpdating}>
                        <Save className="h-4 w-4 mr-2" />
                        {isUpdating ? "Đang lưu..." : "Lưu"}
                      </Button>
                    </>
                  ) : (
                    <Button size="sm" onClick={handleEditAccount}>
                      <Edit className="h-4 w-4 mr-2" />
                      {customer.username ? "Chỉnh Sửa" : "Tạo Tài Khoản"}
                    </Button>
                  )}
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="username">Tên đăng nhập</Label>
                {isEditingAccount ? (
                  <Input
                    id="username"
                    value={accountForm.username}
                    onChange={(e) => setAccountForm(prev => ({ ...prev, username: e.target.value }))}
                    placeholder="customer_username"
                  />
                ) : (
                  <p className="text-sm font-medium">
                    {customer.username || (
                      <span className="text-muted-foreground">Chưa có tài khoản</span>
                    )}
                  </p>
                )}
              </div>

              {isEditingAccount && (
                <div className="space-y-2">
                  <Label htmlFor="password">
                    {customer.username ? "Mật khẩu mới (để trống nếu không đổi)" : "Mật khẩu"}
                  </Label>
                  <Input
                    id="password"
                    type="password"
                    value={accountForm.password}
                    onChange={(e) => setAccountForm(prev => ({ ...prev, password: e.target.value }))}
                    placeholder="••••••••"
                  />
                </div>
              )}

              {!isEditingAccount && customer.lastLogin && (
                <div className="space-y-2">
                  <Label>Đăng nhập lần cuối</Label>
                  <p className="text-sm font-medium">{formatDate(customer.lastLogin)}</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Thông tin thành viên */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Crown className="h-5 w-5" />
              Thông Tin Thành Viên
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Loại thành viên</Label>
                {membershipType ? (
                  <div className="flex items-center gap-2">
                    <Crown className="h-4 w-4 text-yellow-600" />
                    <Badge variant="secondary">{membershipType.type}</Badge>
                    <Badge variant="outline" className="text-xs">
                      {membershipType.discountValue}% giảm giá
                    </Badge>
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">Chưa có loại thành viên</p>
                )}
              </div>

              <div className="space-y-2">
                <Label>Điểm tích lũy hiện tại</Label>
                <div className="flex items-center gap-2">
                  <CreditCard className="h-4 w-4 text-blue-600" />
                  <p className="text-lg font-semibold">{customer.currentPoints || 0} điểm</p>
                </div>
              </div>
            </div>

            {membershipType && (
              <>
                <Separator />
                <div className="space-y-2">
                  <Label>Thông tin loại thành viên</Label>
                  <div className="space-y-1 text-sm">
                    <p><strong>Điểm yêu cầu:</strong> {membershipType.requiredPoint} điểm</p>
                    <p><strong>Giảm giá:</strong> {membershipType.discountValue}%</p>
                    {membershipType.validUntil && (
                      <p><strong>Có hiệu lực đến:</strong> {formatDate(membershipType.validUntil)}</p>
                    )}
                    {membershipType.description && (
                      <p><strong>Mô tả:</strong> {membershipType.description}</p>
                    )}
                  </div>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* Thông tin hệ thống */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Thông Tin Hệ Thống
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <Label>ID khách hàng</Label>
                <p className="font-medium">{customer.id}</p>
              </div>
              <div>
                <Label>Ngày tạo</Label>
                <p className="font-medium">{formatDate(customer.createdAt)}</p>
              </div>
              <div>
                <Label>Cập nhật lần cuối</Label>
                <p className="font-medium">{formatDate(customer.updatedAt)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </AuthGuard>
  );
} 