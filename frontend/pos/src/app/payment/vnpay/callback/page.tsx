"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { CheckCircle, XCircle, Clock } from "lucide-react";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export default function VNPayCallbackPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('');
  const [orderId, setOrderId] = useState<string>('');

  useEffect(() => {
    // Lấy thông tin từ URL params
    const vnp_ResponseCode = searchParams.get('vnp_ResponseCode');
    const vnp_OrderInfo = searchParams.get('vnp_OrderInfo');
    const vnp_TxnRef = searchParams.get('vnp_TxnRef');
    const vnp_Amount = searchParams.get('vnp_Amount');
    const vnp_BankCode = searchParams.get('vnp_BankCode');
    const vnp_TransactionNo = searchParams.get('vnp_TransactionNo');

    // Xử lý kết quả
    if (vnp_ResponseCode === '00') {
      setStatus('success');
      setMessage('Thanh toán thành công!');
      toast.success("Thanh toán VNPay thành công", {
        description: "Đơn hàng đã được thanh toán hoàn tất"
      });
    } else {
      setStatus('error');
      setMessage('Thanh toán thất bại hoặc bị hủy');
      toast.error("Thanh toán VNPay thất bại", {
        description: "Vui lòng thử lại hoặc chọn phương thức thanh toán khác"
      });
    }

    // Lấy order ID từ vnp_OrderInfo hoặc vnp_TxnRef
    if (vnp_TxnRef) {
      setOrderId(vnp_TxnRef);
    }
  }, [searchParams]);

  const handleBackToPOS = () => {
    router.push('/pos');
  };

  const handleViewOrder = () => {
    if (orderId) {
      router.push(`/orders/${orderId}`);
    }
  };

  const formatPrice = (priceString: string | null) => {
    if (!priceString) return 'N/A';
    const price = parseInt(priceString) / 100; // VNPay amount is in xu (cents)
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(price);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              {status === 'loading' && <Clock className="w-5 h-5 text-blue-600" />}
              {status === 'success' && <CheckCircle className="w-5 h-5 text-green-600" />}
              {status === 'error' && <XCircle className="w-5 h-5 text-red-600" />}
              <span>Kết quả thanh toán VNPay</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="text-center py-8">
            {status === 'loading' && (
              <div>
                <Clock className="w-16 h-16 text-blue-600 mx-auto mb-4 animate-spin" />
                <p className="text-lg font-medium text-gray-900">Đang xử lý...</p>
                <p className="text-gray-600">Vui lòng chờ trong giây lát</p>
              </div>
            )}

            {status === 'success' && (
              <div>
                <CheckCircle className="w-16 h-16 text-green-600 mx-auto mb-4" />
                <h2 className="text-2xl font-bold text-green-800 mb-2">Thanh toán thành công!</h2>
                <p className="text-gray-600 mb-6">{message}</p>
                
                <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
                  <div className="space-y-2 text-sm">
                    {searchParams.get('vnp_TxnRef') && (
                      <div className="flex justify-between">
                        <span>Mã đơn hàng:</span>
                        <span className="font-medium">#{searchParams.get('vnp_TxnRef')}</span>
                      </div>
                    )}
                    {searchParams.get('vnp_Amount') && (
                      <div className="flex justify-between">
                        <span>Số tiền:</span>
                        <span className="font-medium">{formatPrice(searchParams.get('vnp_Amount'))}</span>
                      </div>
                    )}
                    {searchParams.get('vnp_BankCode') && (
                      <div className="flex justify-between">
                        <span>Ngân hàng:</span>
                        <span className="font-medium">{searchParams.get('vnp_BankCode')}</span>
                      </div>
                    )}
                    {searchParams.get('vnp_TransactionNo') && (
                      <div className="flex justify-between">
                        <span>Mã giao dịch:</span>
                        <span className="font-medium">{searchParams.get('vnp_TransactionNo')}</span>
                      </div>
                    )}
                  </div>
                </div>

                <Badge variant="default" className="mb-6">
                  Thanh toán hoàn tất
                </Badge>
              </div>
            )}

            {status === 'error' && (
              <div>
                <XCircle className="w-16 h-16 text-red-600 mx-auto mb-4" />
                <h2 className="text-2xl font-bold text-red-800 mb-2">Thanh toán thất bại</h2>
                <p className="text-gray-600 mb-6">{message}</p>
                
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
                  <p className="text-sm text-red-700">
                    Mã lỗi: {searchParams.get('vnp_ResponseCode')}
                  </p>
                  {searchParams.get('vnp_TxnRef') && (
                    <p className="text-sm text-red-700">
                      Mã đơn hàng: #{searchParams.get('vnp_TxnRef')}
                    </p>
                  )}
                </div>

                <Badge variant="destructive" className="mb-6">
                  Thanh toán thất bại
                </Badge>
              </div>
            )}

            <div className="flex space-x-3 justify-center">
              <Button variant="outline" onClick={handleBackToPOS}>
                Về trang POS
              </Button>
              {status === 'success' && orderId && (
                <Button onClick={handleViewOrder}>
                  Xem đơn hàng
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 