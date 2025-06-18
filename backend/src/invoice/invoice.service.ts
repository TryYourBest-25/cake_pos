import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import * as Handlebars from 'handlebars';
import * as puppeteer from 'puppeteer';

export interface InvoiceData {
  order_id: number;
  order_time: Date;
  customer_name?: string;
  customer_phone?: string;
  employee_name: string;
  store_name: string;
  store_address: string;
  store_phone: string;
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
}

@Injectable()
export class InvoiceService {
  constructor(private prisma: PrismaService) {}

  /**
   * Lấy dữ liệu chi tiết của đơn hàng để tạo hóa đơn
   */
  async getInvoiceData(orderId: number): Promise<InvoiceData> {
    const order = (await this.prisma.order.findUnique({
      where: { order_id: orderId },
      include: {
        customer: true,
        employee: {
          include: {
            account: true,
          },
        },
        order_product: {
          include: {
            product: true,
          },
        },
        order_discount: {
          include: {
            discount: true,
          },
        },
        payment: {
          include: {
            payment_method: true,
          },
        },
      },
    })) as any;

    if (!order) {
      throw new NotFoundException(`Đơn hàng với ID ${orderId} không tồn tại`);
    }

    // Tính tổng discount
    const totalDiscount = (order.order_discount || []).reduce(
      (sum: number, od: any) => {
        const discountAmount =
          od.discount.discount_type === 'PERCENTAGE'
            ? (Number(od.discount.discount_value) / 100) *
              Number(order.total_amount || 0)
            : Number(od.discount.discount_value);
        return sum + discountAmount;
      },
      0,
    );

    // Lấy thông tin payment gần nhất
    const latestPayment = (order.payment || []).sort(
      (a: any, b: any) =>
        new Date(b.payment_time || b.created_at || 0).getTime() -
        new Date(a.payment_time || a.created_at || 0).getTime(),
    )[0];

    const invoiceData: InvoiceData = {
      order_id: order.order_id,
      order_time: new Date(order.order_time || order.created_at || new Date()),
      customer_name: order.customer?.name || 'Khách vãng lai',
      customer_phone: order.customer?.phone || '',
      employee_name: order.employee?.account?.username || 'N/A',
      store_name: 'Cake POS Store',
      store_address: '123 Đường ABC, Quận XYZ, TP.HCM',
      store_phone: '0123 456 789',
      items: (order.order_product || []).map((op: any) => ({
        product_name: op.product?.name || 'N/A',
        quantity: op.quantity || 0,
        unit_price: Number(op.unit_price || 0),
        total_price: Number(op.total_price || 0),
      })),
      subtotal: Number(order.total_amount || 0),
      discount_amount: totalDiscount,
      final_amount: Number(order.final_amount || order.total_amount || 0),
      payment_method: latestPayment?.payment_method?.name || 'N/A',
      amount_paid: Number(latestPayment?.amount_paid || 0),
      change_amount: Number(latestPayment?.change_amount || 0),
      payment_time: new Date(
        latestPayment?.payment_time || latestPayment?.created_at || new Date(),
      ),
      payment_status: latestPayment?.status || 'PENDING',
    };

    return invoiceData;
  }

  /**
   * Tạo HTML hóa đơn từ template
   */
  generateInvoiceHTML(invoiceData: InvoiceData): string {
    const template = this.getInvoiceTemplate();
    const compiledTemplate = Handlebars.compile(template);

    // Helper functions cho Handlebars
    Handlebars.registerHelper('formatCurrency', (amount: number) => {
      return new Intl.NumberFormat('vi-VN', {
        style: 'currency',
        currency: 'VND',
      }).format(amount);
    });

    Handlebars.registerHelper('formatDate', (date: Date) => {
      return new Intl.DateTimeFormat('vi-VN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
      }).format(new Date(date));
    });

    Handlebars.registerHelper('eq', (a: any, b: any) => {
      return a === b;
    });

    return compiledTemplate(invoiceData);
  }

  /**
   * Xuất hóa đơn dưới dạng PDF
   */
  async generateInvoicePDF(orderId: number): Promise<Buffer> {
    const invoiceData = await this.getInvoiceData(orderId);
    const html = this.generateInvoiceHTML(invoiceData);

    const browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
    });

    try {
      const page = await browser.newPage();
      await page.setContent(html, { waitUntil: 'networkidle0' });

      const pdf = await page.pdf({
        format: 'A4',
        printBackground: true,
        margin: {
          top: '20px',
          right: '20px',
          bottom: '20px',
          left: '20px',
        },
      });

      return Buffer.from(pdf);
    } finally {
      await browser.close();
    }
  }

  /**
   * Template HTML cho hóa đơn
   */
  private getInvoiceTemplate(): string {
    return `
<!DOCTYPE html>
<html lang="vi">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Hóa đơn #{{order_id}}</title>
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    
    body {
      font-family: 'Arial', sans-serif;
      font-size: 14px;
      line-height: 1.6;
      color: #333;
      background-color: #fff;
    }
    
    .invoice-container {
      max-width: 800px;
      margin: 0 auto;
      padding: 20px;
      background: white;
    }
    
    .invoice-header {
      text-align: center;
      margin-bottom: 30px;
      border-bottom: 2px solid #4A5568;
      padding-bottom: 20px;
    }
    
    .store-logo {
      font-size: 28px;
      font-weight: bold;
      color: #2D3748;
      margin-bottom: 10px;
    }
    
    .store-info {
      font-size: 12px;
      color: #666;
      margin-bottom: 10px;
    }
    
    .invoice-title {
      font-size: 24px;
      font-weight: bold;
      color: #2D3748;
      margin-top: 15px;
    }
    
    .invoice-details {
      display: flex;
      justify-content: space-between;
      margin: 20px 0;
      gap: 40px;
    }
    
    .customer-info, .order-info {
      flex: 1;
    }
    
    .info-section h3 {
      font-size: 16px;
      font-weight: bold;
      color: #2D3748;
      margin-bottom: 10px;
      border-bottom: 1px solid #E2E8F0;
      padding-bottom: 5px;
    }
    
    .info-item {
      margin-bottom: 5px;
      display: flex;
    }
    
    .info-label {
      font-weight: bold;
      min-width: 120px;
      color: #4A5568;
    }
    
    .info-value {
      color: #2D3748;
    }
    
    .items-table {
      width: 100%;
      border-collapse: collapse;
      margin: 20px 0;
      border: 1px solid #E2E8F0;
    }
    
    .items-table th {
      background-color: #F7FAFC;
      color: #2D3748;
      font-weight: bold;
      padding: 12px 8px;
      text-align: left;
      border-bottom: 2px solid #E2E8F0;
    }
    
    .items-table td {
      padding: 10px 8px;
      border-bottom: 1px solid #E2E8F0;
    }
    
    .items-table .text-right {
      text-align: right;
    }
    
    .items-table .text-center {
      text-align: center;
    }
    
    .items-table tbody tr:nth-child(even) {
      background-color: #F9F9F9;
    }
    
    .totals-section {
      margin-top: 20px;
      display: flex;
      justify-content: flex-end;
    }
    
    .totals-table {
      min-width: 300px;
    }
    
    .total-row {
      display: flex;
      justify-content: space-between;
      padding: 5px 0;
      border-bottom: 1px solid #E2E8F0;
    }
    
    .total-row.final {
      font-weight: bold;
      font-size: 16px;
      color: #2D3748;
      border-bottom: 2px solid #4A5568;
      margin-top: 10px;
      padding-top: 10px;
    }
    
    .payment-info {
      margin-top: 30px;
      padding: 20px;
      background-color: #F7FAFC;
      border-radius: 8px;
      border-left: 4px solid #4299E1;
    }
    
    .payment-info h3 {
      color: #2D3748;
      margin-bottom: 15px;
      font-size: 16px;
    }
    
    .payment-details {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 15px;
    }
    
    .payment-item {
      display: flex;
      justify-content: space-between;
    }
    
    .payment-label {
      font-weight: bold;
      color: #4A5568;
    }
    
    .payment-value {
      color: #2D3748;
    }
    
    .status-PAID {
      color: #38A169;
      font-weight: bold;
    }
    
    .status-PENDING {
      color: #D69E2E;
      font-weight: bold;
    }
    
    .status-CANCELLED {
      color: #E53E3E;
      font-weight: bold;
    }
    
    .status-PROCESSING {
      color: #3182CE;
      font-weight: bold;
    }
    
    .footer {
      margin-top: 40px;
      text-align: center;
      padding-top: 20px;
      border-top: 1px solid #E2E8F0;
      color: #666;
      font-size: 12px;
    }
    
    .thank-you {
      font-size: 16px;
      font-weight: bold;
      color: #2D3748;
      margin-bottom: 10px;
    }
    
    @media print {
      body {
        font-size: 12px;
      }
      
      .invoice-container {
        padding: 10px;
      }
      
      .invoice-header {
        margin-bottom: 20px;
      }
    }
  </style>
</head>
<body>
  <div class="invoice-container">
    <!-- Header -->
    <div class="invoice-header">
      <div class="store-logo">{{store_name}}</div>
      <div class="store-info">
        <div>{{store_address}}</div>
        <div>Điện thoại: {{store_phone}}</div>
      </div>
      <div class="invoice-title">HÓA ĐƠN BÁN HÀNG</div>
      <div style="font-size: 14px; color: #666; margin-top: 5px;">
        Số: #{{order_id}} | Ngày: {{formatDate order_time}}
      </div>
    </div>

    <!-- Invoice Details -->
    <div class="invoice-details">
      <div class="customer-info info-section">
        <h3>Thông tin khách hàng</h3>
        <div class="info-item">
          <span class="info-label">Tên khách hàng:</span>
          <span class="info-value">{{customer_name}}</span>
        </div>
        {{#if customer_phone}}
        <div class="info-item">
          <span class="info-label">Số điện thoại:</span>
          <span class="info-value">{{customer_phone}}</span>
        </div>
        {{/if}}
      </div>
      
      <div class="order-info info-section">
        <h3>Thông tin đơn hàng</h3>
        <div class="info-item">
          <span class="info-label">Nhân viên:</span>
          <span class="info-value">{{employee_name}}</span>
        </div>
        <div class="info-item">
          <span class="info-label">Thời gian:</span>
          <span class="info-value">{{formatDate order_time}}</span>
        </div>
      </div>
    </div>

    <!-- Items Table -->
    <table class="items-table">
      <thead>
        <tr>
          <th style="width: 50%;">Sản phẩm</th>
          <th style="width: 15%;" class="text-center">Số lượng</th>
          <th style="width: 17.5%;" class="text-right">Đơn giá</th>
          <th style="width: 17.5%;" class="text-right">Thành tiền</th>
        </tr>
      </thead>
      <tbody>
        {{#each items}}
        <tr>
          <td>{{product_name}}</td>
          <td class="text-center">{{quantity}}</td>
          <td class="text-right">{{formatCurrency unit_price}}</td>
          <td class="text-right">{{formatCurrency total_price}}</td>
        </tr>
        {{/each}}
      </tbody>
    </table>

    <!-- Totals -->
    <div class="totals-section">
      <div class="totals-table">
        <div class="total-row">
          <span>Tạm tính:</span>
          <span>{{formatCurrency subtotal}}</span>
        </div>
        {{#if discount_amount}}
        <div class="total-row">
          <span>Giảm giá:</span>
          <span>-{{formatCurrency discount_amount}}</span>
        </div>
        {{/if}}
        <div class="total-row final">
          <span>Tổng tiền:</span>
          <span>{{formatCurrency final_amount}}</span>
        </div>
      </div>
    </div>

    <!-- Payment Info -->
    <div class="payment-info">
      <h3>Thông tin thanh toán</h3>
      <div class="payment-details">
        <div class="payment-item">
          <span class="payment-label">Phương thức:</span>
          <span class="payment-value">{{payment_method}}</span>
        </div>
        <div class="payment-item">
          <span class="payment-label">Trạng thái:</span>
          <span class="payment-value status-{{payment_status}}">
            {{#if (eq payment_status 'PAID')}}Đã thanh toán{{/if}}
            {{#if (eq payment_status 'PENDING')}}Chờ thanh toán{{/if}}
            {{#if (eq payment_status 'CANCELLED')}}Đã hủy{{/if}}
            {{#if (eq payment_status 'PROCESSING')}}Đang xử lý{{/if}}
          </span>
        </div>
        <div class="payment-item">
          <span class="payment-label">Số tiền nhận:</span>
          <span class="payment-value">{{formatCurrency amount_paid}}</span>
        </div>
        {{#if change_amount}}
        <div class="payment-item">
          <span class="payment-label">Tiền thối:</span>
          <span class="payment-value">{{formatCurrency change_amount}}</span>
        </div>
        {{/if}}
      </div>
    </div>

    <!-- Footer -->
    <div class="footer">
      <div class="thank-you">Cảm ơn quý khách đã sử dụng dịch vụ!</div>
      <div>Hóa đơn được in tự động bởi hệ thống Cake POS</div>
    </div>
  </div>
</body>
</html>
    `;
  }
}
