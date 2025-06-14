import { Injectable, BadRequestException, InternalServerErrorException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as admin from 'firebase-admin';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class FirebaseStorageService {
  private bucket: admin.storage.Storage;

  constructor(private configService: ConfigService) {
    this.initializeFirebase();
  }

  private initializeFirebase() {
    try {
      // Kiểm tra xem Firebase đã được khởi tạo chưa
      if (!admin.apps.length) {
        const serviceAccount = require('./key.json');

        admin.initializeApp({
          credential: admin.credential.cert(serviceAccount as admin.ServiceAccount),
          storageBucket: this.configService.get<string>('FIREBASE_STORAGE_BUCKET'),
        });
      }

      this.bucket = admin.storage();
    } catch (error) {
      console.error('Firebase initialization error:', error);
      throw new InternalServerErrorException('Lỗi khởi tạo Firebase');
    }
  }

  /**
   * Upload ảnh sản phẩm lên Firebase Storage
   * @param file - File buffer từ multer
   * @param fileName - Tên file (optional, sẽ tự generate nếu không có)
   * @param folder - Thư mục lưu trữ (mặc định: 'products')
   * @returns URL công khai của ảnh đã upload
   */
  async uploadProductImage(
    file: Express.Multer.File,
    fileName?: string,
    folder: string = 'products'
  ): Promise<string> {
    try {
      // Validate file type
      const allowedMimeTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
      if (!allowedMimeTypes.includes(file.mimetype)) {
        throw new BadRequestException('Chỉ chấp nhận file ảnh định dạng JPEG, PNG, hoặc WebP');
      }

      // Validate file size (max 5MB)
      const maxSize = 5 * 1024 * 1024; // 5MB
      if (file.size > maxSize) {
        throw new BadRequestException('Kích thước file không được vượt quá 5MB');
      }

      // Generate unique filename if not provided
      const fileExtension = file.originalname.split('.').pop();
      const uniqueFileName = fileName || `${uuidv4()}.${fileExtension}`;
      const filePath = `${folder}/${uniqueFileName}`;

      // Get bucket reference
      const bucketRef = this.bucket.bucket();
      const fileRef = bucketRef.file(filePath);

      // Upload file
      await fileRef.save(file.buffer, {
        metadata: {
          contentType: file.mimetype,
          metadata: {
            originalName: file.originalname,
            uploadedAt: new Date().toISOString(),
          },
        },
      });

      // Make file publicly accessible
      await fileRef.makePublic();

      // Return public URL
      const publicUrl = `https://storage.googleapis.com/${bucketRef.name}/${filePath}`;
      return publicUrl;

    } catch (error) {
      console.error('Upload error:', error);
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new InternalServerErrorException('Lỗi khi upload ảnh');
    }
  }

  /**
   * Xóa ảnh sản phẩm từ Firebase Storage
   * @param imageUrl - URL của ảnh cần xóa
   * @returns boolean - true nếu xóa thành công
   */
  async deleteProductImage(imageUrl: string): Promise<boolean> {
    try {
      // Extract file path from URL
      const bucketName = this.configService.get<string>('FIREBASE_STORAGE_BUCKET');
      const baseUrl = `https://storage.googleapis.com/${bucketName}/`;
      
      if (!imageUrl.startsWith(baseUrl)) {
        throw new BadRequestException('URL ảnh không hợp lệ');
      }

      const filePath = imageUrl.replace(baseUrl, '');
      
      // Get bucket reference
      const bucketRef = this.bucket.bucket();
      const fileRef = bucketRef.file(filePath);

      // Check if file exists
      const [exists] = await fileRef.exists();
      if (!exists) {
        throw new BadRequestException('File không tồn tại');
      }

      // Delete file
      await fileRef.delete();
      return true;

    } catch (error) {
      console.error('Delete error:', error);
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new InternalServerErrorException('Lỗi khi xóa ảnh');
    }
  }

  /**
   * Lấy danh sách tất cả ảnh trong thư mục
   * @param folder - Thư mục cần lấy danh sách
   * @returns Array URL của các ảnh
   */
  async listProductImages(folder: string = 'products'): Promise<string[]> {
    try {
      const bucketRef = this.bucket.bucket();
      const [files] = await bucketRef.getFiles({
        prefix: `${folder}/`,
      });

      const bucketName = this.configService.get<string>('FIREBASE_STORAGE_BUCKET');
      const imageUrls = files.map(file => 
        `https://storage.googleapis.com/${bucketName}/${file.name}`
      );

      return imageUrls;

    } catch (error) {
      console.error('List images error:', error);
      throw new InternalServerErrorException('Lỗi khi lấy danh sách ảnh');
    }
  }

  /**
   * Cập nhật ảnh sản phẩm (xóa ảnh cũ và upload ảnh mới)
   * @param oldImageUrl - URL ảnh cũ cần xóa
   * @param newFile - File ảnh mới
   * @param fileName - Tên file mới (optional)
   * @param folder - Thư mục lưu trữ
   * @returns URL của ảnh mới
   */
  async updateProductImage(
    oldImageUrl: string,
    newFile: Express.Multer.File,
    fileName?: string,
    folder: string = 'products'
  ): Promise<string> {
    try {
      // Upload ảnh mới trước
      const newImageUrl = await this.uploadProductImage(newFile, fileName, folder);

      // Xóa ảnh cũ (nếu có)
      if (oldImageUrl) {
        try {
          await this.deleteProductImage(oldImageUrl);
        } catch (error) {
          console.warn('Warning: Could not delete old image:', error.message);
          // Không throw error ở đây vì ảnh mới đã upload thành công
        }
      }

      return newImageUrl;

    } catch (error) {
      console.error('Update image error:', error);
      throw error; // Re-throw để controller xử lý
    }
  }
} 