import { apiClient } from '@/lib/api-client';
import { InvoiceData } from '@/types/api';

/**
 * Invoice Service
 * Xử lý các API liên quan đến hóa đơn
 */
export class InvoiceService {
  private readonly endpoint = '/invoice';

  /**
   * Lấy dữ liệu hóa đơn dưới dạng JSON
   */
  async getInvoiceData(orderId: number): Promise<InvoiceData> {
    const response = await apiClient.get<InvoiceData>(`${this.endpoint}/${orderId}/data`);
    
    // Transform dates from strings to Date objects
    return {
      ...response,
      order_time: new Date(response.order_time),
      payment_time: new Date(response.payment_time),
    };
  }

  /**
   * Mở hóa đơn HTML trong tab mới
   */
  async viewInvoiceHTML(orderId: number): Promise<void> {
    const token = localStorage.getItem('auth_token');
    if (!token) {
      throw new Error('Không tìm thấy token xác thực');
    }

    const url = `${process.env.NEXT_PUBLIC_API_URL}${this.endpoint}/${orderId}/html`;
    const newWindow = window.open('', '_blank');
    
    if (newWindow) {
      // Tạo form ẩn để gửi token qua POST request
      const form = document.createElement('form');
      form.method = 'GET';
      form.action = url;
      form.style.display = 'none';
      
      // Tạo iframe để load nội dung với header Authorization
      const iframe = document.createElement('iframe');
      iframe.style.width = '100%';
      iframe.style.height = '100vh';
      iframe.style.border = 'none';
      
      // Sử dụng fetch để lấy HTML content và hiển thị
      fetch(url, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      })
      .then(response => {
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}`);
        }
        return response.text();
      })
      .then(html => {
        newWindow.document.write(html);
        newWindow.document.close();
      })
      .catch(error => {
        newWindow.document.write(`
          <html>
            <body>
              <h1>Lỗi tải hóa đơn</h1>
              <p>Không thể tải hóa đơn: ${error.message}</p>
            </body>
          </html>
        `);
        newWindow.document.close();
      });
    }
  }

  /**
   * Tải hóa đơn PDF
   */
  async downloadInvoicePDF(orderId: number): Promise<void> {
    try {
      const token = localStorage.getItem('auth_token');
      if (!token) {
        throw new Error('Không tìm thấy token xác thực');
      }

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}${this.endpoint}/${orderId}/pdf`,
        {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `hoa-don-${orderId}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Lỗi tải hóa đơn PDF:', error);
      throw error;
    }
  }

  /**
   * In hóa đơn (mở HTML và kích hoạt print dialog)
   */
  async printInvoice(orderId: number): Promise<void> {
    try {
      const token = localStorage.getItem('auth_token');
      if (!token) {
        throw new Error('Không tìm thấy token xác thực');
      }

      const url = `${process.env.NEXT_PUBLIC_API_URL}${this.endpoint}/${orderId}/html`;
      
      // Lấy HTML content trước
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const html = await response.text();
      
      // Tạo window mới và load HTML
      const printWindow = window.open('', '_blank');
      if (printWindow) {
        printWindow.document.write(html);
        printWindow.document.close();
        
        // Đợi load xong rồi in
        printWindow.onload = () => {
          setTimeout(() => {
            printWindow.print();
          }, 1000);
        };
      }
    } catch (error) {
      console.error('Lỗi in hóa đơn:', error);
      throw error;
    }
  }
}

// Export singleton instance
export const invoiceService = new InvoiceService(); 