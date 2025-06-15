# Module Báo Cáo Bán Hàng (Reports)

## Tổng Quan
Module báo cáo cung cấp các API để truy vấn dữ liệu bán hàng theo tháng, năm và nhân viên. Dữ liệu được thiết kế phù hợp để tạo các loại biểu đồ khác nhau như:
- **Biểu đồ cột (Bar Chart)**: Hiển thị doanh thu theo tháng, theo nhân viên
- **Biểu đồ đường (Line Chart)**: Hiển thị xu hướng bán hàng theo thời gian
- **Biểu đồ tròn (Pie Chart)**: Hiển thị tỷ lệ đóng góp của từng nhân viên hoặc sản phẩm

## Endpoints

### 1. Báo cáo bán hàng tổng quát
```
GET /reports/sales
```
**Query Parameters:**
- `month` (optional): Tháng báo cáo (1-12)
- `year` (optional): Năm báo cáo (mặc định: năm hiện tại)
- `employee_id` (optional): ID nhân viên cụ thể

**Phân quyền:** MANAGER, STAFF

**Ví dụ:**
```bash
# Báo cáo tháng 12/2024
GET /reports/sales?month=12&year=2024

# Báo cáo cả năm 2024
GET /reports/sales?year=2024

# Báo cáo của nhân viên ID=1 trong tháng 12/2024
GET /reports/sales?month=12&year=2024&employee_id=1
```

### 2. Báo cáo theo tháng (để tạo biểu đồ cột/đường)
```
GET /reports/sales/monthly
```
Trả về dữ liệu bán hàng của 12 tháng trong năm, phù hợp cho biểu đồ xu hướng.

**Phân quyền:** MANAGER, STAFF

### 3. Báo cáo theo ngày (để tạo biểu đồ đường chi tiết)
```
GET /reports/sales/daily
```
Trả về dữ liệu bán hàng theo từng ngày trong tháng.

**Query Parameters:**
- `month`: Tháng cần báo cáo (bắt buộc)
- `year` (optional): Năm (mặc định: năm hiện tại)

**Phân quyền:** MANAGER, STAFF

### 4. Báo cáo hiệu suất nhân viên (để tạo biểu đồ cột/tròn)
```
GET /reports/sales/employee
```
Trả về dữ liệu hiệu suất bán hàng của từng nhân viên.

**Phân quyền:** MANAGER (chỉ manager mới được xem)

### 5. Báo cáo sản phẩm bán chạy (để tạo biểu đồ cột/tròn)
```
GET /reports/sales/products
```
Trả về danh sách sản phẩm bán chạy nhất.

**Phân quyền:** MANAGER, STAFF

## Cấu trúc Response

```typescript
{
  "summary": {
    "total_orders": 150,           // Tổng số đơn hàng
    "total_revenue": 25000000,     // Tổng doanh thu (VND)
    "total_products_sold": 800,    // Tổng số sản phẩm đã bán
    "period": "Tháng 12/2024"      // Kỳ báo cáo
  },
  "employee_sales": [              // Dữ liệu cho biểu đồ nhân viên
    {
      "employee_id": 1,
      "employee_name": "Nguyễn Văn A",
      "total_orders": 25,
      "total_revenue": 5000000,
      "total_products_sold": 150
    }
  ],
  "monthly_sales": [               // Dữ liệu cho biểu đồ theo tháng
    {
      "month": 1,
      "year": 2024,
      "total_orders": 120,
      "total_revenue": 18000000,
      "total_products_sold": 600
    }
  ],
  "daily_sales": [                 // Dữ liệu cho biểu đồ theo ngày
    {
      "day": 1,
      "month": 12,
      "year": 2024,
      "total_orders": 8,
      "total_revenue": 1200000,
      "total_products_sold": 45
    }
  ],
  "product_sales": [               // Dữ liệu sản phẩm bán chạy
    {
      "product_id": 1,
      "product_name": "Bánh kem chocolate",
      "quantity_sold": 50,
      "revenue": 2500000
    }
  ]
}
```

## Gợi ý sử dụng cho Frontend

### Biểu đồ cột doanh thu theo tháng
```javascript
// Sử dụng data từ monthly_sales
const chartData = response.monthly_sales.map(item => ({
  month: `Tháng ${item.month}`,
  revenue: item.total_revenue
}));
```

### Biểu đồ tròn hiệu suất nhân viên
```javascript
// Sử dụng data từ employee_sales
const pieData = response.employee_sales.map(item => ({
  name: item.employee_name,
  value: item.total_revenue
}));
```

### Biểu đồ đường xu hướng theo ngày
```javascript
// Sử dụng data từ daily_sales
const lineData = response.daily_sales.map(item => ({
  date: `${item.day}/${item.month}`,
  orders: item.total_orders,
  revenue: item.total_revenue
}));
```

## Lưu ý
- Tất cả dữ liệu chỉ tính các đơn hàng có trạng thái `COMPLETED`
- Doanh thu được tính bằng VND (đơn vị: đồng)
- API có phân quyền theo role: MANAGER có quyền cao nhất, STAFF có quyền hạn chế
- Dữ liệu được sắp xếp theo thứ tự phù hợp cho việc hiển thị biểu đồ 