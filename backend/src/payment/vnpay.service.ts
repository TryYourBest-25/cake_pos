import {
  Injectable,
  BadRequestException,
  InternalServerErrorException,
} from '@nestjs/common';
import { VnpayService } from 'nestjs-vnpay';

export interface VNPayPaymentRequest {
  orderId: number;
  amount: number;
  orderInfo: string;
  returnUrl: string;
  ipAddr: string;
}

export interface VNPayCallbackData {
  vnp_TmnCode: string;
  vnp_Amount: string;
  vnp_BankCode: string;
  vnp_BankTranNo: string;
  vnp_CardType: string;
  vnp_OrderInfo: string;
  vnp_PayDate: string;
  vnp_ResponseCode: string;
  vnp_TxnRef: string;
  vnp_TransactionNo: string;
  vnp_TransactionStatus: string;
  vnp_SecureHash: string;
  [key: string]: string;
}

@Injectable()
export class VNPayService {
  constructor(private vnpayService: VnpayService) {}

  /**
   * Tạo URL thanh toán VNPay
   */
  async createPaymentUrl(paymentRequest: VNPayPaymentRequest): Promise<string> {
    try {
      const { orderId, amount, orderInfo, returnUrl, ipAddr } = paymentRequest;

      const txnRef = `ORDER_${orderId}_${Date.now()}`;

      const paymentData: any = {
        vnp_TxnRef: txnRef,
        vnp_OrderInfo: orderInfo || `Thanh toan don hang ${orderId}`,
        vnp_Amount: amount * 100, 
        vnp_ReturnUrl: returnUrl,
        vnp_IpAddr: ipAddr,
        vnp_CreateDate: this.formatDate(new Date()),
        vnp_CurrCode: 'VND',
        vnp_Locale: 'vn',
      };

      const paymentUrl = this.vnpayService.buildPaymentUrl(paymentData);
      return paymentUrl;
    } catch (error) {
      console.error('Error creating VNPay payment URL:', error);
      throw new InternalServerErrorException(
        'Không thể tạo URL thanh toán VNPay',
      );
    }
  }

  /**
   * Xác thực callback từ VNPay
   */
  async verifyCallback(callbackData: VNPayCallbackData): Promise<{
    isValid: boolean;
    orderId?: number;
    amount?: number;
    transactionStatus?: string;
    responseCode?: string;
  }> {
    try {
      // Xác thực chữ ký
      const isValidSignature = this.vnpayService.verifyReturnUrl(callbackData);

      if (!isValidSignature) {
        return { isValid: false };
      }

      // Parse thông tin từ callback
      const orderId = this.extractOrderIdFromTxnRef(callbackData.vnp_TxnRef);
      const amount = parseInt(callbackData.vnp_Amount) / 100; // Chuyển về số tiền thực

      return {
        isValid: true,
        orderId,
        amount,
        transactionStatus: callbackData.vnp_TransactionStatus,
        responseCode: callbackData.vnp_ResponseCode,
      };
    } catch (error) {
      console.error('Error verifying VNPay callback:', error);
      return { isValid: false };
    }
  }

  /**
   * Kiểm tra trạng thái thanh toán có thành công không
   */
  isPaymentSuccessful(
    responseCode: string,
    transactionStatus: string,
  ): boolean {
    return responseCode === '00' && transactionStatus === '00';
  }

  /**
   * Format date cho VNPay (yyyyMMddHHmmss)
   */
  private formatDate(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const seconds = String(date.getSeconds()).padStart(2, '0');

    return `${year}${month}${day}${hours}${minutes}${seconds}`;
  }

  /**
   * Extract order ID từ transaction reference
   */
  private extractOrderIdFromTxnRef(txnRef: string): number {
    try {
      // TxnRef có format: ORDER_{orderId}_{timestamp}
      const parts = txnRef.split('_');
      if (parts.length >= 2 && parts[0] === 'ORDER') {
        return parseInt(parts[1]);
      }
      throw new Error('Invalid transaction reference format');
    } catch (error) {
      throw new BadRequestException('Mã giao dịch không hợp lệ');
    }
  }
}
