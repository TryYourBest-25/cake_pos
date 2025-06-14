# Firebase Storage Module

Module này cung cấp các chức năng upload, delete và quản lý ảnh sản phẩm sử dụng Firebase Storage.

## Cấu hình

### 1. Biến môi trường

Thêm các biến môi trường sau vào file `.env.development`:

```env
# Firebase Storage Configuration
FIREBASE_TYPE=service_account
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_PRIVATE_KEY_ID=your-private-key-id
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYour-Private-Key-Here\n-----END PRIVATE KEY-----\n"
FIREBASE_CLIENT_EMAIL=your-service-account@your-project.iam.gserviceaccount.com
FIREBASE_CLIENT_ID=your-client-id
FIREBASE_AUTH_URI=https://accounts.google.com/o/oauth2/auth
FIREBASE_TOKEN_URI=https://oauth2.googleapis.com/token
FIREBASE_AUTH_PROVIDER_X509_CERT_URL=https://www.googleapis.com/oauth2/v1/certs
FIREBASE_CLIENT_X509_CERT_URL=https://www.googleapis.com/oauth2/v1/certs/your-service-account%40your-project.iam.gserviceaccount.com
FIREBASE_STORAGE_BUCKET=your-project.appspot.com
```

### 2. Tạo Firebase Project

1. Truy cập [Firebase Console](https://console.firebase.google.com/)
2. Tạo project mới hoặc chọn project hiện có
3. Vào **Project Settings** > **Service accounts**
4. Tạo private key mới và download file JSON
5. Sử dụng thông tin từ file JSON để cấu hình biến môi trường

### 3. Cấu hình Storage Rules

Trong Firebase Console, vào **Storage** > **Rules** và cập nhật rules:

```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    // Cho phép đọc công khai
    match /{allPaths=**} {
      allow read: if true;
    }
    
    // Chỉ cho phép authenticated users upload/delete
    match /products/{imageId} {
      allow write: if request.auth != null;
    }
  }
}
```

## API Endpoints

### 1. Upload ảnh

**POST** `/firebase-storage/upload`

- **Content-Type**: `multipart/form-data`
- **Authorization**: Bearer token required
- **Roles**: admin, manager, employee

**Request Body:**
```
file: File (ảnh JPEG, PNG, WebP, tối đa 5MB)
fileName?: string (tùy chọn)
folder?: string (mặc định: "products")
```

**Response:**
```json
{
  "message": "Upload ảnh thành công",
  "imageUrl": "https://storage.googleapis.com/your-bucket/products/image.jpg"
}
```

### 2. Xóa ảnh

**DELETE** `/firebase-storage/delete`

- **Content-Type**: `application/json`
- **Authorization**: Bearer token required
- **Roles**: admin, manager, employee

**Request Body:**
```json
{
  "imageUrl": "https://storage.googleapis.com/your-bucket/products/image.jpg"
}
```

**Response:**
```json
{
  "message": "Xóa ảnh thành công",
  "success": true
}
```

### 3. Lấy danh sách ảnh

**GET** `/firebase-storage/list?folder=products`

- **Authorization**: Bearer token required
- **Roles**: admin, manager, employee

**Response:**
```json
{
  "message": "Lấy danh sách ảnh thành công",
  "images": [
    "https://storage.googleapis.com/your-bucket/products/image1.jpg",
    "https://storage.googleapis.com/your-bucket/products/image2.jpg"
  ],
  "count": 2
}
```

### 4. Cập nhật ảnh

**POST** `/firebase-storage/update`

- **Content-Type**: `multipart/form-data`
- **Authorization**: Bearer token required
- **Roles**: admin, manager, employee

**Request Body:**
```
file: File (ảnh mới)
oldImageUrl: string (URL ảnh cũ cần xóa)
fileName?: string (tùy chọn)
folder?: string (mặc định: "products")
```

**Response:**
```json
{
  "message": "Cập nhật ảnh thành công",
  "newImageUrl": "https://storage.googleapis.com/your-bucket/products/new-image.jpg",
  "oldImageUrl": "https://storage.googleapis.com/your-bucket/products/old-image.jpg"
}
```

### 5. Test connection

**GET** `/firebase-storage/test`

**Response:**
```json
{
  "message": "Firebase Storage controller đang hoạt động!",
  "status": "OK"
}
```

## Sử dụng trong Service khác

```typescript
import { FirebaseStorageService } from '../firebase-storage/firebase-storage.service';

@Injectable()
export class ProductService {
  constructor(
    private firebaseStorageService: FirebaseStorageService,
  ) {}

  async createProductWithImage(createProductDto: CreateProductDto, imageFile: Express.Multer.File) {
    // Upload ảnh trước
    const imageUrl = await this.firebaseStorageService.uploadProductImage(
      imageFile,
      `product-${Date.now()}`,
      'products'
    );

    // Tạo sản phẩm với URL ảnh
    const product = await this.prisma.product.create({
      data: {
        ...createProductDto,
        image_path: imageUrl,
      },
    });

    return product;
  }

  async updateProductImage(productId: number, newImageFile: Express.Multer.File) {
    const product = await this.prisma.product.findUnique({
      where: { product_id: productId },
    });

    if (!product) {
      throw new NotFoundException('Sản phẩm không tồn tại');
    }

    // Cập nhật ảnh (xóa ảnh cũ và upload ảnh mới)
    const newImageUrl = await this.firebaseStorageService.updateProductImage(
      product.image_path,
      newImageFile,
      `product-${productId}-${Date.now()}`,
      'products'
    );

    // Cập nhật database
    return await this.prisma.product.update({
      where: { product_id: productId },
      data: { image_path: newImageUrl },
    });
  }
}
```

## Lưu ý

1. **Bảo mật**: Private key phải được bảo vệ cẩn thận, không commit vào git
2. **Kích thước file**: Giới hạn tối đa 5MB cho mỗi ảnh
3. **Định dạng**: Chỉ chấp nhận JPEG, PNG, WebP
4. **Quyền truy cập**: Cần authentication và role phù hợp
5. **Error handling**: Service tự động xử lý lỗi và trả về message tiếng Việt
6. **Cleanup**: Khi xóa sản phẩm, nhớ xóa ảnh tương ứng để tránh lãng phí storage

## Troubleshooting

### Lỗi Firebase initialization
- Kiểm tra lại các biến môi trường
- Đảm bảo private key được format đúng (có `\n` cho line breaks)
- Kiểm tra quyền của service account

### Lỗi upload
- Kiểm tra kích thước và định dạng file
- Đảm bảo bucket name đúng
- Kiểm tra Storage Rules trong Firebase Console

### Lỗi delete
- Đảm bảo URL ảnh đúng format
- Kiểm tra file có tồn tại không
- Kiểm tra quyền delete trong Storage Rules 