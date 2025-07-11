import { MainLayout } from "@/components/layout/main-layout";

export default function StoreInfoLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <MainLayout>{children}</MainLayout>;
} 