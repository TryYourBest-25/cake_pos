# Hệ thống Phân quyền (Authorization)

## Roles và Hierarchy

### 📋 Roles trong hệ thống:
1. **MANAGER** - Quản lý cửa hàng
2. **STAFF** - Nhân viên 
3. **CUSTOMER** - Khách hàng

### 🔄 Role Hierarchy:
- **MANAGER** có thể thực hiện tất cả hành động của STAFF và CUSTOMER
- **STAFF** có thể thực hiện tất cả hành động của CUSTOMER
- **CUSTOMER** chỉ có thể thực hiện hành động của chính mình

## Phân quyền theo Module

### 🗂️ Categories (Danh mục sản phẩm)
| Endpoint | Method | MANAGER | STAFF | CUSTOMER |
|----------|--------|---------|-------|----------|
| `GET /categories` | Xem danh sách | ✅ | ✅ | ✅ |
| `GET /categories/:id` | Xem chi tiết | ✅ | ✅ | ✅ |
| `POST /categories` | Tạo mới | ✅ | ✅ | ❌ |
| `PATCH /categories/:id` | Cập nhật | ✅ | ✅ | ❌ |
| `DELETE /categories/:id` | Xóa | ✅ | ❌ | ❌ |
| `GET /categories/admin/test` | Test | ✅ | ❌ | ❌ |

### 💳 Payments (Thanh toán)
| Endpoint | Method | MANAGER | STAFF | CUSTOMER |
|----------|--------|---------|-------|----------|
| `GET /payments` | Xem danh sách | ✅ | ✅ | ❌ |
| `GET /payments/:id` | Xem chi tiết | ✅ | ✅ | ❌ |
| `POST /payments` | Tạo payment | ✅ | ✅ | ❌ |
| `PATCH /payments/:id` | Cập nhật | ✅ | ✅ | ❌ |
| `DELETE /payments/:id` | Xóa | ✅ | ❌ | ❌ |
| `POST /payments/vnpay/create` | Tạo VNPay URL | ✅ | ✅ | ✅ |
| `GET /payments/vnpay/callback` | VNPay callback | Public (không cần auth) |
| `POST /payments/vnpay/webhook` | VNPay webhook | Public (không cần auth) |
| `GET /payments/admin/test` | Test | ✅ | ❌ | ❌ |

### 🔐 Authentication
| Endpoint | Method | Public | Authenticated |
|----------|--------|--------|---------------|
| `POST /auth/login` | Đăng nhập | ✅ | - |
| `POST /auth/register` | Đăng ký | ✅ | - |
| `POST /auth/logout` | Đăng xuất | - | ✅ |
| `GET /auth/profile` | Thông tin user | - | ✅ |
| `POST /auth/refresh` | Refresh token | Public | - |
| `GET /auth/test` | Test | ✅ | - |

## Cách sử dụng

### 1. Trong Controller:
```typescript
@Controller('categories')
@ApiBearerAuth()
export class CategoryController {
  
  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(ROLES.MANAGER, ROLES.STAFF)
  async create() {
    // Chỉ MANAGER và STAFF mới truy cập được
  }
  
  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(ROLES.MANAGER, ROLES.STAFF, ROLES.CUSTOMER)
  async findAll() {
    // Tất cả authenticated users đều truy cập được
  }
  
  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(ROLES.MANAGER)
  async remove() {
    // Chỉ MANAGER mới truy cập được
  }
}
```

### 2. Guards:
- **JwtAuthGuard**: Kiểm tra JWT token hợp lệ
- **RolesGuard**: Kiểm tra user có role phù hợp không

### 3. Decorators:
- **@Roles()**: Khai báo roles được phép truy cập
- **@ApiBearerAuth()**: Swagger documentation cho authentication

## Response Codes

### 🔒 Authorization Responses:
- **200/201**: Thành công
- **401 Unauthorized**: Không có token hoặc token không hợp lệ
- **403 Forbidden**: Có token hợp lệ nhưng không đủ quyền
- **404 Not Found**: Resource không tồn tại

## Security Notes

### ✅ Best Practices:
1. **Principle of Least Privilege**: Chỉ cấp quyền tối thiểu cần thiết
2. **Role Hierarchy**: MANAGER > STAFF > CUSTOMER
3. **Public Endpoints**: Chỉ những endpoint thực sự cần thiết (VNPay callbacks, login, register)
4. **JWT Token**: Sử dụng JWT với expiration time
5. **Refresh Token**: Lưu trong HTTP-only cookie

### ⚠️ Lưu ý:
- **VNPay endpoints**: Callback và webhook phải public để VNPay có thể gọi
- **Admin test endpoints**: Chỉ MANAGER mới truy cập được
- **Database roles**: Role names phải khớp với database
- **Error handling**: Không leak thông tin sensitive trong error messages

## Database Schema

### Role Table (Ví dụ):
```sql
-- Đảm bảo có đúng roles trong database
INSERT INTO role (name, description) VALUES 
('MANAGER', 'Quản lý cửa hàng'),
('STAFF', 'Nhân viên bán hàng'),
('CUSTOMER', 'Khách hàng');
``` 