import {
  Controller,
  Post,
  Delete,
  Get,
  Body,
  Param,
  UseInterceptors,
  UploadedFile,
  HttpCode,
  HttpStatus,
  BadRequestException,
  UseGuards,
  Query,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiTags, ApiOperation, ApiResponse, ApiConsumes, ApiBody, ApiBearerAuth } from '@nestjs/swagger';
import { FirebaseStorageService } from './firebase-storage.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { ROLES } from '../auth/constants/roles.constant';
import { UploadImageDto } from './dto/upload-image.dto';
import { DeleteImageDto } from './dto/delete-image.dto';
import { UpdateImageDto } from './dto/update-image.dto';

@ApiTags('Firebase Storage')
@Controller('firebase-storage')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class FirebaseStorageController {
  constructor(private readonly firebaseStorageService: FirebaseStorageService) {}

  @Post('upload')
  @HttpCode(HttpStatus.CREATED)
  @UseInterceptors(FileInterceptor('file'))
  @ApiOperation({ summary: 'Upload ảnh sản phẩm lên Firebase Storage' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    description: 'File ảnh cần upload',
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
          description: 'File ảnh (JPEG, PNG, WebP, tối đa 5MB)',
        },
                 fileName: {
           type: 'string',
           description: 'Tên file tùy chọn (sẽ tự generate nếu không có)',
         },
         folder: {
           type: 'string',
           description: 'Thư mục lưu trữ (mặc định: products)',
         },
      },
    },
  })
  @ApiResponse({
    status: 201,
    description: 'Upload thành công',
    schema: {
      type: 'object',
      properties: {
        message: { type: 'string' },
        imageUrl: { type: 'string' },
      },
    },
  })
  @ApiResponse({ status: 400, description: 'File không hợp lệ hoặc quá lớn' })
  @ApiResponse({ status: 401, description: 'Chưa xác thực' })
  @ApiResponse({ status: 403, description: 'Không có quyền truy cập' })
  @Roles(ROLES.MANAGER, ROLES.STAFF)
  async uploadImage(
    @UploadedFile() file: Express.Multer.File,
    @Body('fileName') fileName?: string,
    @Body('folder') folder?: string,
    @CurrentUser() user?: any,
  ) {
    if (!file) {
      throw new BadRequestException('Vui lòng chọn file để upload');
    }

    const imageUrl = await this.firebaseStorageService.uploadProductImage(
      file,
      fileName,
      folder || 'products',
    );

    return {
      message: 'Upload ảnh thành công',
      imageUrl,
    };
  }

  @Delete('delete')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Xóa ảnh sản phẩm từ Firebase Storage' })
  @ApiBody({
    description: 'URL ảnh cần xóa',
    schema: {
      type: 'object',
      properties: {
        imageUrl: {
          type: 'string',
          description: 'URL đầy đủ của ảnh cần xóa',
          example: 'https://storage.googleapis.com/your-bucket/products/image.jpg',
        },
      },
      required: ['imageUrl'],
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Xóa ảnh thành công',
    schema: {
      type: 'object',
      properties: {
        message: { type: 'string' },
        success: { type: 'boolean' },
      },
    },
  })
  @ApiResponse({ status: 400, description: 'URL ảnh không hợp lệ hoặc file không tồn tại' })
  @ApiResponse({ status: 401, description: 'Chưa xác thực' })
  @ApiResponse({ status: 403, description: 'Không có quyền truy cập' })
  @Roles(ROLES.MANAGER, ROLES.STAFF)
  async deleteImage(
    @Body('imageUrl') imageUrl: string,
    @CurrentUser() user?: any,
  ) {
    if (!imageUrl) {
      throw new BadRequestException('Vui lòng cung cấp URL ảnh cần xóa');
    }

    const success = await this.firebaseStorageService.deleteProductImage(imageUrl);

    return {
      message: 'Xóa ảnh thành công',
      success,
    };
  }

  @Get('list')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Lấy danh sách tất cả ảnh trong thư mục' })
  @ApiResponse({
    status: 200,
    description: 'Lấy danh sách ảnh thành công',
    schema: {
      type: 'object',
      properties: {
        message: { type: 'string' },
        images: {
          type: 'array',
          items: { type: 'string' },
        },
        count: { type: 'number' },
      },
    },
  })
  @ApiResponse({ status: 401, description: 'Chưa xác thực' })
  @ApiResponse({ status: 403, description: 'Không có quyền truy cập' })
  @Roles(ROLES.MANAGER, ROLES.STAFF)
  async listImages(
    @Query('folder') folder: string = 'products',
    @CurrentUser() user?: any,
  ) {
    const images = await this.firebaseStorageService.listProductImages(folder);

    return {
      message: 'Lấy danh sách ảnh thành công',
      images,
      count: images.length,
    };
  }

  @Post('update')
  @HttpCode(HttpStatus.OK)
  @UseInterceptors(FileInterceptor('file'))
  @ApiOperation({ summary: 'Cập nhật ảnh sản phẩm (xóa ảnh cũ và upload ảnh mới)' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    description: 'File ảnh mới và URL ảnh cũ',
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
          description: 'File ảnh mới (JPEG, PNG, WebP, tối đa 5MB)',
        },
                 oldImageUrl: {
           type: 'string',
           description: 'URL ảnh cũ cần xóa',
         },
         fileName: {
           type: 'string',
           description: 'Tên file mới tùy chọn',
         },
         folder: {
           type: 'string',
           description: 'Thư mục lưu trữ (mặc định: products)',
         },
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Cập nhật ảnh thành công',
    schema: {
      type: 'object',
      properties: {
        message: { type: 'string' },
        newImageUrl: { type: 'string' },
        oldImageUrl: { type: 'string' },
      },
    },
  })
  @ApiResponse({ status: 400, description: 'File không hợp lệ hoặc thiếu thông tin' })
  @ApiResponse({ status: 401, description: 'Chưa xác thực' })
  @ApiResponse({ status: 403, description: 'Không có quyền truy cập' })
  @Roles(ROLES.MANAGER, ROLES.STAFF)
  async updateImage(
    @UploadedFile() file: Express.Multer.File,
    @Body('oldImageUrl') oldImageUrl: string,
    @Body('fileName') fileName?: string,
    @Body('folder') folder?: string,
    @CurrentUser() user?: any,
  ) {
    if (!file) {
      throw new BadRequestException('Vui lòng chọn file ảnh mới để upload');
    }

    if (!oldImageUrl) {
      throw new BadRequestException('Vui lòng cung cấp URL ảnh cũ cần thay thế');
    }

    const newImageUrl = await this.firebaseStorageService.updateProductImage(
      oldImageUrl,
      file,
      fileName,
      folder || 'products',
    );

    return {
      message: 'Cập nhật ảnh thành công',
      newImageUrl,
      oldImageUrl,
    };
  }

  @Get('test')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Test Firebase Storage connection' })
  @ApiResponse({
    status: 200,
    description: 'Test thành công',
    schema: {
      type: 'object',
      properties: {
        message: { type: 'string' },
        status: { type: 'string' },
      },
    },
  })
  async testConnection() {
    return {
      message: 'Firebase Storage controller đang hoạt động!',
      status: 'OK',
    };
  }
} 