"use client";

import { useState } from "react";
import { Search, UserPlus, Phone, User, Crown, Gift } from "lucide-react";
import { toast } from "sonner";
import { customerService, Customer as ApiCustomer, CreateCustomerDto } from "@/lib/services/customer-service";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { POSCustomer } from "@/types";

interface CustomerSearchDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectCustomer: (customer: POSCustomer) => void;
  currentCustomer?: POSCustomer;
}

export function CustomerSearchDialog({
  isOpen,
  onClose,
  onSelectCustomer,
  currentCustomer,
}: CustomerSearchDialogProps) {
  const [searchPhone, setSearchPhone] = useState("");
  const [guestName, setGuestName] = useState("");
  const [guestPhone, setGuestPhone] = useState("");
  const [guestGender, setGuestGender] = useState<string>("");
  const [isAddingGuest, setIsAddingGuest] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSearch = async () => {
    if (!searchPhone.trim()) return;
    
    setIsLoading(true);
    
    try {
      const foundCustomer = await customerService.findByPhone(searchPhone);
      
      if (foundCustomer) {
        // Tìm thấy khách hàng
        const customerName = `${foundCustomer.first_name || ''} ${foundCustomer.last_name || ''}`.trim() || 'Khách hàng';
        
        const customer: POSCustomer = {
          name: customerName,
          phone: foundCustomer.phone,
          customer_id: foundCustomer.customer_id,
          isGuest: false,
          membership_type: foundCustomer.membership_type,
          current_points: foundCustomer.current_points,
        };
        
        toast.success("Tìm thấy khách hàng!", {
          description: `${customerName} - ${foundCustomer.phone}`,
        });
        
        onSelectCustomer(customer);
        handleClose();
      } else {
        // Không tìm thấy khách hàng
        toast.info("Không tìm thấy khách hàng", {
          description: "Vui lòng thêm khách hàng mới với số điện thoại này.",
        });
        setIsAddingGuest(true);
        setGuestPhone(searchPhone);
      }
    } catch (error: any) {
      console.error('Lỗi khi tìm kiếm khách hàng:', error);
      
      const errorMessage = error?.response?.data?.message || 
                          error?.message || 
                          'Có lỗi xảy ra khi tìm kiếm khách hàng';
      
      toast.error("Lỗi tìm kiếm", {
        description: errorMessage,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddGuest = async () => {
    if (!guestPhone.trim()) {
      toast.error("Thông tin không đầy đủ", {
        description: "Vui lòng nhập số điện thoại khách hàng",
      });
      return;
    }

    setIsLoading(true);

    try {
      // Tách tên thành first_name và last_name (nếu có)
      let firstName: string | undefined;
      let lastName: string | undefined;
      
      if (guestName.trim()) {
        const nameParts = guestName.trim().split(' ');
        firstName = nameParts.pop() || undefined;
        lastName = nameParts.length > 0 ? nameParts.join(' ') : undefined;
      }

      const createData: CreateCustomerDto = {
        phone: guestPhone.trim(),
        first_name: firstName,
        last_name: lastName,
        gender: guestGender as 'MALE' | 'FEMALE' | 'OTHER' | undefined,
      };

      const newCustomer = await customerService.createCustomer(createData);
      
      if (!newCustomer || !newCustomer.phone) {
        throw new Error('Phản hồi không hợp lệ từ server khi tạo khách hàng');
      }
      
      const customer: POSCustomer = {
        name: guestName.trim() || 'Khách hàng',
        phone: newCustomer.phone,
        customer_id: newCustomer.customer_id,
        isGuest: true,
        membership_type: newCustomer.membership_type,
        current_points: newCustomer.current_points,
      };

      toast.success("Thêm khách hàng thành công!", {
        description: `${guestName.trim() || 'Khách hàng'} - ${newCustomer.phone}`,
      });

      onSelectCustomer(customer);
      handleClose();
    } catch (error: any) {
      console.error('Lỗi khi tạo khách hàng:', error);
      
      const errorMessage = error?.response?.data?.message || 
                          error?.message || 
                          'Có lỗi xảy ra khi tạo khách hàng';
      
      toast.error("Lỗi tạo khách hàng", {
        description: errorMessage,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setSearchPhone("");
    setGuestName("");
    setGuestPhone("");
    setGuestGender("");
    setIsAddingGuest(false);
    onClose();
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(price);
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Chọn khách hàng</DialogTitle>
          <DialogDescription>
            Tìm kiếm khách hàng theo số điện thoại hoặc thêm khách hàng mới
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {!isAddingGuest ? (
            <>
              {/* Search Section */}
              <div className="space-y-3">
                <Label htmlFor="phone">Số điện thoại khách hàng</Label>
                <div className="flex space-x-2">
                  <div className="relative flex-1">
                    <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <Input
                      id="phone"
                      placeholder="Nhập số điện thoại..."
                      value={searchPhone}
                      onChange={(e) => setSearchPhone(e.target.value)}
                      className="pl-10"
                      onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                    />
                  </div>
                  <Button onClick={handleSearch} disabled={!searchPhone.trim() || isLoading}>
                    <Search className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="space-y-2">
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => setIsAddingGuest(true)}
                  disabled={isLoading}
                >
                  <UserPlus className="w-4 h-4 mr-2" />
                  Thêm khách hàng mới
                </Button>
              </div>
            </>
          ) : (
            /* Add Guest Section */
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Thêm khách hàng mới</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="guest-name">Tên khách hàng</Label>
                  <Input
                    id="guest-name"
                    placeholder="Nhập tên khách hàng (tùy chọn)..."
                    value={guestName}
                    onChange={(e) => setGuestName(e.target.value)}
                  />
                </div>
                
                <div>
                  <Label htmlFor="guest-phone">Số điện thoại *</Label>
                  <Input
                    id="guest-phone"
                    placeholder="Nhập số điện thoại..."
                    value={guestPhone}
                    onChange={(e) => setGuestPhone(e.target.value)}
                  />
                </div>

                <div>
                  <Label htmlFor="guest-gender">Giới tính</Label>
                  <Select value={guestGender} onValueChange={setGuestGender}>
                    <SelectTrigger>
                      <SelectValue placeholder="Chọn giới tính" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="MALE">Nam</SelectItem>
                      <SelectItem value="FEMALE">Nữ</SelectItem>
                      <SelectItem value="OTHER">Khác</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex space-x-2 pt-2">
                  <Button onClick={handleAddGuest} className="flex-1" disabled={isLoading}>
                    {isLoading ? "Đang thêm..." : "Thêm khách hàng"}
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => setIsAddingGuest(false)}
                    disabled={isLoading}
                  >
                    Quay lại
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Current Customer Info */}
          {currentCustomer && (
            <Card className="bg-blue-50">
              <CardContent className="pt-4">
                <div className="space-y-3">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                      <User className="w-4 h-4 text-blue-600" />
                    </div>
                    <div>
                      <p className="font-medium text-sm">{currentCustomer.name}</p>
                      <p className="text-xs text-gray-500">{currentCustomer.phone}</p>
                      {currentCustomer.isGuest && (
                        <p className="text-xs text-blue-600">Khách mới</p>
                      )}
                    </div>
                  </div>
                  
                  {/* Membership Info */}
                  {currentCustomer.membership_type && (
                    <div className="bg-white rounded-lg p-3 border">
                      <div className="flex items-center space-x-2 mb-2">
                        <Crown className="w-4 h-4 text-yellow-500" />
                        <span className="text-sm font-medium text-gray-700">Hạng thành viên</span>
                      </div>
                      <div className="space-y-1">
                        <p className="text-sm font-semibold text-blue-600">
                          {currentCustomer.membership_type.type}
                        </p>
                        <div className="flex items-center justify-between text-xs text-gray-600">
                          <span>Giảm giá: {currentCustomer.membership_type.discount_value}%</span>
                          <div className="flex items-center space-x-1">
                            <Gift className="w-3 h-3" />
                            <span>{currentCustomer.current_points || 0} điểm</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
} 