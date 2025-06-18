import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { StoreService } from '../store/store.service';
import * as Handlebars from 'handlebars';
import * as puppeteer from 'puppeteer';
import * as fs from 'fs';
import * as path from 'path';

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

@Injectable()
export class InvoiceService {
  private templatePath: string;

  constructor(
    private prisma: PrismaService,
    private storeService: StoreService,
  ) {
    this.templatePath = path.join(__dirname, 'templates', 'invoice.hbs');
    this.setupHandlebarsHelpers();
  }

  /**
   * Setup Handlebars helpers
   */
  private setupHandlebarsHelpers(): void {
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

    Handlebars.registerHelper('increment', (value: number) => {
      return value + 1;
    });
  }

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
            product_price: {
              include: {
                product: true,
                product_size: true,
              },
            },
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

    // Lấy thông tin cửa hàng
    const storeInfo = await this.storeService.getDefaultStore();

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
      customer_name: order.customer ? `${order.customer.first_name || ''} ${order.customer.last_name || ''}`.trim() || 'Khách vãng lai' : 'Khách vãng lai',
      customer_phone: order.customer?.phone || '',
      employee_name: order.employee ? `${order.employee.first_name || ''} ${order.employee.last_name || ''}`.trim() || order.employee.account?.username || 'N/A' : 'N/A',
      store_name: storeInfo?.name || 'Cake POS Store',
      store_address: storeInfo?.address || '123 Đường ABC, Quận XYZ, TP.HCM',
      store_phone: storeInfo?.phone || '0123 456 789',
      store_email: storeInfo?.email || 'info@cakepos.vn',
      store_tax_code: storeInfo?.tax_code || '0123456789',
      items: (order.order_product || []).map((op: any) => ({
        product_name: op.product_price?.product?.name || 'N/A',
        quantity: op.quantity || 0,
        unit_price: Number(op.product_price?.price || 0),
        total_price: Number(op.product_price?.price || 0) * (op.quantity || 0),
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
      print_time: new Intl.DateTimeFormat('vi-VN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
      }).format(new Date()),
    };

    return invoiceData;
  }

  /**
   * Tạo HTML hóa đơn từ template
   */
  generateInvoiceHTML(invoiceData: InvoiceData): string {
    const template = this.getInvoiceTemplate();
    const compiledTemplate = Handlebars.compile(template);
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
   * Đọc template HTML từ file
   */
  private getInvoiceTemplate(): string {
    try {
      return fs.readFileSync(this.templatePath, 'utf8');
    } catch (error) {
      throw new NotFoundException(
        `Không thể đọc template hóa đơn: ${error.message}`,
      );
    }
  }
} 