import { apiClient } from "@/lib/api-client";

export interface InvoiceData {
  order_id: number;
  order_time: Date;
  customer_name?: string;
  customer_phone?: string;
  employee_name: string;
  store_name: string;
  store_address: string;
  store_phone: string;
  store_email?: string;
  store_tax_code?: string;
  items: Array<{
    product_name: string;
    quantity: number;
    unit_price: number;
    total_price: number;
  }>;
  subtotal: number;
  discount_amount: number;
  final_amount: number;
  payment_method: string;
  amount_paid: number;
  change_amount: number;
  payment_time: Date;
  payment_status: string;
  print_time: string;
}

/**
 * Invoice Service
 * Xử lý tất cả API calls liên quan đến hóa đơn
 */
export class InvoiceService {
  private static readonly BASE_URL = '/invoice';

  /**
   * Lấy hóa đơn dưới dạng HTML
   * Chỉ CUSTOMER có thể xem HTML
   */
  async getInvoiceHTML(orderId: number): Promise<string> {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api/v1'}${InvoiceService.BASE_URL}/${orderId}/html`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
        'Content-Type': 'text/html; charset=utf-8',
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return response.text();
  }

  /**
   * Xuất hóa đơn dưới dạng PDF
   * Chỉ STAFF và MANAGER có thể xuất PDF
   */
  async getInvoicePDF(orderId: number): Promise<Blob> {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api/v1'}${InvoiceService.BASE_URL}/${orderId}/pdf`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return response.blob();
  }

  /**
   * Lấy dữ liệu hóa đơn
   * Chỉ STAFF và MANAGER có thể lấy data
   */
  async getInvoiceData(orderId: number): Promise<InvoiceData> {
    return apiClient.get<InvoiceData>(`${InvoiceService.BASE_URL}/${orderId}/data`);
  }

  /**
   * Mở hóa đơn HTML trong tab mới để in
   */
  async printInvoiceHTML(orderId: number): Promise<void> {
    try {
      const html = await this.getInvoiceHTML(orderId);
      
      // Tạo window mới để in
      const printWindow = window.open('', '_blank');
      if (printWindow) {
        printWindow.document.write(html);
        printWindow.document.close();
        
        // Đợi load xong rồi in
        printWindow.onload = () => {
          printWindow.print();
          // Đóng window sau khi in (tùy chọn)
          // printWindow.close();
        };
      } else {
        throw new Error('Không thể mở cửa sổ in. Vui lòng kiểm tra popup blocker.');
      }
    } catch (error) {
      console.error('Lỗi khi in hóa đơn HTML:', error);
      throw error;
    }
  }

  /**
   * Tải xuống hóa đơn PDF
   */
  async downloadInvoicePDF(orderId: number): Promise<void> {
    try {
      const pdfBlob = await this.getInvoicePDF(orderId);
      
      // Tạo URL từ blob
      const url = window.URL.createObjectURL(pdfBlob);
      
      // Tạo link download
      const link = document.createElement('a');
      link.href = url;
      link.download = `hoa-don-${orderId}.pdf`;
      
      // Trigger download
      document.body.appendChild(link);
      link.click();
      
      // Cleanup
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Lỗi khi tải hóa đơn PDF:', error);
      throw error;
    }
  }

  /**
   * Mở hóa đơn PDF trong tab mới
   */
  async viewInvoicePDF(orderId: number): Promise<void> {
    try {
      const pdfBlob = await this.getInvoicePDF(orderId);
      
      // Tạo URL từ blob
      const url = window.URL.createObjectURL(pdfBlob);
      
      // Mở trong tab mới
      const newWindow = window.open(url, '_blank');
      if (!newWindow) {
        throw new Error('Không thể mở tab mới. Vui lòng kiểm tra popup blocker.');
      }
      
      // Cleanup URL sau 1 phút
      setTimeout(() => {
        window.URL.revokeObjectURL(url);
      }, 60000);
    } catch (error) {
      console.error('Lỗi khi xem hóa đơn PDF:', error);
      throw error;
    }
  }

  /**
   * In hóa đơn - tự động chọn HTML hoặc PDF dựa trên role
   */
  async printInvoice(orderId: number, userRole?: string): Promise<void> {
    try {
      // CUSTOMER chỉ có thể xem HTML, STAFF/MANAGER có thể chọn PDF
      if (userRole === 'CUSTOMER') {
        await this.printInvoiceHTML(orderId);
      } else {
        // Mặc định dùng HTML cho in nhanh, có thể thay đổi thành PDF nếu cần
        await this.printInvoiceHTML(orderId);
      }
    } catch (error) {
      console.error('Lỗi khi in hóa đơn:', error);
      throw error;
    }
  }
}

// Export singleton instance
export const invoiceService = new InvoiceService(); 