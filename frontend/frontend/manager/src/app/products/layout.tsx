import { MainLayout } from "@/components/layout/main-layout";
import { Toaster } from "@/components/ui/sonner";

interface ProductsLayoutProps {
  children: React.ReactNode;
}

export default function ProductsLayout({ children }: ProductsLayoutProps) {
  return (
    <>
      <MainLayout>
        {children}
      </MainLayout>
      <Toaster richColors />
    </>
  );
} 