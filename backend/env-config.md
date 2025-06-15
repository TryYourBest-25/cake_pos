# VNPay Environment Configuration

## Required Environment Variables

```bash
# VNPay Merchant Configuration
VNPAY_TMN_CODE=your_vnpay_tmn_code          # Mã merchant từ VNPay
VNPAY_SECRET_KEY=your_vnpay_secret_key      # Secret key từ VNPay
VNPAY_HOST=https://sandbox.vnpayment.vn     # Sandbox hoặc Production URL
VNPAY_TEST_MODE=true                        # true = sandbox, false = production

# URLs Configuration
API_BASE_URL=http://localhost:3000          # Base URL của backend API
FRONTEND_URL=http://localhost:3001          # Frontend URL để redirect user
VNPAY_RETURN_URL=http://localhost:3000/payments/vnpay/callback  # User redirect URL
```

## VNPay URL Types

### 1. **Return URL** (vnp_ReturnUrl)
- **Mục đích**: VNPay redirect user về trang web sau khi thanh toán
- **Endpoint**: `GET /payments/vnpay/callback`
- **URL**: `http://localhost:3000/payments/vnpay/callback`
- **Sử dụng**: User experience, hiển thị kết quả thanh toán cho user

### 2. **IPN URL** (Instant Payment Notification)
- **Mục đích**: VNPay gửi thông báo server-to-server về kết quả thanh toán  
- **Endpoint**: `POST /payments/vnpay/webhook`
- **URL**: `http://localhost:3000/payments/vnpay/webhook`
- **Sử dụng**: Cập nhật database, xử lý business logic
- **Cấu hình**: Phải cấu hình trong VNPay merchant portal

## VNPay Merchant Portal Configuration

Trong VNPay merchant portal, bạn cần cấu hình:

1. **Return URL**: `http://your-domain.com/payments/vnpay/callback`
2. **IPN URL**: `http://your-domain.com/payments/vnpay/webhook`

## Security Notes

- ✅ Cả Return URL và IPN URL đều verify signature
- ✅ IPN URL đảm bảo nhận thông báo ngay cả khi user không quay về
- ✅ Return URL cho user experience tốt
- ⚠️ **Luôn xử lý business logic trong IPN URL, không phụ thuộc vào Return URL**

## Flow

```
User pay on VNPay
     ↓
VNPay processes payment
     ↓
┌─────────────────┬─────────────────┐
│   Return URL    │    IPN URL      │
│  (User redirect)│ (Server notify) │
│       ↓         │       ↓         │
│ Show result     │ Update database │
│ to user         │ Send email      │
└─────────────────┴─────────────────┘
``` 