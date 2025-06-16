"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { ArrowLeft, Edit, Trash2, Mail, Calendar, Shield, User } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
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
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Manager } from "@/types/api";
import { managerApi } from "@/lib/api";

function formatDate(date: Date): string {
  return new Intl.DateTimeFormat("vi-VN", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

export default function ManagerDetailPage() {
  const router = useRouter();
  const params = useParams();
  const managerId = parseInt(params.id as string);
  
  const [manager, setManager] = useState<Manager | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    if (managerId) {
      loadManager();
    }
  }, [managerId]);

  const loadManager = async () => {
    try {
      setIsLoading(true);
      const response = await managerApi.getById(managerId);
      setManager(response);
    } catch (error) {
      console.error("Lỗi tải thông tin quản lý:", error);
      toast.error("Không thể tải thông tin quản lý");
      // Fallback to mock data for development
      setManager({
        id: managerId,
        name: "Nguyễn Văn An",
        email: "an.nguyen@company.com",
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

  const handleDelete = async () => {
    if (!manager) return;
    
    try {
      setIsDeleting(true);
      await managerApi.delete(manager.id);
      toast.success("Xóa quản lý thành công!");
      router.push("/users/managers");
    } catch (error) {
      console.error("Lỗi xóa quản lý:", error);
      toast.error("Không thể xóa quản lý. Vui lòng thử lại.");
    } finally {
      setIsDeleting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
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

  return (
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
            <h1 className="text-3xl font-bold">Chi Tiết Quản Lý</h1>
            <p className="text-muted-foreground">
              Thông tin chi tiết của {manager.name}
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <Button 
            variant="outline"
            onClick={() => router.push(`/users/managers/${manager.id}/edit`)}
          >
            <Edit className="mr-2 h-4 w-4" />
            Chỉnh Sửa
          </Button>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive">
                <Trash2 className="mr-2 h-4 w-4" />
                Xóa
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Xác nhận xóa</AlertDialogTitle>
                <AlertDialogDescription>
                  Bạn có chắc chắn muốn xóa quản lý <strong>{manager.name}</strong>? 
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
                  {isDeleting ? "Đang xóa..." : "Xóa"}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profile Card */}
        <Card className="lg:col-span-1">
          <CardHeader className="text-center">
            <Avatar className="h-24 w-24 mx-auto">
              <AvatarImage src={manager.avatar} alt={manager.name} />
              <AvatarFallback className="text-2xl">
                {manager.name.split(' ').map(n => n[0]).join('')}
              </AvatarFallback>
            </Avatar>
            <CardTitle className="text-xl">{manager.name}</CardTitle>
            <CardDescription>ID: {manager.id}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-center">
              <Badge variant={manager.isActive ? "default" : "secondary"} className="text-sm">
                {manager.isActive ? "Hoạt Động" : "Vô Hiệu Hóa"}
              </Badge>
            </div>
            
            <Separator />
            
            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">{manager.email}</span>
              </div>
              <div className="flex items-center space-x-2">
                <User className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">Quản lý viên</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Details Card */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Thông Tin Chi Tiết</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Permissions */}
            <div>
              <h3 className="text-lg font-semibold mb-3 flex items-center">
                <Shield className="mr-2 h-5 w-5" />
                Quyền Hạn
              </h3>
                             <div className="flex flex-wrap gap-2">
                 {manager.permissions?.map((permission) => (
                   <Badge key={permission} variant="outline">
                     {permission.replace(/_/g, ' ')}
                   </Badge>
                 )) || <p className="text-sm text-muted-foreground">Chưa có quyền hạn</p>}
               </div>
            </div>

            <Separator />

            {/* Timestamps */}
            <div>
              <h3 className="text-lg font-semibold mb-3 flex items-center">
                <Calendar className="mr-2 h-5 w-5" />
                Thời Gian
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Ngày Tạo</p>
                  <p className="text-sm">{formatDate(manager.createdAt)}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Cập Nhật Lần Cuối</p>
                  <p className="text-sm">{formatDate(manager.updatedAt)}</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 