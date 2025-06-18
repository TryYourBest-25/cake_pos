import { Metadata } from "next";
import { Toaster } from "@/components/ui/sonner";

export const metadata: Metadata = {
  title: "Đăng nhập | Cake POS",
  description: "Đăng nhập vào hệ thống Point of Sale Cake POS",
};

export default function LoginLayout({
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