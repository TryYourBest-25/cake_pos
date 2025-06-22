# Sơ đồ Kiến trúc C4 - Hệ thống Cake POS

## 1. Context Level - Tổng quan Hệ thống

```mermaid
graph TB
    subgraph external [" "]
        Manager["👤<br/>Quản lý<br/><small>- Quản lý nhân viên, sản phẩm<br/>- Xem báo cáo, doanh thu<br/>- Quản lý khuyến mãi</small>"]
        Employee["👤<br/>Nhân viên<br/><small>- Xử lý đơn hàng<br/>- Thu ngân, thanh toán<br/>- Tư vấn khách hàng</small>"]
        Customer["👤<br/>Khách hàng<br/><small>- Đặt hàng tại quầy<br/>- Thanh toán trực tiếp<br/>- Tích điểm thành viên</small>"]
    end
    
    subgraph system ["Hệ thống Cake POS"]
        CakePOS["🏪<br/>Cake POS System<br/><small>Hệ thống quản lý bán hàng<br/>cho tiệm bánh kem</small>"]
    end
    
    subgraph externalsystems [" "]
        VNPay["💳<br/>VNPay<br/><small>Cổng thanh toán trực tuyến</small>"]
        Firebase["☁️<br/>Firebase Storage<br/><small>Dịch vụ lưu trữ ảnh</small>"]
    end
    
    Manager -->|"Quản lý hệ thống"| CakePOS
    Employee -->|"Xử lý bán hàng"| CakePOS
    Customer -->|"Mua hàng"| CakePOS
    
    CakePOS -->|"Xử lý thanh toán"| VNPay
    CakePOS -->|"Lưu trữ ảnh"| Firebase
    VNPay -->|"Thanh toán QR/Thẻ"| Customer
```

## 2. Container Level - Chi tiết Thành phần

```mermaid
graph TB
    subgraph users [" "]
        Manager["👤<br/>Quản lý"]
        Employee["👤<br/>Nhân viên"]
        Customer["👤<br/>Khách hàng"]
    end
    
    subgraph cakepos ["Hệ thống Cake POS"]
        ManagerApp["💻<br/>Manager Web App<br/><small>Next.js + TypeScript</small>"]
        POSApp["🖥️<br/>POS Web App<br/><small>Next.js + TypeScript</small>"]
        APIGateway["🔧<br/>Backend API<br/><small>NestJS + TypeScript</small>"]
        Database["🗄️<br/>PostgreSQL Database<br/><small>Prisma ORM</small>"]
    end
    
    subgraph external [" "]
        VNPay["💳<br/>VNPay Gateway"]
        Firebase["☁️<br/>Firebase Storage"]
    end
    
    Manager --> ManagerApp
    Employee --> POSApp
    Customer --> VNPay
    
    ManagerApp --> APIGateway
    POSApp --> APIGateway
    
    APIGateway --> Database
    APIGateway --> VNPay
    APIGateway --> Firebase
    
    VNPay --> APIGateway
```

## 3. Component Level - Chi tiết Backend API

```mermaid
graph TB
    subgraph frontend ["Frontend Applications"]
        ManagerApp["💻<br/>Manager Web App"]
        POSApp["🖥️<br/>POS Web App"]
    end
    
    subgraph api ["Backend API (NestJS)"]
        subgraph controllers ["Controllers"]
            AuthController["🔐<br/>Auth Controller"]
            OrderController["📋<br/>Order Controller"]
            ProductController["🧁<br/>Product Controller"]
            PaymentController["💰<br/>Payment Controller"]
            UserController["👥<br/>User Controller"]
            ReportController["📊<br/>Report Controller"]
        end
        
        subgraph services ["Services"]
            AuthService["🔐<br/>Auth Service"]
            OrderService["📋<br/>Order Service"]
            ProductService["🧁<br/>Product Service"]
            PaymentService["💰<br/>Payment Service"]
            UserService["👥<br/>User Service"]
            VNPayService["💳<br/>VNPay Service"]
            FirebaseService["☁️<br/>Firebase Service"]
        end
        
        subgraph data ["Data Layer"]
            PrismaService["🗄️<br/>Prisma Service"]
        end
    end
    
    subgraph external ["External Services"]
        Database["🗄️<br/>PostgreSQL"]
        VNPay["💳<br/>VNPay API"]
        Firebase["☁️<br/>Firebase Storage"]
    end
    
    ManagerApp --> AuthController
    ManagerApp --> ProductController
    ManagerApp --> UserController
    ManagerApp --> ReportController
    
    POSApp --> AuthController
    POSApp --> OrderController
    POSApp --> PaymentController
    POSApp --> ProductController
    
    AuthController --> AuthService
    OrderController --> OrderService
    ProductController --> ProductService
    PaymentController --> PaymentService
    PaymentController --> VNPayService
    UserController --> UserService
    ReportController --> OrderService
    ProductController --> FirebaseService
    
    AuthService --> PrismaService
    OrderService --> PrismaService
    ProductService --> PrismaService
    PaymentService --> PrismaService
    UserService --> PrismaService
    
    PrismaService --> Database
    
    VNPayService --> VNPay
    FirebaseService --> Firebase
    VNPay --> PaymentController
```

## 4. Database Schema

```mermaid
erDiagram
    ROLE {
        int role_id PK
        string name
        string description
    }
    
    ACCOUNT {
        int account_id PK
        int role_id FK
        string username
        string password_hash
        boolean is_active
    }
    
    MANAGER {
        int manager_id PK
        int account_id FK
        string last_name
        string first_name
        string phone
        string email
    }
    
    EMPLOYEE {
        int employee_id PK
        int account_id FK
        string position
        string last_name
        string first_name
        string phone
        string email
    }
    
    CUSTOMER {
        int customer_id PK
        int membership_type_id FK
        int account_id FK
        string last_name
        string first_name
        string phone
        int current_points
    }
    
    MEMBERSHIP_TYPE {
        int membership_type_id PK
        string type
        decimal discount_value
        int required_point
    }
    
    CATEGORY {
        int category_id PK
        string name
        string description
    }
    
    PRODUCT {
        int product_id PK
        int category_id FK
        string name
        string description
        boolean is_signature
        string image_path
    }
    
    PRODUCT_SIZE {
        int size_id PK
        string name
        string unit
        int quantity
    }
    
    PRODUCT_PRICE {
        int product_price_id PK
        int product_id FK
        int size_id FK
        int price
        boolean is_active
    }
    
    ORDER {
        int order_id PK
        int customer_id FK
        int employee_id FK
        timestamp order_time
        int total_amount
        int final_amount
        string status
    }
    
    ORDER_PRODUCT {
        int order_product_id PK
        int order_id FK
        int product_price_id FK
        int quantity
        string option
    }
    
    DISCOUNT {
        int discount_id PK
        string name
        string coupon_code
        decimal discount_value
        int min_required_order_value
        int max_discount_amount
        boolean is_active
    }
    
    ORDER_DISCOUNT {
        int order_discount_id PK
        int order_id FK
        int discount_id FK
        int discount_amount
    }
    
    PAYMENT_METHOD {
        int payment_method_id PK
        string name
        string description
    }
    
    PAYMENT {
        int payment_id PK
        int order_id FK
        int payment_method_id FK
        string status
        decimal amount_paid
        decimal change_amount
    }
    
    STORE {
        int store_id PK
        string name
        string address
        string phone
        string email
        string tax_code
    }
    
    ROLE ||--o{ ACCOUNT : "có"
    ACCOUNT ||--o| MANAGER : "thuộc về"
    ACCOUNT ||--o| EMPLOYEE : "thuộc về"
    ACCOUNT ||--o| CUSTOMER : "thuộc về"
    MEMBERSHIP_TYPE ||--o{ CUSTOMER : "có"
    CATEGORY ||--o{ PRODUCT : "chứa"
    PRODUCT ||--o{ PRODUCT_PRICE : "có"
    PRODUCT_SIZE ||--o{ PRODUCT_PRICE : "áp dụng"
    CUSTOMER ||--o{ ORDER : "đặt"
    EMPLOYEE ||--o{ ORDER : "xử lý"
    ORDER ||--o{ ORDER_PRODUCT : "chứa"
    PRODUCT_PRICE ||--o{ ORDER_PRODUCT : "trong"
    ORDER ||--o{ ORDER_DISCOUNT : "áp dụng"
    DISCOUNT ||--o{ ORDER_DISCOUNT : "được sử dụng"
    ORDER ||--o{ PAYMENT : "có"
    PAYMENT_METHOD ||--o{ PAYMENT : "sử dụng"
```

## Tổng kết

### Công nghệ sử dụng:
- **Frontend**: Next.js 15 + TypeScript + Shadcn/UI
- **Backend**: NestJS + TypeScript + Prisma ORM  
- **Database**: PostgreSQL
- **External**: VNPay + Firebase Storage

### Ưu điểm:
- **Modular**: Tách biệt rõ ràng các thành phần
- **Type Safety**: TypeScript end-to-end
- **Scalable**: Có thể mở rộng dễ dàng
- **Secure**: JWT + Role-based authentication
- **Performance**: Database indexing + caching

### Workflow chính:
1. **Đăng nhập** → **Chọn sản phẩm** → **Thanh toán** → **In hóa đơn**
2. **Dashboard** → **Quản lý** → **Báo cáo** → **Cấu hình** 