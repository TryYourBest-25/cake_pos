# Hệ Thống Quản Lý Cửa Hàng (Manager)

## Tổng Quan
Ứng dụng web quản lý cửa hàng được xây dựng bằng Next.js 15, React 19 và Tailwind CSS 4, cung cấp giao diện hiện đại và trải nghiệm người dùng mượt mà cho việc quản lý hoạt động kinh doanh.

## Đề Xuất Thiết Kế UI

### 1. Layout Tổng Thể

#### Sidebar Navigation (Menu Bên)
- **Dashboard** - Tổng quan và thống kê
- **Người Dùng**:
  - Quản lý:
    - Chi tiết người dùng
  - Nhân viên:
    - Chi tiết nhân viên
  - Khách Hàng: 
    - Chi tiết khách hàng
- **Sản Phẩm**
  - Sản phẩm
    - Chi tiết sản phẩm
  - Danh mục
    - Danh mục sản phẩm
  - Kích thước sản phẩm
    - Chi tiết kích thước sản phẩm
- **Khuyến mãi**
  - Chương trình khuyến mãi:
    - Chi tiết chương trình khuyến mãi
  - Chương trình thành viên:
    - Chi tiết chương trình thành viên
- **Đơn Hàng**:
  - Đã Hoàn Thành
  - Đang Xử Lý
  - Đã Hủy
- **Báo Cáo**
  - Doanh thu
  - Sản phẩm bán chạy
  - Thống kê khách hàng
- **Cài Đặt**
  - Thông tin cửa hàng
  - Phương thức thanh toán
  - Cấu hình hệ thống

#### Header (Thanh Trên)
- Logo cửa hàng
- Breadcrumb navigation
- Tìm kiếm nhanh
- Thông báo
- Avatar và menu người dùng
- Nút toggle sidebar (mobile)

#### Main Content Area
- Responsive design với grid system
- Loading states và skeleton screens
- Error boundaries
- Toast notifications

### 2. Các Trang Chính

#### Dashboard (Trang Chủ)
```
┌─────────────────────────────────────────────────────────┐
│ Header với thống kê tổng quan (Cards)                    │
│ ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐       │
│ │Doanh thu│ │Đơn hàng │ │Sản phẩm │ │Khách    │       │
│ │hôm nay  │ │mới      │ │bán      │ │hàng mới │       │
│ └─────────┘ └─────────┘ └─────────┘ └─────────┘       │
├─────────────────────────────────────────────────────────┤
│ Charts và Biểu đồ                                       │
│ ┌─────────────────────┐ ┌─────────────────────┐       │
│ │Biểu đồ doanh thu    │ │Top sản phẩm bán chạy│       │
│ │theo thời gian       │ │                     │       │
│ └─────────────────────┘ └─────────────────────┘       │
├─────────────────────────────────────────────────────────┤
│ Hoạt động gần đây                                       │
│ • Đơn hàng #123 đã được tạo                             │
│ • Sản phẩm ABC đã hết hàng                              │
│ • Khách hàng XYZ đã đăng ký                             │
└─────────────────────────────────────────────────────────┘
```

#### Quản Lý Sản Phẩm
- **Danh sách sản phẩm**: Table với search, filter, pagination
- **Form thêm/sửa**: Upload hình ảnh, rich text editor cho mô tả
- **Quản lý danh mục**: Tree structure với drag & drop
- **Quản lý kho**: Real-time inventory tracking

#### Quản Lý Đơn Hàng
- **Kanban board**: Drag & drop giữa các trạng thái
- **Chi tiết đơn hàng**: Timeline của trạng thái, thông tin shipping
- **In hóa đơn**: PDF generation
- **Tracking**: Integration với shipping providers

#### Quản Lý Khách Hàng
- **Customer profiles**: 360-degree view
- **Purchase history**: Visual timeline
- **Loyalty program**: Points và rewards
- **Communication**: Email templates, SMS

### 3. Thiết Kế Responsive

#### Desktop (>1024px)
- Full sidebar navigation
- Multi-column layouts
- Advanced data tables
- Rich charts và visualizations

#### Tablet (768px - 1024px)
- Collapsible sidebar
- 2-column layouts
- Touch-friendly controls
- Swipe gestures

#### Mobile (<768px)
- Bottom navigation
- Single column layout
- Mobile-first forms
- Pull-to-refresh
- Offline capabilities

### 4. Theme và Design System

#### Color Palette
```css
/* Primary Colors */
--primary-50: #eff6ff;
--primary-500: #3b82f6;
--primary-600: #2563eb;
--primary-900: #1e3a8a;

/* Success/Error/Warning */
--success: #10b981;
--error: #ef4444;
--warning: #f59e0b;

/* Neutral */
--gray-50: #f9fafb;
--gray-100: #f3f4f6;
--gray-500: #6b7280;
--gray-900: #111827;
```

#### Typography
- **Font Primary**: Inter/Geist Sans (hiện đại, dễ đọc)
- **Font Mono**: Geist Mono (cho code, số liệu)
- **Font Sizes**: 12px, 14px, 16px, 18px, 24px, 32px

#### Components
- **Buttons**: Primary, Secondary, Ghost, Destructive
- **Forms**: Input, Select, Checkbox, Radio, Switch
- **Data Display**: Table, Card, Badge, Avatar
- **Feedback**: Alert, Toast, Modal, Tooltip
- **Navigation**: Breadcrumb, Pagination, Tabs

### 5. Tính Năng UX/UI Nâng Cao

#### Dark Mode
- System preference detection
- Toggle trong user menu
- Smooth transitions

#### Internationalization (i18n)
- Hỗ trợ tiếng Việt và tiếng Anh
- RTL support (nếu cần)
- Date/number formatting theo locale

#### Accessibility
- WCAG 2.1 AA compliance
- Keyboard navigation
- Screen reader support
- High contrast mode

#### Performance
- Code splitting
- Image optimization
- Lazy loading
- Service workers cho offline
- Real-time updates với WebSocket

### 6. Tech Stack Đề Xuất

#### Frontend
- **Framework**: Next.js 15 (App Router)
- **UI Library**: Shadcn/ui + Radix UI
- **Styling**: Tailwind CSS 4
- **Icons**: Lucide React
- **Charts**: Recharts/Chart.js
- **Forms**: React Hook Form + Zod
- **State Management**: Zustand/Redux Toolkit

#### Backend Integration
- **API**: REST/GraphQL
- **Authentication**: NextAuth.js
- **Real-time**: Socket.io/Server-Sent Events
- **File Upload**: Cloudinary/AWS S3

### 7. Cấu Trúc Thư Mục Đề Xuất

```
src/
├── app/                    # Next.js App Router
│   ├── (auth)/            # Auth routes
│   ├── (dashboard)/       # Main app routes
│   ├── api/               # API routes
│   └── globals.css
├── components/            # Reusable components
│   ├── ui/               # Base UI components
│   ├── forms/            # Form components
│   ├── charts/           # Chart components
│   └── layout/           # Layout components
├── lib/                  # Utilities
│   ├── utils.ts          # Helper functions
│   ├── validations.ts    # Zod schemas
│   └── constants.ts      # App constants
├── hooks/                # Custom hooks
├── types/                # TypeScript types
└── stores/               # State management
```

### 8. Roadmap Phát Triển

#### Phase 1 (MVP)
- [ ] Authentication & Authorization
- [ ] Dashboard cơ bản
- [ ] Quản lý sản phẩm
- [ ] Quản lý đơn hàng cơ bản

#### Phase 2
- [ ] Quản lý khách hàng
- [ ] Báo cáo nâng cao
- [ ] Mobile app (React Native)
- [ ] API cho third-party

#### Phase 3
- [ ] AI recommendations
- [ ] Advanced analytics
- [ ] Multi-store support
- [ ] Marketplace integration

## Hướng Dẫn Phát Triển

### Cài Đặt
```bash
npm install
npm run dev
```

### Coding Standards
- Tuân theo TypeScript strict mode
- Sử dụng ESLint + Prettier
- Functional components với hooks
- Error boundaries cho error handling
- Unit tests với Jest + Testing Library

### Commit Convention
```
feat: thêm tính năng mới
fix: sửa lỗi
docs: cập nhật documentation
style: formatting, missing semicolons
refactor: refactoring code
test: thêm tests
chore: maintenance tasks
```

---

**Ghi chú**: Thiết kế này ưu tiên trải nghiệm người dùng, hiệu suất và khả năng mở rộng. Tất cả các tính năng được thiết kế responsive và tuân thủ các best practices của Next.js và React.
