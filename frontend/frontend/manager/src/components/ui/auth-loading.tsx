import { Loader2 } from "lucide-react";

export function AuthLoading() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center space-y-4">
        <div className="mx-auto h-16 w-16 bg-primary rounded-full flex items-center justify-center">
          <span className="text-2xl font-bold text-primary-foreground">🎂</span>
        </div>
        
        <div className="space-y-2">
          <h1 className="text-2xl font-bold text-foreground">Cake POS</h1>
          <p className="text-muted-foreground">Đang kiểm tra xác thực...</p>
        </div>
        
        <div className="flex items-center justify-center pt-4">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
        </div>
      </div>
    </div>
  );
} 