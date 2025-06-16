"use client";

import { useState, useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { RefreshCw, CheckCircle, XCircle, Clock } from "lucide-react";
import { apiClient, API_CONFIG } from "@/lib/api-client";
import { managerService } from "@/lib/services/manager-service";

interface ApiStatus {
  status: 'connected' | 'disconnected' | 'checking';
  message: string;
  responseTime?: number;
  lastChecked?: Date;
}

export function ApiStatus() {
  const [apiStatus, setApiStatus] = useState<ApiStatus>({
    status: 'checking',
    message: 'Đang kiểm tra kết nối...',
  });

  const checkApiConnection = async () => {
    setApiStatus({
      status: 'checking',
      message: 'Đang kiểm tra kết nối...',
    });

    const startTime = Date.now();

    try {
      // Test basic health check
      await apiClient.healthCheck();
      
      // Test manager service
      await managerService.ping();
      
      const responseTime = Date.now() - startTime;
      
      setApiStatus({
        status: 'connected',
        message: 'Kết nối API thành công',
        responseTime,
        lastChecked: new Date(),
      });
    } catch (error) {
      const responseTime = Date.now() - startTime;
      
      setApiStatus({
        status: 'disconnected',
        message: error instanceof Error ? error.message : 'Lỗi kết nối không xác định',
        responseTime,
        lastChecked: new Date(),
      });
    }
  };

  useEffect(() => {
    checkApiConnection();
  }, []);

  const getStatusIcon = () => {
    switch (apiStatus.status) {
      case 'connected':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'disconnected':
        return <XCircle className="h-4 w-4 text-red-500" />;
      case 'checking':
        return <Clock className="h-4 w-4 text-yellow-500 animate-pulse" />;
    }
  };

  const getStatusBadge = () => {
    switch (apiStatus.status) {
      case 'connected':
        return <Badge variant="default" className="bg-green-500">Kết nối</Badge>;
      case 'disconnected':
        return <Badge variant="destructive">Ngắt kết nối</Badge>;
      case 'checking':
        return <Badge variant="secondary">Đang kiểm tra</Badge>;
    }
  };

  return (
    <Card className="w-full max-w-md">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2">
          {getStatusIcon()}
          Trạng Thái API
        </CardTitle>
        <CardDescription>
          Kiểm tra kết nối với backend server
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium">Trạng thái:</span>
          {getStatusBadge()}
        </div>
        
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span>Base URL:</span>
            <code className="text-xs bg-muted px-2 py-1 rounded">
              {API_CONFIG.BASE_URL}
            </code>
          </div>
          
          {apiStatus.responseTime && (
            <div className="flex items-center justify-between text-sm">
              <span>Thời gian phản hồi:</span>
              <span className="font-mono">{apiStatus.responseTime}ms</span>
            </div>
          )}
          
          {apiStatus.lastChecked && (
            <div className="flex items-center justify-between text-sm">
              <span>Kiểm tra lần cuối:</span>
              <span className="font-mono text-xs">
                {apiStatus.lastChecked.toLocaleTimeString('vi-VN')}
              </span>
            </div>
          )}
        </div>

        <Separator />

        <div className="space-y-2">
          <p className="text-sm text-muted-foreground">
            {apiStatus.message}
          </p>
          
          <Button 
            onClick={checkApiConnection}
            disabled={apiStatus.status === 'checking'}
            size="sm"
            className="w-full"
          >
            <RefreshCw className={`mr-2 h-4 w-4 ${apiStatus.status === 'checking' ? 'animate-spin' : ''}`} />
            Kiểm tra lại
          </Button>
        </div>
      </CardContent>
    </Card>
  );
} 