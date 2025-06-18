"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { ArrowLeft, Loader2 } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Manager } from "@/types/api";
import { managerService } from "@/lib/services/manager-service";
import { EditManagerForm } from "@/components/forms/edit-manager-form";
import { UpdateManagerFormData } from "@/lib/validations/manager";

export default function EditManagerPage() {
  const router = useRouter();
  const params = useParams();
  const managerId = parseInt(params.id as string);
  
  const [manager, setManager] = useState<Manager | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (managerId) {
      loadManager();
    }
  }, [managerId]);

  const loadManager = async () => {
    try {
      setIsLoading(true);
      const response = await managerService.getById(managerId);
      setManager(response);
    } catch (error) {
      console.error("Lỗi tải thông tin quản lý:", error);
      toast.error("Không thể tải thông tin quản lý");
      // Fallback to mock data for development
      setManager({
        id: managerId,
        accountId: 1,
        name: "Nguyễn Văn An",
        firstName: "An",
        lastName: "Nguyễn Văn",
        email: "an.nguyen@company.com",
        phone: "0123456789",
        gender: "MALE",
        avatar: "/avatars/01.png",
        isActive: true,
        createdAt: new Date("2024-01-15T10:30:00"),
        updatedAt: new Date("2024-01-20T14:45:00"),
        permissions: ["USER_MANAGEMENT", "PRODUCT_MANAGEMENT", "ORDER_MANAGEMENT", "REPORT_VIEW"]
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (data: UpdateManagerFormData) => {
    if (!manager) return;
    
    try {
      setIsSubmitting(true);
      await managerService.update(manager.id, data);
      toast.success("Cập nhật quản lý thành công!");
      router.push(`/users/managers/${manager.id}`);
    } catch (error) {
      console.error("Lỗi cập nhật quản lý:", error);
      toast.error("Không thể cập nhật quản lý. Vui lòng thử lại.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!manager) {
    return (
      <div className="flex flex-col items-center justify-center h-96 space-y-4">
        <h2 className="text-2xl font-semibold">Không tìm thấy quản lý</h2>
        <p className="text-muted-foreground">Quản lý với ID {managerId} không tồn tại.</p>
        <Button onClick={() => router.push("/users/managers")}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Quay lại danh sách
        </Button>
      </div>
    );
  }

  // Convert manager data to form data format
  const defaultValues: UpdateManagerFormData = {
    first_name: manager.firstName,
    last_name: manager.lastName,
    email: manager.email,
    phone: manager.phone,
    gender: manager.gender || undefined,
    username: manager.username,
    password: "", // Password field will be optional for updates
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center space-x-4">
        <Button 
          variant="outline" 
          size="icon"
          onClick={() => router.push(`/users/managers/${manager.id}`)}
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold">Chỉnh Sửa Quản Lý</h1>
          <p className="text-muted-foreground">
            Cập nhật thông tin của {manager.name}
          </p>
        </div>
      </div>

      {/* Edit Form */}
      <Card className="max-w-2xl">
        <CardHeader>
          <CardTitle>Thông Tin Quản Lý</CardTitle>
          <CardDescription>
            Cập nhật thông tin và quyền hạn của quản lý viên
          </CardDescription>
        </CardHeader>
        <CardContent>
          <EditManagerForm 
            onSubmit={handleSubmit}
            isSubmitting={isSubmitting}
            defaultValues={defaultValues}
          />
        </CardContent>
      </Card>
    </div>
  );
} 