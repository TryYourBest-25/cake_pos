# Hệ thống Authentication & Authorization

## Tổng quan

Hệ thống authentication và authorization cho ứng dụng Cake POS sử dụng JWT (JSON Web Tokens) và role-based access control (RBAC).

## Cấu trúc

```
auth/
├── decorators/           # Custom decorators
│   ├── current-user.decorator.ts
│   └── roles.decorator.ts
├── dto/                  # Data Transfer Objects
│   ├── login.dto.ts
│   └── register.dto.ts
├── filters/              # Exception filters
│   └── auth-exception.filter.ts
├── guards/               # Guards cho authentication/authorization
│   ├── jwt-auth.guard.ts
│   └── roles.guard.ts
├── interfaces/           # TypeScript interfaces
│   └── jwt-payload.interface.ts
├── middleware/           # Middleware
│   └── auth-logger.middleware.ts
├── strategies/           # Passport strategies
│   └── jwt.strategy.ts
├── auth.controller.ts    # Controller cho auth endpoints
├── auth.module.ts        # Auth module
├── auth.service.ts       # Service chính cho authentication
└── auth-token.service.ts # Service cho token management
```

## Cấu hình

### Biến môi trường

Thêm các biến sau vào file `.env`:

```env
JWT_SECRET=your-super-secret-jwt-key-here
JWT_EXPIRES_IN=24h
```

### Import AuthModule

Thêm `AuthModule` vào `AppModule`:

```typescript
import { AuthModule } from './auth/auth.module';

@Module({
  imports: [
    // ... other modules
    AuthModule,
  ],
})
export class AppModule {}
```

## Sử dụng

### 1. Authentication Endpoints

#### Đăng ký
```http
POST /auth/register
Content-Type: application/json

{
  "username": "admin",
  "password": "password123",
  "role_id": 1
}
```

#### Đăng nhập
```http
POST /auth/login
Content-Type: application/json

{
  "username": "admin",
  "password": "password123"
}
```

#### Lấy thông tin profile
```http
GET /auth/profile
Authorization: Bearer <access_token>
```

#### Refresh token
```http
POST /auth/refresh
Content-Type: application/json

{
  "refresh_token": "<refresh_token>"
}
```

#### Đăng xuất
```http
POST /auth/logout
Authorization: Bearer <access_token>
```

### 2. Bảo vệ Routes

#### Sử dụng JWT Guard
```typescript
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('customers')
@UseGuards(JwtAuthGuard)
export class CustomerController {
  // Tất cả endpoints cần authentication
}
```

#### Sử dụng Role-based Authorization
```typescript
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@Controller('customers')
@UseGuards(JwtAuthGuard, RolesGuard)
export class CustomerController {
  
  @Post()
  @Roles('admin', 'manager', 'employee')
  async create(@Body() dto: CreateCustomerDto) {
    // Chỉ admin, manager, employee mới có thể tạo customer
  }

  @Delete(':id')
  @Roles('admin', 'manager')
  async remove(@Param('id') id: number) {
    // Chỉ admin và manager mới có thể xóa customer
  }
}
```

### 3. Lấy thông tin User hiện tại

```typescript
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@Controller('customers')
@UseGuards(JwtAuthGuard)
export class CustomerController {
  
  @Get()
  async findAll(@CurrentUser() user: any) {
    console.log('Current user:', user);
    // user object chứa: account_id, username, role_id, role_name, is_active
    return this.customerService.findAll();
  }
}
```

## Cấu trúc User Object

Khi sử dụng `@CurrentUser()` decorator, bạn sẽ nhận được object với cấu trúc:

```typescript
{
  account_id: number;
  username: string;
  role_id: number;
  role_name: string;
  is_active: boolean;
  is_locked: boolean;
}
```

## Roles mặc định

Hệ thống hỗ trợ các roles sau:
- `admin`: Quyền cao nhất
- `manager`: Quản lý cửa hàng
- `employee`: Nhân viên
- `customer`: Khách hàng

## Xử lý lỗi

Hệ thống sử dụng `AuthExceptionFilter` để xử lý các lỗi authentication một cách thống nhất:

- `401 Unauthorized`: Token không hợp lệ hoặc hết hạn
- `403 Forbidden`: Không có quyền truy cập

## Bảo mật

- Passwords được hash bằng bcrypt với salt rounds = 12
- JWT tokens có thời gian hết hạn
- Refresh tokens được lưu trong database
- Hỗ trợ revoke tokens
- Logging các request authentication

## Ví dụ sử dụng hoàn chỉnh

```typescript
import { Controller, Get, Post, UseGuards, Body } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@Controller('orders')
@UseGuards(JwtAuthGuard, RolesGuard)
export class OrderController {
  
  @Get()
  @Roles('admin', 'manager', 'employee')
  async findAll(@CurrentUser() user: any) {
    // Tất cả nhân viên có thể xem orders
    return this.orderService.findAll();
  }

  @Post()
  @Roles('admin', 'manager', 'employee')
  async create(@Body() dto: CreateOrderDto, @CurrentUser() user: any) {
    // Thêm thông tin user vào order
    return this.orderService.create({
      ...dto,
      created_by: user.account_id,
    });
  }

  @Delete(':id')
  @Roles('admin', 'manager')
  async remove(@Param('id') id: number, @CurrentUser() user: any) {
    // Chỉ admin và manager mới có thể xóa orders
    return this.orderService.remove(id);
  }
}
``` 