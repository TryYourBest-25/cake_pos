import { Metadata } from "next";
import { Toaster } from "@/components/ui/sonner";

export const metadata: Metadata = {
  title: "Đăng nhập | Cake POS Manager",
  description: "Đăng nhập vào hệ thống quản lý Cake POS",
};

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      {children}
      <Toaster position="top-center" richColors />
    </>
  );
} 