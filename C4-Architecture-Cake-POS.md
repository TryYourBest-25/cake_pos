# Sơ đồ Kiến trúc C4 - Hệ thống Cake POS

## Tổng quan

Tài liệu này mô tả kiến trúc hệ thống Cake POS (Point of Sale) sử dụng mô hình C4 Model. Hệ thống được thiết kế để quản lý bán hàng cho tiệm bánh kem với các tính năng chính:

- **Quản lý sản phẩm và danh mục**
- **Xử lý đơn hàng và thanh toán** 
- **Quản lý nhân viên và khách hàng**
- **Báo cáo doanh thu và thống kê**
- **Tích hợp thanh toán VNPay**
- **Lưu trữ ảnh sản phẩm trên Firebase**

---

## 1. Sơ đồ Context Level - Tổng quan Hệ thống

```mermaid
graph TB
    %% C4 Context Diagram - Hệ thống Cake POS
    
    subgraph external [" "]
        Manager["👤<br/>Quản lý<br/><small>Người quản lý tiệm bánh<br/>- Quản lý nhân viên, sản phẩm<br/>- Xem báo cáo, doanh thu<br/>- Quản lý khuyến mãi</small>"]
        Employee["👤<br/>Nhân viên<br/><small>Nhân viên bán hàng<br/>- Xử lý đơn hàng<br/>- Thu ngân, thanh toán<br/>- Tư vấn khách hàng</small>"]
        Customer["👤<br/>Khách hàng<br/><small>Khách hàng mua bánh<br/>- Đặt hàng tại quầy<br/>- Thanh toán trực tiếp<br/>- Tích điểm thành viên</small>"]
    end
    
    subgraph system ["Hệ thống Cake POS"]
        CakePOS["🏪<br/>Cake POS System<br/><small>Hệ thống quản lý bán hàng<br/>cho tiệm bánh kem<br/>- Quản lý đơn hàng<br/>- Quản lý sản phẩm<br/>- Báo cáo doanh thu</small>"]
    end
    
    subgraph externalsystems [" "]
        VNPay["💳<br/>VNPay<br/><small>Cổng thanh toán trực tuyến<br/>- Xử lý thanh toán thẻ<br/>- Ví điện tử<br/>- Chuyển khoản ngân hàng</small>"]
        Firebase["☁️<br/>Firebase Storage<br/><small>Dịch vụ lưu trữ ảnh<br/>- Lưu ảnh sản phẩm<br/>- CDN toàn cầu<br/>- Tối ưu hiệu năng</small>"]
    end
    
    %% Relationships
    Manager -->|"Quản lý hệ thống<br/>(HTTPS/Web Browser)"| CakePOS
    Employee -->|"Xử lý bán hàng<br/>(HTTPS/Web Browser)"| CakePOS
    Customer -->|"Mua hàng<br/>(Trực tiếp tại quầy)"| CakePOS
    
    CakePOS -->|"Xử lý thanh toán<br/>(HTTPS/API)"| VNPay
    CakePOS -->|"Lưu trữ ảnh<br/>(HTTPS/API)"| Firebase
    VNPay -->|"Thanh toán QR/Thẻ<br/>(Mobile App/Card)"| Customer
    
    %% Styling
    classDef person fill:#08427b,stroke:#052e56,stroke-width:2px,color:#fff
    classDef system fill:#1168bd,stroke:#0b4884,stroke-width:2px,color:#fff
    classDef external fill:#999999,stroke:#666666,stroke-width:2px,color:#fff
    
    class Manager,Employee,Customer person
    class CakePOS system
    class VNPay,Firebase external
```

### Mô tả Context Level:

#### Các Actor (Người dùng):
- **👤 Quản lý**: Chủ tiệm hoặc quản lý cấp cao
- **👤 Nhân viên**: Nhân viên bán hàng tại quầy  
- **👤 Khách hàng**: Người mua bánh kem

#### Hệ thống bên ngoài:
- **💳 VNPay**: Cổng thanh toán trực tuyến
- **☁️ Firebase Storage**: Dịch vụ lưu trữ đám mây

---

## 2. Sơ đồ Container Level - Chi tiết Thành phần

```mermaid
graph TB
    %% C4 Container Diagram - Hệ thống Cake POS
    
    subgraph users [" "]
        Manager["👤<br/>Quản lý<br/><small>Người quản lý tiệm bánh</small>"]
        Employee["👤<br/>Nhân viên<br/><small>Nhân viên bán hàng</small>"]
        Customer["👤<br/>Khách hàng<br/><small>Khách hàng mua bánh</small>"]
    end
    
    subgraph cakepos ["Hệ thống Cake POS"]
        ManagerApp["💻<br/>Manager Web App<br/><small>Next.js + TypeScript<br/>- Dashboard quản lý<br/>- Quản lý sản phẩm<br/>- Báo cáo doanh thu<br/>- Quản lý nhân viên</small>"]
        
        POSApp["🖥️<br/>POS Web App<br/><small>Next.js + TypeScript<br/>- Giao diện bán hàng<br/>- Xử lý đơn hàng<br/>- Thanh toán<br/>- In hóa đơn</small>"]
        
        APIGateway["🔧<br/>Backend API<br/><small>NestJS + TypeScript<br/>- REST API endpoints<br/>- Authentication & Authorization<br/>- Business Logic<br/>- Data validation</small>"]
        
        Database["🗄️<br/>PostgreSQL Database<br/><small>Cơ sở dữ liệu quan hệ<br/>- Lưu trữ dữ liệu<br/>- Prisma ORM<br/>- ACID transactions</small>"]
    end
    
    subgraph external [" "]
        VNPay["💳<br/>VNPay Gateway<br/><small>Cổng thanh toán</small>"]
        Firebase["☁️<br/>Firebase Storage<br/><small>Lưu trữ ảnh sản phẩm</small>"]
    end
    
    %% User interactions
    Manager -->|"Quản lý hệ thống<br/>(HTTPS)"| ManagerApp
    Employee -->|"Xử lý bán hàng<br/>(HTTPS)"| POSApp
    Customer -->|"Thanh toán VNPay<br/>(QR Code/Mobile)"| VNPay
    
    %% Internal system interactions
    ManagerApp -->|"API Calls<br/>(HTTPS/JSON)"| APIGateway
    POSApp -->|"API Calls<br/>(HTTPS/JSON)"| APIGateway
    
    APIGateway -->|"Database Queries<br/>(Prisma ORM)"| Database
    APIGateway -->|"Payment Processing<br/>(HTTPS/API)"| VNPay
    APIGateway -->|"Image Upload/Download<br/>(HTTPS/API)"| Firebase
    
    VNPay -->|"Payment Callback<br/>(HTTPS/Webhook)"| APIGateway
    
    %% Styling
    classDef person fill:#08427b,stroke:#052e56,stroke-width:2px,color:#fff
    classDef webapp fill:#1168bd,stroke:#0b4884,stroke-width:2px,color:#fff
    classDef api fill:#1168bd,stroke:#0b4884,stroke-width:2px,color:#fff
    classDef database fill:#1168bd,stroke:#0b4884,stroke-width:2px,color:#fff
    classDef external fill:#999999,stroke:#666666,stroke-width:2px,color:#fff
    
    class Manager,Employee,Customer person
    class ManagerApp,POSApp webapp
    class APIGateway api
    class Database database
    class VNPay,Firebase external
```

---

## 3. Sơ đồ Component Level - Chi tiết Backend API

```mermaid
graph TB
    %% C4 Component Diagram - Backend API Components
    
    subgraph frontend ["Frontend Applications"]
        ManagerApp["💻<br/>Manager Web App"]
        POSApp["🖥️<br/>POS Web App"]
    end
    
    subgraph api ["Backend API (NestJS)"]
        subgraph controllers ["Controllers Layer"]
            AuthController["🔐<br/>Auth Controller<br/><small>- Login/Logout<br/>- JWT tokens<br/>- Role-based access</small>"]
            OrderController["📋<br/>Order Controller<br/><small>- Tạo đơn hàng<br/>- Cập nhật trạng thái<br/>- Lịch sử đơn hàng</small>"]
            ProductController["🧁<br/>Product Controller<br/><small>- Quản lý sản phẩm<br/>- Categories<br/>- Product sizes</small>"]
            PaymentController["💰<br/>Payment Controller<br/><small>- Thanh toán tiền mặt<br/>- VNPay integration<br/>- Payment methods</small>"]
            UserController["👥<br/>User Controller<br/><small>- Managers<br/>- Employees<br/>- Customers</small>"]
            ReportController["📊<br/>Report Controller<br/><small>- Báo cáo doanh thu<br/>- Thống kê bán hàng<br/>- Performance metrics</small>"]
        end
        
        subgraph services ["Services Layer"]
            AuthService["🔐<br/>Auth Service<br/><small>- JWT generation<br/>- Password hashing<br/>- Role validation</small>"]
            OrderService["📋<br/>Order Service<br/><small>- Business logic<br/>- Order processing<br/>- Discount calculation</small>"]
            ProductService["🧁<br/>Product Service<br/><small>- Product management<br/>- Pricing logic<br/>- Inventory tracking</small>"]
            PaymentService["💰<br/>Payment Service<br/><small>- Payment processing<br/>- VNPay integration<br/>- Invoice generation</small>"]
            UserService["👥<br/>User Service<br/><small>- User management<br/>- Account operations<br/>- Membership handling</small>"]
            VNPayService["💳<br/>VNPay Service<br/><small>- Payment URL creation<br/>- Callback verification<br/>- Transaction status</small>"]
            FirebaseService["☁️<br/>Firebase Service<br/><small>- Image upload<br/>- File management<br/>- CDN integration</small>"]
        end
        
        subgraph data ["Data Access Layer"]
            PrismaService["🗄️<br/>Prisma Service<br/><small>- Database connection<br/>- ORM operations<br/>- Transaction management</small>"]
        end
    end
    
    subgraph external ["External Services"]
        Database["🗄️<br/>PostgreSQL<br/><small>Cơ sở dữ liệu</small>"]
        VNPay["💳<br/>VNPay API"]
        Firebase["☁️<br/>Firebase Storage"]
    end
    
    %% Frontend to Controllers
    ManagerApp -->|"HTTPS/JSON"| AuthController
    ManagerApp -->|"HTTPS/JSON"| ProductController
    ManagerApp -->|"HTTPS/JSON"| UserController
    ManagerApp -->|"HTTPS/JSON"| ReportController
    
    POSApp -->|"HTTPS/JSON"| AuthController
    POSApp -->|"HTTPS/JSON"| OrderController
    POSApp -->|"HTTPS/JSON"| PaymentController
    POSApp -->|"HTTPS/JSON"| ProductController
    
    %% Controllers to Services
    AuthController --> AuthService
    OrderController --> OrderService
    ProductController --> ProductService
    PaymentController --> PaymentService
    PaymentController --> VNPayService
    UserController --> UserService
    ReportController --> OrderService
    ProductController --> FirebaseService
    
    %% Services to Data Layer
    AuthService --> PrismaService
    OrderService --> PrismaService
    ProductService --> PrismaService
    PaymentService --> PrismaService
    UserService --> PrismaService
    
    %% Data Layer to Database
    PrismaService --> Database
    
    %% External Services
    VNPayService --> VNPay
    FirebaseService --> Firebase
    VNPay -->|"Callback"| PaymentController
    
    %% Styling
    classDef frontend fill:#08427b,stroke:#052e56,stroke-width:2px,color:#fff
    classDef controller fill:#1168bd,stroke:#0b4884,stroke-width:2px,color:#fff
    classDef service fill:#2ea043,stroke:#1a7c37,stroke-width:2px,color:#fff
    classDef data fill:#bf8700,stroke:#9a6700,stroke-width:2px,color:#fff
    classDef external fill:#999999,stroke:#666666,stroke-width:2px,color:#fff
    
    class ManagerApp,POSApp frontend
    class AuthController,OrderController,ProductController,PaymentController,UserController,ReportController controller
    class AuthService,OrderService,ProductService,PaymentService,UserService,VNPayService,FirebaseService service
    class PrismaService data
    class Database,VNPay,Firebase external
```

---

## 4. Sơ đồ Database Schema - Cấu trúc Dữ liệu

```mermaid
erDiagram
    %% Database Schema - Hệ thống Cake POS
    
    ROLE {
        int role_id PK
        string name
        string description
        timestamp created_at
        timestamp updated_at
    }
    
    ACCOUNT {
        int account_id PK
        int role_id FK
        string username
        string password_hash
        boolean is_active
        boolean is_locked
        timestamp last_login
        timestamp created_at
        timestamp updated_at
    }
    
    MANAGER {
        int manager_id PK
        int account_id FK
        string last_name
        string first_name
        string gender
        string phone
        string email
        timestamp created_at
        timestamp updated_at
    }
    
    EMPLOYEE {
        int employee_id PK
        int account_id FK
        string position
        string last_name
        string first_name
        string gender
        string phone
        string email
        timestamp created_at
        timestamp updated_at
    }
    
    MEMBERSHIP_TYPE {
        int membership_type_id PK
        string type
        decimal discount_value
        int required_point
        string description
        timestamp valid_until
        boolean is_active
        timestamp created_at
        timestamp updated_at
    }
    
    CUSTOMER {
        int customer_id PK
        int membership_type_id FK
        int account_id FK
        string last_name
        string first_name
        string phone
        int current_points
        string gender
        timestamp created_at
        timestamp updated_at
    }
    
    CATEGORY {
        int category_id PK
        string name
        string description
        timestamp created_at
        timestamp updated_at
    }
    
    PRODUCT {
        int product_id PK
        int category_id FK
        string name
        string description
        boolean is_signature
        string image_path
        timestamp created_at
        timestamp updated_at
    }
    
    PRODUCT_SIZE {
        int size_id PK
        string name
        string unit
        int quantity
        string description
        timestamp created_at
        timestamp updated_at
    }
    
    PRODUCT_PRICE {
        int product_price_id PK
        int product_id FK
        int size_id FK
        int price
        boolean is_active
        timestamp created_at
        timestamp updated_at
    }
    
    ORDER {
        int order_id PK
        int customer_id FK
        int employee_id FK
        timestamp order_time
        int total_amount
        int final_amount
        string status
        string customize_note
        timestamp created_at
        timestamp updated_at
    }
    
    ORDER_PRODUCT {
        int order_product_id PK
        int order_id FK
        int product_price_id FK
        int quantity
        string option
        timestamp created_at
        timestamp updated_at
    }
    
    DISCOUNT {
        int discount_id PK
        string name
        string description
        string coupon_code
        decimal discount_value
        int min_required_order_value
        int max_discount_amount
        int min_required_product
        timestamp valid_from
        timestamp valid_until
        int current_uses
        int max_uses
        int max_uses_per_customer
        boolean is_active
        timestamp created_at
        timestamp updated_at
    }
    
    ORDER_DISCOUNT {
        int order_discount_id PK
        int order_id FK
        int discount_id FK
        int discount_amount
        timestamp created_at
        timestamp updated_at
    }
    
    PAYMENT_METHOD {
        int payment_method_id PK
        string name
        string description
        timestamp created_at
        timestamp updated_at
    }
    
    PAYMENT {
        int payment_id PK
        int order_id FK
        int payment_method_id FK
        string status
        decimal amount_paid
        decimal change_amount
        timestamp payment_time
        timestamp created_at
        timestamp updated_at
    }
    
    STORE {
        int store_id PK
        string name
        string address
        string phone
        time opening_time
        time closing_time
        string email
        date opening_date
        string tax_code
        timestamp created_at
        timestamp updated_at
    }
    
    %% Relationships
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

---

## Tổng kết Kiến trúc

### 🛠️ Công nghệ sử dụng:

#### Frontend:
- **Framework**: Next.js 15 với App Router
- **Language**: TypeScript cho type safety
- **UI Library**: Shadcn/UI + Radix UI components
- **Styling**: Tailwind CSS với responsive design
- **State Management**: Zustand cho global state
- **Forms**: React Hook Form + Zod validation

#### Backend:
- **Framework**: NestJS với decorators và dependency injection
- **Language**: TypeScript với strict mode
- **Database ORM**: Prisma với type-safe queries
- **Authentication**: JWT với role-based access control
- **Validation**: Class-validator cho DTO validation
- **Documentation**: Swagger/OpenAPI với tiếng Việt

#### Database:
- **Engine**: PostgreSQL với ACID properties
- **Migrations**: Prisma migrations
- **Indexing**: Optimized indexes cho performance

#### External Services:
- **Payment Gateway**: VNPay với webhook integration
- **File Storage**: Firebase Storage với CDN

### ✅ Ưu điểm kiến trúc:

1. **📦 Modular Design**: Tách biệt rõ ràng các tầng và modules
2. **🛡️ Type Safety**: TypeScript end-to-end với Prisma generated types
3. **🚀 Scalable**: Microservices-ready architecture
4. **🔒 Security**: JWT authentication với role-based authorization
5. **⚡ Performance**: Database indexing và caching strategies
6. **🔧 Maintainability**: Clean code principles và SOLID design patterns

### 🔄 Workflow chính:

#### Quy trình bán hàng:
1. **Đăng nhập**: Nhân viên đăng nhập vào POS
2. **Chọn sản phẩm**: Tìm và thêm sản phẩm vào đơn hàng
3. **Áp dụng khuyến mãi**: Nhập mã giảm giá (nếu có)
4. **Thanh toán**: Chọn phương thức (tiền mặt/VNPay)
5. **In hóa đơn**: Tự động tạo và in hóa đơn
6. **Cập nhật điểm**: Tích điểm cho khách hàng thành viên

#### Quy trình quản lý:
1. **Dashboard**: Xem tổng quan doanh thu và KPIs
2. **Quản lý sản phẩm**: CRUD operations với upload ảnh
3. **Quản lý nhân viên**: Tạo tài khoản và phân quyền
4. **Báo cáo**: Xuất báo cáo theo nhiều tiêu chí
5. **Cấu hình**: Thiết lập khuyến mãi và membership

Kiến trúc này đảm bảo hệ thống Cake POS hoạt động hiệu quả, bảo mật và có thể phát triển bền vững trong tương lai. 