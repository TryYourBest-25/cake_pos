import { MainLayout } from "@/components/layout/main-layout";
import { Toaster } from "@/components/ui/sonner";

export default function PromotionsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <MainLayout>
        {children}
      </MainLayout>
      <Toaster richColors />
    </>
  );
} 