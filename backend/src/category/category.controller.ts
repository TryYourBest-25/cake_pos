import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  ParseIntPipe,
  HttpCode,
  HttpStatus,
  UseGuards,
  Query,
} from '@nestjs/common';
import { CategoryService } from './category.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { BulkDeleteCategoryDto } from './dto/bulk-delete-category.dto';
import { PaginationDto, PaginatedResult, PaginationMetadata } from '../common/dto/pagination.dto';
import { category } from '../generated/prisma/client'; // Đã import
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiBody,
  ApiBearerAuth,
  ApiQuery,
  ApiExtraModels,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { ROLES } from '../auth/constants/roles.constant';

@ApiTags('categories')
@Controller('categories')
@ApiBearerAuth()
@ApiExtraModels(PaginationMetadata)
export class CategoryController {
  constructor(private readonly categoryService: CategoryService) {}

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(ROLES.MANAGER, ROLES.STAFF)
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ 
    summary: 'Tạo danh mục mới - Chỉ MANAGER và STAFF',
    description: 'Tạo một danh mục sản phẩm mới trong hệ thống với tên và mô tả'
  })
  @ApiBody({ type: CreateCategoryDto })
  @ApiResponse({
    status: 201,
    description: 'Danh mục được tạo thành công',
    schema: {
      type: 'object',
      properties: {
        category_id: { type: 'number', description: 'ID của danh mục' },
        name: { type: 'string', description: 'Tên danh mục' },
        description: { type: 'string', description: 'Mô tả danh mục', nullable: true },
        is_active: { type: 'boolean', description: 'Trạng thái hoạt động' },
        created_at: { type: 'string', format: 'date-time', description: 'Thời gian tạo' },
        updated_at: { type: 'string', format: 'date-time', description: 'Thời gian cập nhật' }
      }
    }
  })
  @ApiResponse({ 
    status: 400, 
    description: 'Yêu cầu không hợp lệ - Dữ liệu đầu vào không đúng định dạng' 
  })
  @ApiResponse({ 
    status: 401, 
    description: 'Chưa xác thực - Token không hợp lệ' 
  })
  @ApiResponse({
    status: 403,
    description: 'Không có quyền truy cập - Chỉ MANAGER và STAFF mới có thể tạo danh mục',
  })
  @ApiResponse({
    status: 409,
    description: 'Xung đột dữ liệu - Tên danh mục đã tồn tại',
  })
  async create(
    @Body() createCategoryDto: CreateCategoryDto,
  ): Promise<category> {
    return this.categoryService.create(createCategoryDto);
  }

  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(ROLES.MANAGER, ROLES.STAFF, ROLES.CUSTOMER)
  @ApiOperation({ 
    summary: 'Lấy danh sách danh mục với phân trang - Tất cả role',
    description: 'Trả về danh sách tất cả danh mục sản phẩm với hỗ trợ phân trang'
  })
  @ApiQuery({
    name: 'page',
    required: false,
    type: Number,
    description: 'Số trang (mặc định: 1)',
    example: 1
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    type: Number,
    description: 'Số lượng bản ghi trên mỗi trang (mặc định: 10)',
    example: 10
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Danh sách danh mục được phân trang thành công',
    schema: {
      type: 'object',
      properties: {
        data: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              category_id: { type: 'number' },
              name: { type: 'string' },
              description: { type: 'string', nullable: true },
              is_active: { type: 'boolean' },
              created_at: { type: 'string', format: 'date-time' },
              updated_at: { type: 'string', format: 'date-time' }
            }
          }
        },
        pagination: {
          $ref: '#/components/schemas/PaginationMetadata',
        }
      }
    }
  })
  @ApiResponse({ 
    status: 401, 
    description: 'Chưa xác thực - Token không hợp lệ' 
  })
  async findAll(
    @Query() paginationDto: PaginationDto,
  ): Promise<PaginatedResult<category>> {
    return this.categoryService.findAll(paginationDto);
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(ROLES.MANAGER, ROLES.STAFF, ROLES.CUSTOMER)
  @ApiOperation({ 
    summary: 'Lấy thông tin danh mục theo ID - Tất cả role',
    description: 'Lấy thông tin chi tiết của một danh mục cụ thể bằng ID'
  })
  @ApiParam({ 
    name: 'id', 
    description: 'ID của danh mục cần lấy thông tin', 
    type: Number,
    example: 1
  })
  @ApiResponse({
    status: 200,
    description: 'Thông tin chi tiết danh mục',
    schema: {
      type: 'object',
      properties: {
        category_id: { type: 'number', description: 'ID của danh mục' },
        name: { type: 'string', description: 'Tên danh mục' },
        description: { type: 'string', description: 'Mô tả danh mục', nullable: true },
        is_active: { type: 'boolean', description: 'Trạng thái hoạt động' },
        created_at: { type: 'string', format: 'date-time', description: 'Thời gian tạo' },
        updated_at: { type: 'string', format: 'date-time', description: 'Thời gian cập nhật' }
      }
    }
  })
  @ApiResponse({ 
    status: 401, 
    description: 'Chưa xác thực - Token không hợp lệ' 
  })
  @ApiResponse({ 
    status: 404, 
    description: 'Không tìm thấy danh mục với ID được cung cấp' 
  })
  async findOne(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<category | null> {
    return this.categoryService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(ROLES.MANAGER, ROLES.STAFF)
  @ApiOperation({ 
    summary: 'Cập nhật thông tin danh mục - Chỉ MANAGER và STAFF',
    description: 'Cập nhật thông tin của một danh mục cụ thể như tên, mô tả hoặc trạng thái hoạt động'
  })
  @ApiParam({ 
    name: 'id', 
    description: 'ID của danh mục cần cập nhật', 
    type: Number,
    example: 1
  })
  @ApiBody({ type: UpdateCategoryDto })
  @ApiResponse({
    status: 200,
    description: 'Danh mục được cập nhật thành công',
    schema: {
      type: 'object',
      properties: {
        category_id: { type: 'number', description: 'ID của danh mục' },
        name: { type: 'string', description: 'Tên danh mục đã cập nhật' },
        description: { type: 'string', description: 'Mô tả danh mục đã cập nhật', nullable: true },
        is_active: { type: 'boolean', description: 'Trạng thái hoạt động đã cập nhật' },
        updated_at: { type: 'string', format: 'date-time', description: 'Thời gian cập nhật' }
      }
    }
  })
  @ApiResponse({ 
    status: 400, 
    description: 'Yêu cầu không hợp lệ - Dữ liệu đầu vào không đúng định dạng' 
  })
  @ApiResponse({ 
    status: 401, 
    description: 'Chưa xác thực - Token không hợp lệ' 
  })
  @ApiResponse({
    status: 403,
    description: 'Không có quyền truy cập - Chỉ MANAGER và STAFF mới có thể cập nhật danh mục',
  })
  @ApiResponse({ 
    status: 404, 
    description: 'Không tìm thấy danh mục với ID được cung cấp' 
  })
  @ApiResponse({
    status: 409,
    description: 'Xung đột dữ liệu - Tên danh mục đã tồn tại',
  })
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateCategoryDto: UpdateCategoryDto,
  ): Promise<category> {
    return this.categoryService.update(id, updateCategoryDto);
  }

  @Delete('bulk')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(ROLES.MANAGER)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Xóa nhiều danh mục cùng lúc - Chỉ MANAGER',
    description: 'Xóa nhiều danh mục cùng lúc. Các danh mục có sản phẩm liên quan sẽ không thể xóa và sẽ được báo lỗi',
  })
  @ApiBody({ type: BulkDeleteCategoryDto })
  @ApiResponse({
    status: 200,
    description: 'Quá trình xóa hàng loạt hoàn thành với kết quả chi tiết',
    schema: {
      type: 'object',
      properties: {
        deleted: {
          type: 'array',
          items: { type: 'number' },
          description: 'Danh sách ID các danh mục đã xóa thành công'
        },
        failed: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              id: { type: 'number', description: 'ID danh mục không thể xóa' },
              reason: { type: 'string', description: 'Lý do không thể xóa' }
            }
          },
          description: 'Danh sách các danh mục không thể xóa và lý do'
        },
        summary: {
          type: 'object',
          properties: {
            total: { type: 'number', description: 'Tổng số danh mục được yêu cầu xóa' },
            success: { type: 'number', description: 'Số danh mục xóa thành công' },
            failed: { type: 'number', description: 'Số danh mục không thể xóa' }
          }
        }
      }
    }
  })
  @ApiResponse({ 
    status: 400, 
    description: 'Yêu cầu không hợp lệ - Danh sách ID không đúng định dạng' 
  })
  @ApiResponse({ 
    status: 401, 
    description: 'Chưa xác thực - Token không hợp lệ' 
  })
  @ApiResponse({
    status: 403,
    description: 'Không có quyền truy cập - Chỉ MANAGER mới có thể xóa danh mục',
  })
  async bulkDelete(@Body() bulkDeleteDto: BulkDeleteCategoryDto): Promise<{
    deleted: number[];
    failed: { id: number; reason: string }[];
    summary: { total: number; success: number; failed: number };
  }> {
    return this.categoryService.bulkDelete(bulkDeleteDto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(ROLES.MANAGER)
  @ApiOperation({ 
    summary: 'Xóa danh mục theo ID - Chỉ MANAGER',
    description: 'Xóa vĩnh viễn một danh mục khỏi hệ thống. Lưu ý: Không thể xóa danh mục đang có sản phẩm liên quan'
  })
  @ApiParam({ 
    name: 'id', 
    description: 'ID của danh mục cần xóa', 
    type: Number,
    example: 1
  })
  @ApiResponse({
    status: 200,
    description: 'Danh mục được xóa thành công',
    schema: {
      type: 'object',
      properties: {
        category_id: { type: 'number', description: 'ID của danh mục đã xóa' },
        name: { type: 'string', description: 'Tên danh mục đã xóa' },
        message: { type: 'string', description: 'Thông báo xác nhận xóa thành công' }
      }
    }
  })
  @ApiResponse({ 
    status: 401, 
    description: 'Chưa xác thực - Token không hợp lệ' 
  })
  @ApiResponse({
    status: 403,
    description: 'Không có quyền truy cập - Chỉ MANAGER mới có thể xóa danh mục',
  })
  @ApiResponse({ 
    status: 404, 
    description: 'Không tìm thấy danh mục với ID được cung cấp' 
  })
  @ApiResponse({ 
    status: 409, 
    description: 'Xung đột dữ liệu - Danh mục đang được sử dụng bởi các sản phẩm khác' 
  })
  async remove(@Param('id', ParseIntPipe) id: number): Promise<category> {
    return this.categoryService.remove(id);
  }

  @Get('admin/test')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(ROLES.MANAGER)
  @ApiOperation({
    summary: 'Kiểm tra hoạt động của Category Controller - Chỉ MANAGER',
    description: 'Endpoint để kiểm tra xem Category Controller có hoạt động bình thường không (smoke test)',
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Kiểm tra thành công',
    schema: {
      type: 'object',
      properties: {
        message: { 
          type: 'string', 
          description: 'Thông báo xác nhận controller hoạt động bình thường',
          example: 'Category controller is working!'
        }
      }
    }
  })
  @ApiResponse({ 
    status: 401, 
    description: 'Chưa xác thực - Token không hợp lệ' 
  })
  @ApiResponse({
    status: 403,
    description: 'Không có quyền truy cập - Chỉ MANAGER mới có thể thực hiện kiểm tra',
  })
  adminTest(): { message: string } {
    return { message: 'Category controller is working!' };
  }
}
