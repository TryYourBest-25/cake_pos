import { Metadata } from "next";
import Link from "next/link";

import { LoginForm } from "@/components/forms/login-form";

export const metadata: Metadata = {
  title: "Đăng nhập | Cake POS",
  description: "Đăng nhập vào hệ thống bán hàng Cake POS - Dành cho nhân viên cửa hàng",
};

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        {/* Header */}
        <div className="text-center">
          <div className="mx-auto h-20 w-20 bg-primary rounded-full flex items-center justify-center mb-6">
            <span className="text-3xl font-bold text-primary-foreground">🧁</span>
          </div>
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white">
            Cake POS
          </h1>
          <p className="mt-3 text-lg text-gray-600 dark:text-gray-400">
            Hệ thống bán hàng cửa hàng bánh
          </p>
        </div>

        {/* Login Form */}
        <div className="mt-8">
          <LoginForm />
        </div>

        {/* Footer */}
        <div className="text-center">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Dành cho nhân viên cửa hàng bánh
          </p>
          <div className="mt-4 text-xs text-gray-400 dark:text-gray-500">
            <p>
              Bằng việc đăng nhập, bạn đồng ý với{" "}
              <Link href="/terms" className="text-primary hover:underline">
                Điều khoản dịch vụ
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
} 