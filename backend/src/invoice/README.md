# Invoice System Documentation

## Tổng quan

Hệ thống hóa đơn tự động cho Cake POS System, hỗ trợ tạo hóa đơn HTML và PDF khi thanh toán hoàn tất.

## Tính năng

### 1. Tự động tạo hóa đơn
- Khi thanh toán có trạng thái `PAID`, hệ thống sẽ tự động tạo hóa đơn HTML
- Hỗ trợ cả thanh toán tiền mặt và VNPay
- Log thông báo khi hóa đơn được tạo thành công

### 2. API Endpoints

#### GET `/invoice/:orderId/html`
- **Mô tả**: Lấy hóa đơn dưới dạng HTML
- **Quyền truy cập**: CUSTOMER, STAFF, MANAGER
- **Response**: HTML page với styling đầy đủ

#### GET `/invoice/:orderId/pdf`
- **Mô tả**: Xuất hóa đơn dưới dạng PDF
- **Quyền truy cập**: STAFF, MANAGER
- **Response**: File PDF để download

#### GET `/invoice/:orderId/data`
- **Mô tả**: Lấy dữ liệu JSON của hóa đơn
- **Quyền truy cập**: STAFF, MANAGER
- **Response**: JSON object chứa thông tin hóa đơn

## Cấu trúc dữ liệu

```typescript
interface InvoiceData {
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
```

## Tính năng hóa đơn HTML

### Thiết kế responsive
- Tối ưu cho cả màn hình desktop và mobile
- Hỗ trợ in ấn với `@media print`
- Font và kích thước thích hợp cho in

### Thông tin hiển thị
- **Header**: Logo cửa hàng, địa chỉ, số điện thoại
- **Thông tin đơn hàng**: Số hóa đơn, ngày giờ, nhân viên
- **Thông tin khách hàng**: Tên, số điện thoại (nếu có)
- **Chi tiết sản phẩm**: Bảng với tên, số lượng, đơn giá, thành tiền
- **Tổng tiền**: Tạm tính, giảm giá, tổng cuối
- **Thanh toán**: Phương thức, trạng thái, số tiền nhận, tiền thối
- **Footer**: Lời cảm ơn, thời gian in

### Styling
- Màu sắc: Chủ đạo xanh dương (#4299E1) và xám (#4A5568)
- Typography: Arial font family, kích thước phù hợp
- Layout: Flexbox và Grid cho responsive
- Status colors: 
  - PAID: Xanh lá (#38A169)
  - PENDING: Vàng cam (#D69E2E)  
  - CANCELLED: Đỏ (#E53E3E)
  - PROCESSING: Xanh dương (#3182CE)

## Tích hợp với Payment System

### Thanh toán tiền mặt
```typescript
// Trong PaymentService.create()
if (newPayment.status === payment_status_enum.PAID) {
  // Tự động tạo hóa đơn
}
```

### Thanh toán VNPay
```typescript
// Trong PaymentService.processVNPayCallback()
if (isSuccessful && payment.status === payment_status_enum.PAID) {
  // Tự động tạo hóa đơn
}
```

## Cài đặt dependencies

```bash
pnpm add puppeteer handlebars
```

## Usage Examples

### 1. Lấy hóa đơn HTML
```bash
curl -H "Authorization: Bearer <token>" \
  http://localhost:3000/invoice/123/html
```

### 2. Tải hóa đơn PDF
```bash
curl -H "Authorization: Bearer <token>" \
  -o "hoa-don-123.pdf" \
  http://localhost:3000/invoice/123/pdf
```

### 3. Lấy dữ liệu hóa đơn
```bash
curl -H "Authorization: Bearer <token>" \
  http://localhost:3000/invoice/123/data
```

## Cấu hình store

Hiện tại thông tin cửa hàng được hard-code trong service:
```typescript
store_name: 'Cake POS Store',
store_address: '123 Đường ABC, Quận XYZ, TP.HCM',
store_phone: '0123 456 789',
```

## Tương lai phát triển

1. **Lưu hóa đơn vào database**: Tạo bảng `invoices` để lưu HTML content
2. **Email hóa đơn**: Gửi hóa đơn qua email cho khách hàng
3. **Template customization**: Cho phép tùy chỉnh template hóa đơn
4. **Store configuration**: Lấy thông tin cửa hàng từ database
5. **Barcode/QR code**: Thêm mã vạch cho hóa đơn
6. **Multi-language**: Hỗ trợ đa ngôn ngữ
7. **Webhook notifications**: Thông báo khi hóa đơn được tạo

## Lưu ý kỹ thuật

1. **Puppeteer performance**: Launch browser có thể chậm, cân nhắc dùng browser pool
2. **Memory usage**: PDF generation có thể tốn memory với volume lớn
3. **Error handling**: Đã xử lý lỗi khi không tìm thấy đơn hàng
4. **Security**: Kiểm tra quyền truy cập dựa trên role hierarchy
5. **Type safety**: Sử dụng `any` type cho Prisma relations, có thể cải thiện 